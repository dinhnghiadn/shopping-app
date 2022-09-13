import { EntityManager, Repository } from 'typeorm';
import { Cart } from '../../models/entities/Cart.entity';
import { Request } from 'express';
import { User } from '../../models/entities/User.entity';
import { ErrorResponse, SuccessResponse } from '../../utils/common/interfaces';
import { EditItems } from '../../models/dto/edit-items';
import { CartProduct } from '../../models/entities/CartProduct.entity';
import { Product } from '../../models/entities/Product.entity';
import { CheckoutItems } from '../../models/dto/checkout-items';
import { Order } from '../../models/entities/Order.entity';
import { OrderProduct } from '../../models/entities/OrderProduct.entity';
import { PaymentMethod } from '../../utils/common/enum';
import * as cron from 'cron';
import { sendReminderEmail } from '../../utils/common/email';
import { throwError } from '../../utils/common/error';

export class CartService {
  constructor(
    public cartRepository: Repository<Cart>,
    public cartProductRepository: Repository<CartProduct>,
    public productRepository: Repository<Product>,
    public userRepository: Repository<User>,
    public orderRepository: Repository<Order>,
    public orderProductRepository: Repository<OrderProduct>,
    private readonly entityManager: EntityManager
  ) {}

  async viewCart(req: Request): Promise<SuccessResponse | ErrorResponse> {
    const user: User = req.body.user;
    try {
      if (!user.cart) {
        return {
          success: true,
          status: 200,
          message: 'User dont have cart!',
        };
      }
      return {
        success: true,
        status: 200,
        message: 'Get cart items successfully!',
        resource: user.cart,
      };
    } catch (e) {
      return {
        success: false,
        status: 400,
        message: 'Bad request!',
      };
    }
  }

  async addItems(data: EditItems, user: User): Promise<SuccessResponse | ErrorResponse> {
    try {
      if (!user.cart) {
        const cart = new Cart();
        user.cart = cart;
        await this.userRepository.save(user);
      }
      const existProduct = await this.cartProductRepository.findOne({
        where: { productId: data.productId, cartId: user.cart.id },
      });
      const product = await this.productRepository.findOneOrFail({
        where: { id: data.productId },
      });
      if (product.quantity < data.quantity) {
        return {
          success: false,
          status: 400,
          message: `Exceed product ${product.name} quantity. Please change your item 's quantity !`,
        };
      }
      await this.entityManager.transaction(async (transactionalEntityManager) => {
        try {
          if (!existProduct) {
            const addedData = transactionalEntityManager.create(CartProduct, {
              productId: data.productId,
              quantity: data.quantity,
              cartId: user.cart.id,
            });
            addedData.product = product;
            await transactionalEntityManager.save(CartProduct, addedData);
          } else {
            existProduct.quantity = data.quantity;
            await transactionalEntityManager.save(CartProduct, existProduct);
          }
          user = await transactionalEntityManager.findOneOrFail(User, {
            where: { id: user.id },
          });
          user.cart.getTotalAmount();
          await transactionalEntityManager.save(User, user);
        } catch (e) {
          console.log(e);
          throw new Error('Something went wrong!...');
        }
      });
      return {
        success: true,
        status: 200,
        message: 'Add items to cart successfully!',
        resource: user.cart,
      };
    } catch (e) {
      return {
        success: false,
        status: 500,
        message: 'Error occur!',
      };
    }
  }

  async removeItems(
    productId: number,
    user: User
  ): Promise<SuccessResponse | ErrorResponse> {
    try {
      if (!user.cart) {
        return {
          success: false,
          status: 404,
          message: 'User dont have cart',
        };
      }
      await this.entityManager.transaction(
        async (transactionalEntityManager: EntityManager) => {
          try {
            await transactionalEntityManager.delete(CartProduct, {
              productId,
              cartId: user.cart.id,
            });
            user = await transactionalEntityManager.findOneOrFail(User, {
              where: { id: user.id },
            });
            user.cart.getTotalAmount();
            user = await transactionalEntityManager.save(User, user);
          } catch (e) {
            console.log(e);
            throw new Error('Something went wrong!...');
          }
        }
      );

      return {
        success: true,
        status: 200,
        message: 'Remove items in cart successfully!',
        resource: user.cart,
      };
    } catch (e) {
      return {
        success: false,
        status: 500,
        message: 'Error occur!',
      };
    }
  }

  async checkOut(
    dataArray: CheckoutItems[],
    paymentMethod: PaymentMethod,
    user: User
  ): Promise<SuccessResponse | ErrorResponse> {
    let errorMessage: string = '';
    try {
      if (!user.cart || user.cart.products.length === 0) {
        return {
          success: false,
          status: 404,
          message: 'User dont have cart or cart does not contain' + ' any items!',
        };
      }

      let order: Order = this.orderRepository.create({
        products: [],
        userId: user.id,
        orderDate: new Date(),
        paymentMethod: paymentMethod,
      });
      await this.entityManager.transaction(
        async (transactionalEntityManager: EntityManager) => {
          try {
            order = await transactionalEntityManager.save(Order, order);
            for (const data of dataArray) {
              for (const cartProduct of user.cart.products) {
                if (cartProduct.productId === data.productId) {
                  // add item to order
                  const product = await transactionalEntityManager.findOneOrFail(
                    Product,
                    {
                      where: { id: data.productId },
                    }
                  );
                  if (product.quantity < cartProduct.quantity) {
                    errorMessage = `Exceed product ${product.name} quantity in cart. Please change your item 's quantity !`;
                    throwError(errorMessage);
                  }
                  let checkout = transactionalEntityManager.create(OrderProduct, {
                    productId: cartProduct.productId,
                    quantity: cartProduct.quantity,
                    orderId: order.id,
                    product: product,
                  });
                  checkout = await transactionalEntityManager.save(
                    OrderProduct,
                    checkout
                  );
                  order.products.push(checkout);
                }
              }
            }
            order.getTotalAmount();
            order = await transactionalEntityManager.save(Order, order);
            await transactionalEntityManager.delete(CartProduct, {
              cartId: user.cart.id,
            });
            await transactionalEntityManager.update(
              Cart,
              { id: user.cart.id },
              {
                totalAmount: 0,
              }
            );
          } catch (e) {
            console.log(e);
            throw new Error('Something went wrong!...');
          }
        }
      );

      return {
        success: true,
        status: 200,
        message: 'Checkout cart to order successfully!',
        resource: order,
      };
    } catch (e) {
      return {
        success: false,
        status: 500,
        message: errorMessage,
      };
    }
  }

  startCronJob(): void {
    const reminder = new cron.CronJob({
      // Change time below
      cronTime: '00 00 15 * * *',
      onTick: async () => {
        // Remind cart items for user
        const users = await this.userRepository.find();
        for (const user of users) {
          if (user.cart && user.cart.products.length !== 0) {
            await sendReminderEmail(user.email, user.cart);
          }
        }
        console.log('Reminder Cron job is running...');
      },
      start: true,
      timeZone: 'Asia/Ho_Chi_Minh',
    });
    reminder.start();
  }
}
