import {Repository} from "typeorm";
import {Cart} from "../../models/entities/Cart.entity";
import {CartProduct} from "../../models/entities/CartProduct.entity";
import {Product} from "../../models/entities/Product.entity";
import {User} from "../../models/entities/User.entity";
import {Order} from "../../models/entities/Order.entity";
import {OrderProduct} from "../../models/entities/OrderProduct.entity";
import {Category} from "../../models/entities/Category.entity";
import {ErrorResponse, SuccessResponse} from "../../utils/common/interfaces";
import {UserStatus} from "../../utils/common/enum";

export class AdminService {
    constructor(public cartRepository: Repository<Cart>,
                public cartProductRepository: Repository<CartProduct>,
                public categoryRepository: Repository<Category>,
                public productRepository: Repository<Product>,
                public userRepository: Repository<User>,
                public orderRepository: Repository<Order>,
                public orderProductRepository: Repository<OrderProduct>) {

    }

    //User service for admin

    async getAllUsers(): Promise<SuccessResponse | ErrorResponse> {
        const listUser = await this.userRepository.find()
        if (listUser.length === 0) {
            return {
                'success': true,
                'status': 200,
                'message': 'Users list is empty!'
            }
        }
        return {
            'success': true,
            'status': 200,
            'message': 'Get users list successfully!',
            resources: listUser
        }
    }

    async getUserDetail(id: number): Promise<SuccessResponse | ErrorResponse> {
        const user = await this.userRepository.findOne({where: {id}})
        if (!user) {
            return {
                'success': false,
                'status': 404,
                'message': 'User not found!'
            }
        }
        return {
            'success': true,
            'status': 200,
            'message': 'Get user detail successfully!',
            resource: user
        }
    }

    async deleteUser(id: number) {
        const user = await this.userRepository.findOne({where: {id}})
        if (!user) {
            return {
                'success': false,
                'status': 404,
                'message': 'User not found!'
            }
        }
        if (user.status === UserStatus.Active)
            return {
                'success': true,
                'status': 200,
                'message': 'User is active, cant delete!'
            }
        await this.userRepository.remove(user)
        return {
            'success': true,
            'status': 200,
            'message': 'Delete user successfully!'
        }
    }

    async blockUser(id: number) {
        let user = await this.userRepository.findOne({where: {id}})
        if (!user) {
            return {
                'success': false,
                'status': 404,
                'message': 'User not found!'
            }
        }
        if (user.status !== UserStatus.Active)
            return {
                'success': true,
                'status': 200,
                'message': 'User status is not active!'
            }
        user.status = UserStatus.Blocked
        user = await this.userRepository.save(user)
        return {
            'success': true,
            'status': 200,
            'message': 'Block user successfully!',
            resource: user
        }
    }

    async unblockUser(id: number) {
        let user = await this.userRepository.findOne({where: {id}})
        if (!user) {
            return {
                'success': false,
                'status': 404,
                'message': 'User not found!'
            }
        }
        if (user.status !== UserStatus.Blocked)
            return {
                'success': true,
                'status': 200,
                'message': 'User status is not blocked!'
            }
        user.status = UserStatus.Inactive
        user = await this.userRepository.save(user)
        return {
            'success': true,
            'status': 200,
            'message': 'Unblock user successfully!',
            resource: user
        }
    }

    //Category service for admin
    async getAllCategories(): Promise<SuccessResponse | ErrorResponse>  {
        const listCategories = await this.categoryRepository.find()
        if (listCategories.length === 0) {
            return {
                'success': true,
                'status': 200,
                'message': 'Categories list is empty!'
            }
        }
        return {
            'success': true,
            'status': 200,
            'message': 'Get categories list successfully!',
            resources: listCategories
        }
    }
}
