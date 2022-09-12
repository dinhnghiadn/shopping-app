import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from './Product.entity';
import { Cart } from './Cart.entity';

@Entity()
export class CartProduct extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  cartId: number;

  @Column()
  productId: number;

  @ManyToOne(() => Cart, (cart) => cart.products, { onDelete: 'CASCADE' })
  cart: Cart;

  @ManyToOne(() => Product, (product) => product.carts, { eager: true })
  product: Product;

  @Column()
  quantity: number;

  @Column()
  individualPrice: number;

  @Column()
  bulkPrice: number;

  @BeforeInsert()
  @BeforeUpdate()
  getBulkPrice(): void {
    this.individualPrice = this.product.price;
    this.bulkPrice = this.quantity * this.individualPrice;
  }
}
