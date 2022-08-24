import {AdminService} from "./admin.service";
import {Request, Response} from "express";
import {validate} from "class-validator";
import {plainToInstance} from "class-transformer";
import {CategoryInput} from "../../models/dto/category-input";
import {CategoryEdit} from "../../models/dto/category-edit";
import {ProductInput} from "../../models/dto/product-input";
export class AdminController{
    constructor(public adminService:AdminService) {
    }

    // User controller for admin
    async getAllUsers(res:Response) : Promise<void> {
        const result = await this.adminService.getAllUsers()
        res.status(result.status).json(result)
    }

    async getUserDetail(req:Request,res:Response): Promise<void>{
        const id : number = parseInt(req.params.id as string)
        const result = await this.adminService.getUserDetail(id)
        res.status(result.status).json(result)

    }
    async deleteUser(req:Request,res:Response): Promise<void>{
        const id : number = parseInt(req.params.id as string)
        const result = await this.adminService.deleteUser(id)
        res.status(result.status).json(result)

    }

    async blockUser(req:Request,res:Response): Promise<void>{
        const id : number = parseInt(req.params.id as string)
        const result = await this.adminService.blockUser(id)
        res.status(result.status).json(result)

    }

    async unblockUser(req:Request,res:Response): Promise<void>{
        const id : number = parseInt(req.params.id as string)
        const result = await this.adminService.unblockUser(id)
        res.status(result.status).json(result)

    }

    // Category controller for admin


    async getAllCategories(res: Response): Promise<void> {
        const result = await this.adminService.getAllCategories()
        res.status(result.status).json(result)
    }


    async getCategoryDetail(req:Request,res: Response): Promise<void> {
        const id = parseInt(req.params.id as string)
        const result = await this.adminService.getCategoryDetail(id)
        res.status(result.status).json(result)
    }

    async addCategory(req: Request, res: Response): Promise<void> {
        const data = req.body
        const errors = await validate(plainToInstance(CategoryInput, data))
        if (errors.length > 0) {
            let messages = JSON.stringify(errors.map(error => error.constraints))
            res.status(400).send(messages)
            return
        }
        const file = req.file!
        const result = await this.adminService.addCategory(data,file)
        res.status(result.status).json(result)
    }

    async editCategory(req: Request, res: Response): Promise<void> {
        const id:number = parseInt(req.params.id as string)
        const data = req.body
        const errors = await validate(plainToInstance(CategoryEdit, data))
        if (errors.length > 0) {
            let messages = JSON.stringify(errors.map(error => error.constraints))
            res.status(400).send(messages)
            return
        }
        const file = req.file!
        const result = await this.adminService.editCategory(id,data,file)
        res.status(result.status).json(result)
    }

    async deleteCategory(req: Request, res: Response):Promise<void>  {
        const id:number = parseInt(req.params.id as string)
        const result = await this.adminService.deleteCategory(id)
        res.status(result.status).json(result)

    }
    // Product controller for admin
    async getAllProducts(res: Response):Promise<void> {
        const result = await this.adminService.getAllProducts()
        res.status(result.status).json(result)
    }

    async addProduct(req:Request, res: Response): Promise<void> {
        const data = req.body
        // TODO: parse string to int

        const errors = await validate(plainToInstance(ProductInput, data))
        if (errors.length > 0) {
            let messages = JSON.stringify(errors.map(error => error.constraints))
            res.status(400).send(messages)
            return
        }
        const files = req.files as Express.Multer.File[]
        const result = await this.adminService.addProduct(data,files)
        res.status(result.status).json(result)
    }
}
