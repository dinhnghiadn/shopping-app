import { EntityManager, Repository } from 'typeorm'
import { Order } from '../../models/entities/Order.entity'
import { User } from '../../models/entities/User.entity'
import { OrderStatus, PaymentMethod } from '../../utils/common/enum'
import { sendPaymentEmail, sendReminderEmail } from '../../utils/common/email'
import { Product } from '../../models/entities/Product.entity'
import Stripe from 'stripe'
import * as jwt from 'jsonwebtoken'
import { ErrorResponse, SuccessResponse } from '../../utils/common/interfaces'
import * as cron from 'cron'

const { HOST, PORT, JWT_SECRET, STRIPE_SIGNIN_SECRET } = process.env

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
        user: User,
        sig: String
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
            if (
                order.status === OrderStatus.Pending ||
                order.status === OrderStatus.Completed
            ) {
                return {
                    success: false,
                    status: 400,
                    message: 'Order must be in not confirmed state or canceled!',
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
                        product.quantity = product.quantity - orderProduct.quantity
                        products.push(product)
                    }
                    await transactionalEntityManager.save(products)
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
                            success_url: `http://${HOST}:${PORT}/order/success-payment?orderId=${
                                order!.id
                            }&sessionId={CHECKOUT_SESSION_ID}`,
                            cancel_url: `http://${HOST}:${PORT}/order/cancel-payment?orderId=${
                                order!.id
                            }&sessionId={CHECKOUT_SESSION_ID}`,
                            expires_at: Math.round(Date.now() / 1000) + 1800,
                            after_expiration: {
                                recovery: { enabled: true },
                            },
                        })
                        paymentUrl = session.url as string
                    }
                    // order!.status = OrderStatus.Pending
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

    async successPayment(
        id: number,
        sessionId: string
    ): Promise<SuccessResponse | ErrorResponse> {
        try {
            let order = await this.orderRepository.findOne({ where: { id } })
            if (!order) {
                return {
                    success: false,
                    status: 404,
                    message: 'Order not found!',
                }
            }
            await this.entityManager.transaction(async (transactionalEntityManager) => {
                try {
                    order!.paymentDate = order!.orderDate
                    // order!.status = OrderStatus.Completed
                    order = await transactionalEntityManager.save(order!)
                } catch (e) {
                    console.log(e)
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

    async cancelPayment(
        id: number,
        sessionId: string
    ): Promise<SuccessResponse | ErrorResponse> {
        let order = await this.orderRepository.findOne({ where: { id } })
        if (!order) {
            return {
                success: false,
                status: 404,
                message: 'Order not found!',
            }
        }
        const products: Product[] = []
        await this.entityManager.transaction(async (transactionalEntityManager) => {
            order!.status = OrderStatus.Canceled
            for (const orderProduct of order!.products) {
                const product = await transactionalEntityManager.findOneOrFail(Product, {
                    where: { id: orderProduct.productId },
                })
                product.quantity = product.quantity + orderProduct.quantity
                products.push(product)
            }
            await transactionalEntityManager.save(products)
            order = await this.orderRepository.save(order!)
            const session = await this.stripe.checkout.sessions.expire(sessionId)
        })

        return {
            success: true,
            status: 200,
            message: 'Payment is cancel!',
            resource: order,
        }
    }

    async orderResultHandler(
        payload: string,
        sig: string
    ): Promise<SuccessResponse | ErrorResponse> {
        try {
            let event = this.stripe.webhooks.constructEvent(
                payload,
                sig,
                STRIPE_SIGNIN_SECRET as string
            )

            if (event.type === 'checkout.session.completed') {
                console.log('hook is ok')
                const session = event.data.object
                console.log(session)
                return {
                    success: true,
                    status: 200,
                    message: 'Payment is complete!',
                    resource: session,
                }
            }
            return {
                success: false,
                status: 500,
                message: 'Error occur',
            }
        } catch (e) {
            console.log(e)
            let message = 'Unknown Error'
            if (e instanceof Error) message = e.message
            return {
                success: false,
                status: 400,
                message,
            }
        }
    }
}
