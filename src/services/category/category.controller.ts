import {CategoryService} from "./category.service";
import {Request, Response} from "express";

export class CategoryController{
    constructor(public categoryService: CategoryService) {

    }
    async getAll(req:Request,res:Response): Promise<void>{
        const orderBy: string = req.query.sort as string
        const result = await this.categoryService.getAll(orderBy)
        res.status(result.status).json(result)
    }

    async getOne(req: Request, res: Response): Promise<void> {
        const id:number = parseInt(req.query.id as string)
        const result = await this.categoryService.getOne(id)
        res.status(result.status).json(result)
    }
}
