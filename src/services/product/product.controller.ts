import {ProductService} from "./product.service";
import {Request, Response} from "express";
export class ProductController {
    constructor(public productService: ProductService) {
    }
    async getAll(req:Request,res:Response): Promise<void>{
        const result = await this.productService.getAll(req)
        res.status(result.status).json(result)
    }

    async getOne(req: Request, res: Response): Promise<void> {
        const result = await this.productService.getOne(req)
        res.status(result.status).json(result)
    }
}
