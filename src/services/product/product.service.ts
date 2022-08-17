import {Repository} from "typeorm";
import {Product} from "../../models/entities/Product.entity";
import {User} from "../../models/entities/User.entity";
import {product_sort} from "../../utils/common/enum";

export class ProductService {
    constructor(public productRepository: Repository<Product>) {
    }
    async getAll(orderBy:product_sort):Promise<Product[] | null> {
        return this.productRepository.createQueryBuilder('product').orderBy(`${orderBy}`,"DESC").getMany()
    }
}
