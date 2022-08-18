import {
    AfterInsert, AfterLoad, AfterUpdate,
    BaseEntity, BeforeInsert, BeforeUpdate, Column,
    CreateDateColumn,
    Entity, OneToMany, OneToOne,
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

    @OneToMany(()=>CartProduct, (cartProduct) => cartProduct.cart,{eager:true})
    products: CartProduct[]

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
