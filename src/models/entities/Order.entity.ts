import {
    BaseEntity,
    BeforeInsert,
    BeforeUpdate,
    Column,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm'
import { User } from './User.entity'
import { OrderStatus, PaymentMethod, PaymentStatus } from '../../utils/common/enum'
import { OrderProduct } from './OrderProduct.entity'

@Entity('orders')
export class Order extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: 'enum', enum: PaymentMethod, default: PaymentMethod.Cash })
    paymentMethod: PaymentMethod

    @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.NotConfirmed })
    status: OrderStatus

    @Column({ type: 'enum', enum: PaymentStatus, nullable: true })
    paymentStatus: PaymentStatus

    @Column({ nullable: true })
    orderDate: Date

    @Column({ nullable: true })
    paymentDate: Date

    @Column({ nullable: true })
    completedDate: Date

    @Column({ default: 0 })
    totalAmount: number

    @ManyToOne(() => User, (user) => user.orders, { onDelete: 'CASCADE' })
    user: User

    @OneToMany(() => OrderProduct, (orderProduct) => orderProduct.order, { eager: true })
    products: OrderProduct[]

    getTotalAmount(): void {
        if (this.products) {
            this.totalAmount = this.products.reduce((a, b) => a + b.bulkPrice, 0)
        } else this.totalAmount = 0
    }
}
