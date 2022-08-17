import {CategoryService} from "./category.service";
import {Request, Response} from "express";

export class CategoryController{
    constructor(public categoryService: CategoryService) {

    }
    async getAll(req:Request,res:Response): Promise<void>{
        const result = await this.categoryService.getAll(req)
        res.status(result.status).json(result)
    }

    async getOne(req: Request, res: Response): Promise<void> {
        const result = await this.categoryService.getOne(req)
        res.status(result.status).json(result)
    }
}
