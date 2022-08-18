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
            } else {
                existProduct.quantity = existProduct.quantity + data.quantity
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
                'status': 400,
                'message': 'Bad request!'
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
                    'message': 'User dont have cart!'
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
                'status': 400,
                'message': 'Bad request!'
            }
        }

    }

    async checkOut(dataArray: CheckoutItems[], user: User) {
        let order: Order = new Order()
        order.products = []
        user.orders.push(order)
        user = await this.userRepository.save(user)
        dataArray.forEach((data: CheckoutItems) => {
            if (data.checkOut) {
                user.cart.products.forEach(async (product)=>{
                    if(product.productId===data.productId){
                        //add item to order
                        const checkout = await this.orderProductRepository.create({
                            productId:product.productId,
                            quantity:product.quantity,
                            orderId:order.id
                        })
                        checkout.product = await this.productRepository.findOneOrFail({where: {id: checkout.productId}})
                        order.products.push(checkout)
                        await this.orderProductRepository.save(checkout)
                    }
                })
            }
        })
        order = await this.orderRepository.save(order)
        order.getTotalAmount()
        const addedOrder = await this.orderRepository.save(order)
        return {
            'success': true,
            'status': 200,
            'message': 'Checkout cart to order successfully!',
            resource: addedOrder
        }

    }

}
