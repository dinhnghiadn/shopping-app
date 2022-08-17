import {
    AfterInsert, AfterUpdate,
    BaseEntity, Column,
    CreateDateColumn,
    Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne,
    PrimaryGeneratedColumn, UpdateDateColumn
} from "typeorm";
import {User} from "./User.entity";
import {CartProduct} from "./CartProduct.entity";

@Entity('carts')
export class Cart extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @CreateDateColumn()
    createAt: Date

    @UpdateDateColumn()
    updateAt: Date

    @Column()
    totalAmount: number

    @OneToOne(() => User, (user) => user.cart)
    user: User

    @OneToMany(()=>CartProduct, (cartProduct) => cartProduct.cart)
    products: CartProduct[]

    @AfterInsert()
    @AfterUpdate()
    getTotalAmount(): void {
        // this.totalAmount = this.products.reduce((n, {bulkPrice}) => n + bulkPrice, 0)
        this.totalAmount = this.products.reduce((a,b) => a + b.bulkPrice,0)

    }
}
