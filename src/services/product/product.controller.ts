import {ProductService} from "./product.service";
import {Request, Response} from "express";
export class ProductController {
    constructor(public productService: ProductService) {
    }
    async getAll(req:Request,res:Response): Promise<void>{

    }
}
