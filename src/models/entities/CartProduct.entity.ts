import {
    AfterInsert, AfterUpdate,
    BaseEntity,
    Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn
} from "typeorm";
import {Order} from "./Order.entity";
import {Product} from "./Product.entity";
import {Cart} from "./Cart.entity";

@Entity()
export class CartProduct extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    cartId: number

    @Column()
    productId: number

    @ManyToOne(() => Cart, (cart) => cart.products)
    cart: Cart

    @ManyToOne(() => Product, (product) => product.carts)
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
