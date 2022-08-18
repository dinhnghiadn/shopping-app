import {
    AfterInsert, AfterUpdate,
    BaseEntity, BeforeInsert, BeforeUpdate, Column,
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

    @Column({type: 'enum', enum: payment_method,default:payment_method.Cash})
    paymentMethod: payment_method

    @Column({type: 'enum', enum: order_status, default: order_status.Pending})
    status: order_status

    @Column({nullable:true})
    orderDate: Date

    @Column({nullable:true})
    paymentDate: Date

    @Column({nullable:true})
    completedDate: Date

    @Column()
    totalAmount: number

    @ManyToOne(() => User, (user) => user.orders)
    user: User

    @OneToMany(() => OrderProduct, (orderProduct) => orderProduct.order,{eager:true})
    products: OrderProduct[]

    @BeforeInsert()
    @BeforeUpdate()
    getTotalAmount(): void {
        // this.totalAmount = this.products.reduce((n, {bulkPrice}) => n + bulkPrice, 0)
        if (this.products){
            this.totalAmount = this.products.reduce((a,b) => a + b.bulkPrice,0)
        }
        else this.totalAmount = 0
    }
}
