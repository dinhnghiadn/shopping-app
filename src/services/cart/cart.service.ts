import {Repository} from "typeorm";
import {Cart} from "../../models/entities/Cart.entity";
import {NextFunction, Request, Response} from "express";
import {auth} from "../../utils/common/auth";
import {User} from "../../models/entities/User.entity";
import {ErrorResponse, SuccessResponse} from "../../utils/common/interfaces";

export class CartService {
    constructor(public cartRepository: Repository<Cart>,public userRepository: Repository<User>) {
      
    }

    async viewCart(req: Request): Promise<SuccessResponse | ErrorResponse> {
        const user = req.body.user
        try {
            // const cart = await this.cartRepository.findOne({where:{id:user.cartId}})
            const cart = await this.cartRepository.createQueryBuilder('cart')
                .leftJoinAndSelect('cart.products','products')
                .innerJoinAndSelect('products.product','product','products.productId = product.id')
                .select(['product.name','cart.totalAmount','products.quantity','products.individualPrice','products.bulkPrice'])
                .where('cart.id = :id',{id:user.cart.id})
                .getOne()
            if (!cart){
                return {
                    'success': false,
                    'status': 404,
                    'message': 'Cart not found!'
                }
            }
            return {
                'success': true,
                'status': 200,
                'message': 'Get cart items successfully!',
                resource:cart
            }
        } catch (e) {
            return {
                'success': false,
                'status': 400,
                'message': 'Bad request!'
            }
        }
    }

    async addItems(req: Request) {

    }
}
