import {ProductService} from "./product.service";
import {Request, Response} from "express";
export class ProductController {
    constructor(public productService: ProductService) {
    }
    async getAll(req:Request,res:Response): Promise<void>{
        const orderBy: string = req.query.sort as string
        const category: string = req.query.category as string
        const result = await this.productService.getAll(orderBy,category)
        res.status(result.status).json(result)
    }

    async getDetail(req: Request, res: Response): Promise<void> {
        const id : number = parseInt(req.query.id as string)
        const result = await this.productService.getDetail(id)
        res.status(result.status).json(result)
    }
}
