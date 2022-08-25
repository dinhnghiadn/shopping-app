import {Repository} from "typeorm";
import {Cart} from "../../models/entities/Cart.entity";
import {Request} from "express";
import {User} from "../../models/entities/User.entity";
import {ErrorResponse, SuccessResponse} from "../../utils/common/interfaces";
import {EditItems} from "../../models/dto/edit-items";
import {CartProduct} from "../../models/entities/CartProduct.entity";
import {Product} from "../../models/entities/Product.entity";
import {CheckoutItems} from "../../models/dto/checkout-items";
import {Order} from "../../models/entities/Order.entity";
import {OrderProduct} from "../../models/entities/OrderProduct.entity";
import {PaymentMethod} from "../../utils/common/enum";
import * as cron from 'cron'
import {sendReminderEmail} from "../../utils/common/email";

export class CartService {
    constructor(public cartRepository: Repository<Cart>,
                public cartProductRepository: Repository<CartProduct>,
                public productRepository: Repository<Product>,
                public userRepository: Repository<User>,
                public orderRepository: Repository<Order>,
                public orderProductRepository: Repository<OrderProduct>) {

    }

    async viewCart(req: Request): Promise<SuccessResponse | ErrorResponse> {
        const user: User = req.body.user
        try {
            if (!user.cart) {
                return {
                    'success': true,
                    'status': 200,
                    'message': 'User dont have cart!'
                }
            }
            return {
                'success': true,
                'status': 200,
                'message': 'Get cart items successfully!',
                resource: user.cart
            }
        } catch (e) {
            return {
                'success': false,
                'status': 400,
                'message': 'Bad request!'
            }
        }
    }

    async addItems(data: EditItems, user: User): Promise<SuccessResponse | ErrorResponse> {
        try {
            if (data.quantity < 0) {
                return {
                    'success': false,
                    'status': 400,
                    'message': 'Quantity must be a positive number!'
                }
            }
            if (!user.cart) {
                const cart = new Cart()
                user.cart = cart
                await this.userRepository.save(user)

            }
            const existProduct = await this.cartProductRepository.createQueryBuilder('cartProduct')
                .leftJoinAndSelect('cartProduct.product', 'product', 'cartProduct.productId = product.id')
                .where('cartProduct.productId = :id', {id: data.productId})
                .andWhere('cartProduct.cartId = :cartId', {cartId: user.cart.id})
                .getOne()
            if (!existProduct) {
                const addedData = this.cartProductRepository.create({
                    productId: data.productId,
                    quantity: data.quantity,
                    cartId: user.cart.id
                })
                addedData.product = await this.productRepository.findOneOrFail({where: {id: data.productId}})
                await this.cartProductRepository.save(addedData)
                //TODO : add check product quantity
            } else {
                existProduct.quantity = existProduct.quantity + data.quantity
                //TODO : add check product quantity
                await this.cartProductRepository.save(existProduct)
            }
            const updatedCartUser = await this.userRepository.findOneOrFail({
                where: {id: user.id},
                relations: {cart: true}
            })
            updatedCartUser.cart.getTotalAmount()
            await this.userRepository.save(updatedCartUser)
            return {
                'success': true,
                'status': 200,
                'message': 'Add items to cart successfully!',
                resource: updatedCartUser.cart
            }
        } catch (e) {
            return {
                'success': false,
                'status': 500,
                'message': 'Error occur!'
            }
        }

    }

    async removeItems(data: EditItems, user: User): Promise<SuccessResponse | ErrorResponse> {
        try {
            if (data.quantity > 0) {
                return {
                    'success': false,
                    'status': 400,
                    'message': 'Quantity must be a negative number!'
                }
            }
            if (!user.cart) {
                return {
                    'success': false,
                    'status': 404,
                    'message': 'User dont have cart'
                }
            }
            const existProduct = await this.cartProductRepository.createQueryBuilder('cartProduct')
                .leftJoinAndSelect('cartProduct.product', 'product', 'cartProduct.productId = product.id')
                .where('cartProduct.productId = :id', {id: data.productId})
                .andWhere('cartProduct.cartId = :cartId', {cartId: user.cart.id})
                .getOne()
            if (!existProduct) {
                return {
                    'success': false,
                    'status': 404,
                    'message': 'Product not found in cart!'
                }
            } else {
                if (Math.abs(data.quantity) > existProduct.quantity) {
                    return {
                        'success': false,
                        'status': 400,
                        'message': 'Cannot delete items exceed the' +
                            ' quantities in cart!'
                    }
                }
                existProduct.quantity = existProduct.quantity + data.quantity
                if (existProduct.quantity === 0) {
                    await this.cartProductRepository.remove(existProduct)
                } else await this.cartProductRepository.save(existProduct)
            }

            const updatedCartUser = await this.userRepository.findOneOrFail({
                where: {id: user.id},
                relations: {cart: true}
            })
            updatedCartUser.cart.getTotalAmount()
            await this.userRepository.save(updatedCartUser)
            return {
                'success': true,
                'status': 200,
                'message': 'Remove items in cart successfully!',
                resource: updatedCartUser.cart
            }
        } catch (e) {
            return {
                'success': false,
                'status': 500,
                'message': 'Error occur!'
            }
        }

    }

    async checkOut(dataArray: CheckoutItems[], paymentMethod: PaymentMethod, user: User) {
        try {
            if (!user.cart || user.cart.products.length === 0) {
                return {
                    'success': false,
                    'status': 404,
                    'message': 'User dont have cart or cart does not contain' +
                        ' any items!'
                }
            }
            let order: Order = new Order()
            order.products = []
            user.orders.push(order)
            order = await this.orderRepository.save(order)
            user = await this.userRepository.save(user)
            dataArray.forEach((data: CheckoutItems) => {
                user.cart.products.forEach(async (cartProduct) => {
                    if (cartProduct.productId === data.productId) {
                        //add item to order
                        const product = await this.productRepository.findOneOrFail({where: {id: data.productId}})
                        if (product.quantity < cartProduct.quantity) {
                            return {
                                'success': false,
                                'status': 400,
                                'message': `Exceed product ${product.name} quantity. Please edit your item 's quantity !`
                            }
                        }
                        const checkout = this.orderProductRepository.create({
                            productId: cartProduct.productId,
                            quantity: cartProduct.quantity,
                            orderId: order.id
                        })
                        checkout.product = product
                        order.products.push(checkout)
                        await this.orderProductRepository.save(checkout)
                    }
                })
            })
            order = await this.orderRepository.save(order)
            order.getTotalAmount()
            order.orderDate = new Date()
            order.paymentMethod = paymentMethod
            const addedOrder = await this.orderRepository.save(order)
            await this.cartProductRepository.delete({cartId:user.cart.id})
            //TODO: return total amount in cart to 0
            return {
                'success': true,
                'status': 200,
                'message': 'Checkout cart to order successfully!',
                resource: addedOrder
            }
        } catch (e) {
            return {
                'success': false,
                'status': 500,
                'message': 'Error occur!'
            }
        }

    }

    startCronJob() {
        const reminder = new cron.CronJob({
            cronTime: '00 24 17 * * *',
            onTick:async () =>{
                //Remind cart items for user
                const users = await this.userRepository.find()
                users.forEach((user)=>{
                    if (user.cart && user.cart.products.length !== 0){
                        sendReminderEmail(user.email,user.cart)
                    }
                })
                console.log('Cron job is running...')
            },
            start: true,
            timeZone: 'Asia/Ho_Chi_Minh'
        })
        reminder.start()
    }


}
