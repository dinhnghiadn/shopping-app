import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm'
import { User } from './User.entity'
import { CartProduct } from './CartProduct.entity'
import { Order } from './Order.entity'
import { OrderStatus, SessionStatus } from '../../utils/common/enum'

@Entity('payment_session')
export class PaymentSession extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @CreateDateColumn()
    createAt: Date

    @UpdateDateColumn()
    updateAt: Date

    @Column()
    expireAt: number

    @Column('varchar', { length: 500 })
    sessionId: string

    @Column('varchar', { length: 500 })
    url: string

    @Column({ type: 'enum', enum: SessionStatus, default: SessionStatus.Pending })
    status: SessionStatus

    @Column({ nullable: true })
    orderId: number

    @OneToOne(() => Order, (order) => order.paymentSession)
    @JoinColumn({ name: 'orderId' })
    order: Order
}
