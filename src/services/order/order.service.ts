import {Repository} from "typeorm";
import {Order} from "../../models/entities/Order.entity";
import {User} from "../../models/entities/User.entity";
import {
    OrderStatus,
    PaymentMethod,
    PaymentStatus
} from "../../utils/common/enum";
import {sendPaymentSuccessfullyEmail} from "../../utils/common/email";


export class OrderService {
    constructor(public orderRepository: Repository<Order>, public userRepository: Repository<User>) {
    }

    async complete(orderId: number, user: User) {
        try {
            let order = await this.orderRepository.createQueryBuilder('order')
                .leftJoinAndSelect('order.user', 'user')
                .where('order.id = :id', {id: orderId})
                .getOne()
            if (!order) {
                return {
                    'success': false,
                    'status': 404,
                    'message': 'Order not found!'
                }
            }
            if (order.user.id !== user.id) {
                return {
                    'success': false,
                    'status': 400,
                    'message': 'Order didnt belong to this user!'
                }
            }
            //TODO : add check product quantity before confirmed
            if (order.paymentMethod === PaymentMethod.Cash) {
                if (!user.profile) {
                    return {
                        'success': false,
                        'status': 400,
                        'message': 'Please complete your profile first!'
                    }
                }
                order.paymentStatus = PaymentStatus.Pending
            } else {
                //TODO: Add visa payment
                order.paymentStatus = PaymentStatus.Success
            }
            order.status = OrderStatus.Pending
            order = await this.orderRepository.save(order)
            await sendPaymentSuccessfullyEmail(user.email, order)
            return {
                'success': true,
                'status': 200,
                'message': 'Payment successfully!',
                resource: order
            }
        } catch (e) {
            return {
                'success': false,
                'status': 500,
                'message': 'Error occur!'
            }
        }
    }
}
