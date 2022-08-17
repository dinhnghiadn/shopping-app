import {
    AfterInsert, AfterUpdate,
    BaseEntity,
    Column,
    Entity,
    ManyToMany,
    PrimaryGeneratedColumn
} from "typeorm";
import {Product} from "./Product.entity";

@Entity('categories')
export class Category extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column()
    description: string

    @Column()
    productQuantities: number

    @ManyToMany(()=>Product,(product) => product.categories)
    products: Product[]

    @AfterInsert()
    @AfterUpdate()
    getProductQuantity(): void {
        this.productQuantities= this.products.length
    }
}
