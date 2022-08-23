import {AdminService} from "./admin.service";
import {Request, Response} from "express";
export class AdminController{
    constructor(public adminService:AdminService) {
    }

    // User controller for admin
    async getAllUsers(res:Response) : Promise<void> {
        const result = await this.adminService.getAllUsers()
        res.status(result.status).json(result)
    }

    async getUserDetail(req:Request,res:Response): Promise<void>{
        const id : number = parseInt(req.query.id as string)
        const result = await this.adminService.getUserDetail(id)
        res.status(result.status).json(result)

    }
    async deleteUser(req:Request,res:Response): Promise<void>{
        const id : number = parseInt(req.query.id as string)
        const result = await this.adminService.deleteUser(id)
        res.status(result.status).json(result)

    }

    async blockUser(req:Request,res:Response): Promise<void>{
        const id : number = parseInt(req.query.id as string)
        const result = await this.adminService.blockUser(id)
        res.status(result.status).json(result)

    }

    async unblockUser(req:Request,res:Response): Promise<void>{
        const id : number = parseInt(req.query.id as string)
        const result = await this.adminService.unblockUser(id)
        res.status(result.status).json(result)

    }

    // Category controller for admin


    async getAllCategories(res: Response) {
        const result = await this.adminService.getAllCategories()
        res.status(result.status).json(result)
    }


    async getCategoryDetail(res: Response) {

    }
}
