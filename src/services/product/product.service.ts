import { Repository } from 'typeorm';
import { Product } from '../../models/entities/Product.entity';
import { ErrorResponse, SuccessResponse } from '../../utils/common/interfaces';

export class ProductService {
  constructor(public productRepository: Repository<Product>) {}

  async getAll(
    orderBy: string,
    category: string
  ): Promise<SuccessResponse | ErrorResponse> {
    try {
      const listProduct = await this.productRepository
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.categories', 'category')
        .where(category ? 'category.name LIKE :category' : 'TRUE', {
          category: `%${category}%`,
        })
        .orderBy(orderBy ? `product.${orderBy}` : 'TRUE', 'DESC')
        .getMany();
      if (listProduct.length === 0) {
        return {
          success: true,
          status: 200,
          message: 'Product list is empty!',
        };
      }
      return {
        success: true,
        status: 200,
        message: 'Get list products successfully!',
        resources: listProduct,
      };
    } catch (e) {
      return {
        success: false,
        status: 500,
        message: 'Error occur!',
      };
    }
  }

  async getDetail(id: number): Promise<SuccessResponse | ErrorResponse> {
    try {
      const product = await this.productRepository.findOne({ where: { id: id } });
      if (!product) {
        return {
          success: false,
          status: 404,
          message: 'Product not found!',
        };
      }
      return {
        success: true,
        status: 200,
        message: 'Get product detail successfully!',
        resource: product,
      };
    } catch (e) {
      return {
        success: false,
        status: 500,
        message: 'Error occur!',
      };
    }
  }
}
