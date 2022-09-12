import { Repository } from 'typeorm';
import { Category } from '../../models/entities/Category.entity';
import { ErrorResponse, SuccessResponse } from '../../utils/common/interfaces';

export class CategoryService {
  constructor(public categoryRepository: Repository<Category>) {}

  async getAll(orderBy: string): Promise<SuccessResponse | ErrorResponse> {
    let listCategory: Category[];
    try {
      listCategory = await this.categoryRepository
        .createQueryBuilder('category')
        .leftJoinAndSelect('category.products', 'product')
        .orderBy(orderBy ? `category.${orderBy}` : 'TRUE', 'DESC')
        .getMany();
      if (listCategory.length === 0) {
        return {
          success: true,
          status: 204,
          message: 'No content!',
        };
      }
      return {
        success: true,
        status: 200,
        message: 'Get list categories successfully!',
        resources: listCategory,
      };
    } catch (e) {
      return {
        success: false,
        status: 500,
        message: 'Error occur!',
      };
    }
  }
  async getOne(id: number): Promise<SuccessResponse | ErrorResponse> {
    try {
      const category = await this.categoryRepository.findOne({
        where: { id: id },
        relations: { products: true },
      });
      if (!category) {
        return {
          success: false,
          status: 404,
          message: 'Category not found!',
        };
      }
      return {
        success: true,
        status: 200,
        message: 'Get category detail successfully!',
        resource: category,
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
