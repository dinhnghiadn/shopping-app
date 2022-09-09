import {
    BaseEntity,
    BeforeInsert,
    BeforeUpdate,
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm'
import { User } from './User.entity'
import { OrderStatus, PaymentMethod } from '../../utils/common/enum'
import { OrderProduct } from './OrderProduct.entity'
import { Cart } from './Cart.entity'
import { PaymentSession } from './PaymentSession.entity'

@Entity('orders')
export class Order extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: 'enum', enum: PaymentMethod, default: PaymentMethod.Cash })
    paymentMethod: PaymentMethod

    @Column({
        type: 'enum',
        enum: OrderStatus,
        default: OrderStatus.NotConfirmed,
    })
    status: OrderStatus

    @Column({ nullable: true })
    orderDate: Date

    @Column({ nullable: true })
    paymentDate: Date

    @Column({ nullable: true })
    completedDate: Date

    @Column({ default: 0 })
    totalAmount: number

    @Column()
    userId: number

    @ManyToOne(() => User, (user) => user.orders, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User

    @OneToMany(() => OrderProduct, (orderProduct) => orderProduct.order, {
        cascade: true,
        eager: true,
    })
    products: OrderProduct[]

    @OneToOne(() => PaymentSession, (session) => session.order, {
        cascade: true,
        eager: true,
    })
    paymentSession: PaymentSession

    getTotalAmount(): void {
        if (this.products) {
            this.totalAmount = this.products.reduce((a, b) => a + b.bulkPrice, 0)
        } else this.totalAmount = 0
    }
}
