import { EntityManager, Repository } from 'typeorm'
import { Order } from '../../models/entities/Order.entity'
import { User } from '../../models/entities/User.entity'
import { OrderStatus, PaymentMethod, PaymentStatus } from '../../utils/common/enum'
import { sendPaymentEmail } from '../../utils/common/email'
import { Product } from '../../models/entities/Product.entity'
import Stripe from 'stripe'
import * as jwt from 'jsonwebtoken'
import { JwtPayload } from 'jsonwebtoken'
import { ErrorResponse, SuccessResponse } from '../../utils/common/interfaces'

const { HOST, PORT, JWT_SECRET } = process.env

export class OrderService {
    constructor(
        public orderRepository: Repository<Order>,
        public productRepository: Repository<Product>,
        public userRepository: Repository<User>,
        private entityManager: EntityManager
    ) {}
    stripe = new Stripe(process.env.STRIPE_KEY as string, { apiVersion: '2022-08-01' })

    async complete(
        orderId: number,
        user: User
    ): Promise<SuccessResponse | ErrorResponse> {
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
            let paymentUrl: string = ''
            // Start transaction
            await this.entityManager.transaction(async (transactionalEntityManager) => {
                try {
                    for (const orderProduct of order!.products) {
                        const product = await transactionalEntityManager.findOneOrFail(
                            Product,
                            {
                                where: { id: orderProduct.productId },
                            }
                        )
                        if (product.quantity < orderProduct.quantity) {
                            return {
                                success: false,
                                status: 400,
                                message: `Exceed product ${product.name} quantity in order. Please try again !`,
                            }
                        }
                        // product.quantity = product.quantity - orderProduct.quantity
                        products.push(product)
                    }
                    // await transactionalEntityManager.save(products)
                    //TODO : add route to edit items in order (after quality check fail)
                    if (order!.paymentMethod === PaymentMethod.Cash) {
                        if (!user.profile) {
                            return {
                                success: false,
                                status: 400,
                                message: 'Please complete your profile first!',
                            }
                        }
                    } else {
                        const payload = { orderId: order!.id }
                        const orderToken = jwt.sign(payload, JWT_SECRET as string, {
                            expiresIn: '7d',
                        })
                        const session = await this.stripe.checkout.sessions.create({
                            payment_method_types: ['card'],
                            line_items: order!.products.map((item) => {
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
                            //TODO: add endpoint for complete order
                            success_url: `http://${HOST}:${PORT}/order/success-payment?token=${orderToken}`,
                            cancel_url: `http://${HOST}:${PORT}/order/cancel-payment?token=${orderToken}`,
                        })
                        paymentUrl = session.url as string
                    }
                    order!.status = OrderStatus.Pending
                    order = await transactionalEntityManager.save(order)
                    await sendPaymentEmail(user.email, order!, paymentUrl)
                } catch (e) {
                    throw new Error('Something went wrong!...')
                }
            })

            return {
                success: true,
                status: 200,
                message: 'Complete order successfully!',
                resource: {
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

    async successPayment(token: string): Promise<SuccessResponse | ErrorResponse> {
        try {
            const decode = jwt.verify(token, JWT_SECRET as string)
            const orderId: number = parseInt((decode as JwtPayload)['orderId'])
            let order = await this.orderRepository.findOne({ where: { id: orderId } })
            if (!order) {
                return {
                    success: false,
                    status: 404,
                    message: 'Order not found!',
                }
            }
            const products: Product[] = []
            await this.entityManager.transaction(async (transactionalEntityManager) => {
                try {
                    order!.paymentDate = order!.orderDate
                    order!.status = OrderStatus.Completed
                    order = await transactionalEntityManager.save(order!)
                    for (const orderProduct of order!.products) {
                        const product = await transactionalEntityManager.findOneOrFail(
                            Product,
                            {
                                where: { id: orderProduct.productId },
                            }
                        )
                        product.quantity = product.quantity - orderProduct.quantity
                        products.push(product)
                    }
                    await transactionalEntityManager.save(products)
                } catch (e) {
                    throw new Error('Something went wrong!...')
                }
            })

            return {
                success: true,
                status: 200,
                message: 'Payment successfully!',
                resource: order,
            }
        } catch (e) {
            return {
                success: false,
                status: 500,
                message: 'Error occur!',
            }
        }
    }

    async cancelPayment(token: string): Promise<SuccessResponse | ErrorResponse> {
        const decode = jwt.verify(token, JWT_SECRET as string)
        const orderId: number = parseInt((decode as JwtPayload)['orderId'])
        let order = await this.orderRepository.findOne({ where: { id: orderId } })
        if (!order) {
            return {
                success: false,
                status: 404,
                message: 'Order not found!',
            }
        }
        order = await this.orderRepository.save(order)
        return {
            success: true,
            status: 200,
            message: 'Payment is cancel!',
            resource: order,
        }
    }
}
