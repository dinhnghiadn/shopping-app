import {
    AfterInsert, AfterUpdate,
    BaseEntity,
    Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn
} from "typeorm"
import {Order} from "./Order.entity"
import {Product} from "./Product.entity"

@Entity()
export class OrderProduct extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    orderId: number

    @Column()
    productId: number

    @ManyToOne(() => Order, (order) => order.products)
    order: Order

    @ManyToOne(() => Product, (product) => product.orders)
    product: Product

    @Column()
    quantity: number

    @Column()
    individualPrice: number

    @Column()
    bulkPrice: number

    @AfterInsert()
    @AfterUpdate()
    getBulkPrice() : void {
        this.individualPrice = this.product.price
        this.bulkPrice = this.quantity * this.individualPrice
    }
}
