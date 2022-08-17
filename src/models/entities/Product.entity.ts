import {
    BaseEntity,
    Column, CreateDateColumn,
    Entity, JoinTable,
    ManyToMany, OneToMany,
    PrimaryGeneratedColumn, UpdateDateColumn
} from "typeorm";
import {Category} from "./Category.entity";
import {OrderProduct} from "./OrderProduct.entity";
import {CartProduct} from "./CartProduct.entity";

@Entity('products')
export class Product extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column()
    price: number

    @Column()
    quantity: number

    @Column()
    description: string

    @CreateDateColumn()
    createAt: Date

    @UpdateDateColumn()
    updateAt: Date

    @ManyToMany(() => Category, (category) => category.products,{cascade: ["insert", "update"]})
    @JoinTable({name:'product_category'})
    categories: Category[]

    @OneToMany(()=>OrderProduct, (orderProduct) => orderProduct.product)
    orders: OrderProduct[]

    @OneToMany(()=>CartProduct, (cartProduct) => cartProduct.product)
    carts: CartProduct[]
}
