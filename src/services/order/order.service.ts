import { EntityManager, Repository } from 'typeorm';
import { Order } from '../../models/entities/Order.entity';
import { User } from '../../models/entities/User.entity';
import { OrderStatus, PaymentMethod, SessionStatus } from '../../utils/common/enum';
import { sendPaymentEmail } from '../../utils/common/email';
import { Product } from '../../models/entities/Product.entity';
import Stripe from 'stripe';
import { ErrorResponse, SuccessResponse } from '../../utils/common/interfaces';

import { PaymentSession } from '../../models/entities/PaymentSession.entity';
import { throwError } from '../../utils/common/error';

const { HOST, PORT, STRIPE_SIGNIN_SECRET } = process.env;

export class OrderService {
  constructor(
    public orderRepository: Repository<Order>,
    public paymentSessionRepository: Repository<PaymentSession>,
    public productRepository: Repository<Product>,
    public userRepository: Repository<User>,
    private readonly entityManager: EntityManager
  ) {}

  stripe = new Stripe(process.env.STRIPE_KEY as string, { apiVersion: '2022-08-01' });

  async complete(orderId: number, user: User): Promise<SuccessResponse | ErrorResponse> {
    let errorMessage: string = '';

    try {
      let order = await this.orderRepository
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.user', 'user')
        .leftJoinAndSelect('order.products', 'product')
        .where('order.id = :id', { id: orderId })
        .andWhere('user.id = :userId', { userId: user.id })
        .getOne();

      if (!order) {
        return {
          success: false,
          status: 404,
          message: 'Order not found!',
        };
      }
      if (
        order.status === OrderStatus.Pending ||
        order.status === OrderStatus.Completed
      ) {
        return {
          success: false,
          status: 400,
          message: 'Order must be in not confirmed state or canceled!',
        };
      }
      const existSession = await this.paymentSessionRepository.findOne({
        where: { orderId: order.id },
      });
      if (existSession && existSession.status === SessionStatus.Pending) {
        return {
          success: true,
          status: 200,
          message: 'There was a pending session with this order!',
          resource: order.paymentSession.url,
        };
      }
      const products: Product[] = [];
      let paymentUrl: string = '';
      // Start transaction
      await this.entityManager.transaction(async (transactionalEntityManager) => {
        try {
          for (const orderProduct of order!.products) {
            const product = await transactionalEntityManager.findOneOrFail(Product, {
              where: { id: orderProduct.productId },
            });
            if (product.quantity < orderProduct.quantity) {
              errorMessage = `Exceed product ${product.name} quantity in order (${product.quantity}). Please try again !`;
              throwError(errorMessage);
            }
            product.quantity = product.quantity - orderProduct.quantity;
            products.push(product);
          }
          await transactionalEntityManager.save(products);
          // TODO : add route to edit items in order (after quality check fail)
          if (order!.paymentMethod === PaymentMethod.Cash) {
            if (!user.profile) {
              errorMessage = 'Please complete your profile first!';
              throwError(errorMessage);
            }
          } else {
            const session = await this.stripe.checkout.sessions.create({
              payment_method_types: ['card'],
              line_items: order!.products.map((item) => {
                const product = products.find((product) => product.id === item.productId);
                return {
                  price_data: {
                    currency: 'usd',
                    product_data: {
                      name: product!.name,
                    },
                    unit_amount: product!.price,
                  },
                  quantity: item.quantity,
                };
              }),
              mode: 'payment',
              success_url: `http://${HOST}:${PORT}/order/success-payment?orderId=${
                order!.id
              }&sessionId={CHECKOUT_SESSION_ID}`,
              cancel_url: `http://${HOST}:${PORT}/order/cancel-payment?orderId=${
                order!.id
              }&sessionId={CHECKOUT_SESSION_ID}`,
              expires_at: Math.round(Date.now() / 1000) + 1800,
            });
            paymentUrl = session.url as string;
            const paymentSession = transactionalEntityManager.create(PaymentSession, {
              sessionId: session.id,
              status: SessionStatus.Pending,
              expireAt: session.expires_at,
              order: order!,
              url: session.url as string,
            });

            if (existSession) {
              await transactionalEntityManager.update(
                PaymentSession,
                { id: existSession.id },
                {
                  ...paymentSession,
                }
              );
            } else await transactionalEntityManager.save(paymentSession);
          }
          order!.status = OrderStatus.Pending;
          order = await transactionalEntityManager.save(order);
          await sendPaymentEmail(user.email, order!, paymentUrl);
        } catch (e) {
          console.log(e);
          throw new Error('Something went wrong!...');
        }
      });
      return {
        success: true,
        status: 200,
        message: 'Complete order successfully!',
        resource: {
          url: paymentUrl,
        },
      };
    } catch (e) {
      return {
        success: false,
        status: 500,
        message: errorMessage,
      };
    }
  }

  async successPayment(orderId: number): Promise<SuccessResponse | ErrorResponse> {
    try {
      const order = await this.orderRepository.findOne({ where: { id: orderId } });
      if (!order) {
        return {
          success: false,
          status: 404,
          message: 'Order not found!',
        };
      }
      return {
        success: true,
        status: 200,
        message: 'Payment successfully!',
        resource: order,
      };
    } catch (e) {
      return {
        success: false,
        status: 500,
        message: 'Error occur!',
      };
    }
  }

  async cancelPayment(
    orderId: number,
    sessionId: string
  ): Promise<SuccessResponse | ErrorResponse> {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) {
      return {
        success: false,
        status: 404,
        message: 'Order not found!',
      };
    }
    await this.stripe.checkout.sessions.expire(sessionId);
    return {
      success: true,
      status: 200,
      message: 'Payment is cancel!',
    };
  }

  async orderResultHandler(payload: string, sig: string): Promise<void> {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        sig,
        STRIPE_SIGNIN_SECRET as string
      );
      const session = event.data.object as Stripe.Response<Stripe.Checkout.Session>;

      switch (event.type) {
        case 'checkout.session.completed':
          await this.entityManager.transaction(async (transactionalEntityManager) => {
            let order = await transactionalEntityManager
              .createQueryBuilder(Order, 'order')
              .leftJoinAndSelect('order.paymentSession', 'session')
              .where('session.sessionId = :id', { id: session.id })
              .getOne();
            order!.paymentDate = order!.orderDate;
            order!.status = OrderStatus.Completed;
            order!.paymentSession.status = SessionStatus.Success;
            order = await transactionalEntityManager.save(order);
            console.log('success handling...');
          });
          break;
        case 'checkout.session.expired':
          await this.entityManager.transaction(async (transactionalEntityManager) => {
            const order = await transactionalEntityManager
              .createQueryBuilder(Order, 'order')
              .leftJoinAndSelect('order.products', 'products')
              .leftJoinAndSelect('order.paymentSession', 'session')
              .where('session.sessionId = :id', { id: session.id })
              .getOne();
            order!.status = OrderStatus.Cancelled;
            const products: Product[] = [];
            for (const orderProduct of order!.products) {
              const product = await transactionalEntityManager.findOneOrFail(Product, {
                where: { id: orderProduct.productId },
              });
              product.quantity = product.quantity + orderProduct.quantity;
              products.push(product);
            }
            await transactionalEntityManager.save(products);
            await this.orderRepository.save(order!);
            await this.paymentSessionRepository.delete({
              sessionId: session.id,
            });
            console.log('success handling...');
          });
          break;
      }
    } catch (e) {
      console.log(e);
      // let message = 'Unknown Error'
      // if (e instanceof Error) message = e.message
      // return {
      //     success: false,
      //     status: 400,
      //     message,
      // }
    }
  }
}
