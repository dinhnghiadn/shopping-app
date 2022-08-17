import {
    AfterInsert, AfterUpdate,
    BaseEntity, Column,
    CreateDateColumn,
    Entity, JoinTable, ManyToMany, ManyToOne, OneToMany,
    PrimaryGeneratedColumn, UpdateDateColumn
} from "typeorm";
import {User} from "./User.entity";
import {Product} from "./Product.entity";
import {order_status, payment_method} from "../../utils/common/enum";
import {OrderProduct} from "./OrderProduct.entity";

@Entity('orders')
export class Order extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({type: 'enum', enum: payment_method})
    paymentMethod: payment_method

    @Column({type: 'enum', enum: order_status, default: order_status.Pending})
    status: order_status

    @Column()
    orderDate: Date

    @Column()
    paymentDate: Date

    @Column()
    completedDate: Date

    @Column()
    totalAmount: number

    @ManyToOne(() => User, (user) => user.orders)
    user: User

    @OneToMany(() => OrderProduct, (orderProduct) => orderProduct.order)
    products: OrderProduct[]

    @AfterInsert()
    @AfterUpdate()
    getTotalAmount(): void {
        // this.totalAmount = this.products.reduce((n, {bulkPrice}) => n + bulkPrice, 0)
        this.totalAmount = this.products.reduce((a,b) => a + b.bulkPrice,0)

    }
}
