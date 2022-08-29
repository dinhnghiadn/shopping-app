import { Repository } from 'typeorm'
import { Order } from '../../models/entities/Order.entity'
import { User } from '../../models/entities/User.entity'
import { OrderStatus, PaymentMethod, PaymentStatus } from '../../utils/common/enum'
import { sendPaymentEmail } from '../../utils/common/email'
import { Product } from '../../models/entities/Product.entity'
import Stripe from 'stripe'

const { HOST, PORT } = process.env

export class OrderService {
    constructor(
        public orderRepository: Repository<Order>,
        public productRepository: Repository<Product>,
        public userRepository: Repository<User>
    ) {}
    stripe = new Stripe(process.env.STRIPE_KEY as string, { apiVersion: '2022-08-01' })

    async complete(orderId: number, user: User) {
        try {
            let order = await this.orderRepository
                .createQueryBuilder('order')
                .leftJoinAndSelect('order.user', 'user')
                .leftJoinAndSelect('order.products', 'product')
                .where('order.id = :id', { id: orderId })
                .andWhere('user.id = :userId', { userId: user.id })
                .getOne()
            if (!order) {
                return {
                    success: false,
                    status: 404,
                    message: 'Order not found!',
                }
            }
            if (order.status !== OrderStatus.NotConfirmed) {
                return {
                    success: false,
                    status: 400,
                    message: 'Order must be in not confirmed state!',
                }
            }
            const products: Product[] = []
            let paymentUrl
            for (const orderProduct of order.products) {
                const product = await this.productRepository.findOneOrFail({
                    where: { id: orderProduct.productId },
                })

                if (product.quantity < orderProduct.quantity) {
                    return {
                        success: false,
                        status: 400,
                        message: `Exceed product ${product.name} quantity in order. Please try again !`,
                    }
                }
                product.quantity = product.quantity - orderProduct.quantity
                products.push(product)
            }
            await this.productRepository.save(products)
            //TODO : add route to edit items in order (after quality check fail)
            if (order.paymentMethod === PaymentMethod.Cash) {
                if (!user.profile) {
                    return {
                        success: false,
                        status: 400,
                        message: 'Please complete your profile first!',
                    }
                }
                order.paymentStatus = PaymentStatus.Pending
            } else {
                const session = await this.stripe.checkout.sessions.create({
                    payment_method_types: ['card'],
                    line_items: order.products.map((item) => {
                        const product = products.find(
                            (product) => product.id === item.productId
                        )

                        return {
                            price_data: {
                                currency: 'usd',
                                product_data: {
                                    name: product!.name,
                                },
                                unit_amount: product!.price,
                            },
                            quantity: item.quantity,
                        }
                    }),
                    mode: 'payment',
                    success_url: `http://${HOST}:${PORT}/success-payment.html`,
                    cancel_url: `http://${HOST}:${PORT}/cancel-payment.html`,
                })
                order.paymentStatus = PaymentStatus.Pending
                paymentUrl = session.url
            }
            order.status = OrderStatus.Pending
            order = await this.orderRepository.save(order)

            await sendPaymentEmail(user.email, order, paymentUrl)
            return {
                success: true,
                status: 200,
                message: 'Payment successfully!',
                resource: {
                    order,
                    url: paymentUrl,
                },
            }
        } catch (e) {
            return {
                success: false,
                status: 500,
                message: 'Error occur!',
            }
        }
    }
}
