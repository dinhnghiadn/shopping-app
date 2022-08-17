import {Repository} from "typeorm";
import {Product} from "../../models/entities/Product.entity";
import {User} from "../../models/entities/User.entity";
import {ErrorResponse, SuccessResponse} from "../../utils/common/interfaces";
import {Request} from "express";

export class ProductService {
    constructor(public productRepository: Repository<Product>) {
    }

    async getAll(req: Request): Promise<SuccessResponse | ErrorResponse> {
        const orderBy: string = req.query.sort as string
        const category: string = req.query.category as string
        let listProduct: Product[]
        try {
            listProduct = await this.productRepository.createQueryBuilder('product')
                .leftJoinAndSelect("product.categories", "category")
                .where((category) ? 'category.name LIKE :category' : 'TRUE', {category: `%${category}%`})
                .orderBy((orderBy) ? `product.${orderBy}` : 'TRUE', "DESC")
                .getMany()
            if (listProduct.length === 0) {
                return {
                    'success': true,
                    'status': 204,
                    'message': 'No content!'
                }
            }
            return {
                'success': true,
                'status': 200,
                'message': 'Get list products successfully!',
                resources: listProduct
            }
        } catch (e) {
            return {
                'success': false,
                'status': 400,
                'message': 'Bad request!'
            }
        }
    }

    async getOne(req: Request):Promise<SuccessResponse | ErrorResponse> {
        const id = parseInt(req.query.id as string)
        try {
            const product = await this.productRepository.findOne({where:{id:id}})
            if (!product){
                return {
                    'success': false,
                    'status': 404,
                    'message': 'Product not found!'
                }
            }
            return {
                'success': true,
                'status': 200,
                'message': 'Get product detail successfully!',
                resource:product
            }
        } catch (e) {
            return {
                'success': false,
                'status': 400,
                'message': 'Bad request!'
            }
        }
    }
}
