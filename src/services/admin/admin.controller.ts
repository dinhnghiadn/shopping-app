import { AdminService } from './admin.service'
import { Request, Response } from 'express'
import { validate } from 'class-validator'
import { plainToInstance } from 'class-transformer'
import { CategoryInput } from '../../models/dto/category-input'
import { CategoryEdit } from '../../models/dto/category-edit'
import { ProductInput } from '../../models/dto/product-input'
import { ProductEdit } from '../../models/dto/product-edit'
import { OrderStatus } from '../../utils/common/enum'
import { isSuccessResponse } from '../../utils/common/interfaces'

export class AdminController {
    constructor(public adminService: AdminService) {}

    // User controller for admin
    async getAllUsers(res: Response): Promise<void> {
        const result = await this.adminService.getAllUsers()
        if (isSuccessResponse(result)) {
            const users = result.resources
            res.render('admin/user/user_index', { users })
            return
        }
        res.status(result.status).json(result)
    }

    async getUserDetail(req: Request, res: Response): Promise<void> {
        const id: number = parseInt(req.params.id as string)
        const result = await this.adminService.getUserDetail(id)
        if (isSuccessResponse(result)) {
            const user = result.resource
            res.render('admin/user/user_detail', { user })
            return
        }
        res.status(result.status).json(result)
    }

    async deleteUser(req: Request, res: Response): Promise<void> {
        const id: number = parseInt(req.params.id as string)
        const result = await this.adminService.deleteUser(id)
        res.status(result.status).json(result)
    }

    async blockUser(req: Request, res: Response): Promise<void> {
        const id: number = parseInt(req.params.id as string)
        const result = await this.adminService.blockUser(id)
        res.status(result.status).json(result)
    }

    async unblockUser(req: Request, res: Response): Promise<void> {
        const id: number = parseInt(req.params.id as string)
        const result = await this.adminService.unblockUser(id)
        res.status(result.status).json(result)
    }

    // Category controller for admin

    async getAllCategories(res: Response): Promise<void> {
        const result = await this.adminService.getAllCategories()
        res.status(result.status).json(result)
    }

    async getCategoryDetail(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id as string)
        const result = await this.adminService.getCategoryDetail(id)
        res.status(result.status).json(result)
    }

    async addCategory(req: Request, res: Response): Promise<void> {
        const data = req.body
        const errors = await validate(plainToInstance(CategoryInput, data))
        if (errors.length > 0) {
            let messages = JSON.stringify(errors.map((error) => error.constraints))
            res.status(400).send(messages)
            return
        }
        const file = req.file!
        const result = await this.adminService.addCategory(data, file)
        res.status(result.status).json(result)
    }

    async editCategory(req: Request, res: Response): Promise<void> {
        const id: number = parseInt(req.params.id as string)
        const data = req.body
        const errors = await validate(plainToInstance(CategoryEdit, data))
        if (errors.length > 0) {
            let messages = JSON.stringify(errors.map((error) => error.constraints))
            res.status(400).send(messages)
            return
        }
        const file = req.file!
        const result = await this.adminService.editCategory(id, data, file)
        res.status(result.status).json(result)
    }

    async deleteCategory(req: Request, res: Response): Promise<void> {
        const id: number = parseInt(req.params.id as string)
        const result = await this.adminService.deleteCategory(id)
        res.status(result.status).json(result)
    }

    // Product controller for admin
    async getAllProducts(res: Response): Promise<void> {
        const result = await this.adminService.getAllProducts()
        res.status(result.status).json(result)
    }

    async getProductDetail(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id as string)
        const result = await this.adminService.getProductDetail(id)
        res.status(result.status).json(result)
    }

    async addProductImages(req: Request, res: Response): Promise<void> {
        const files = req.files as Express.Multer.File[]
        const result = await this.adminService.addProductImages(files)
        res.status(result.status).json(result)
    }

    async addProduct(req: Request, res: Response): Promise<void> {
        const data = req.body
        const errors = await validate(plainToInstance(ProductInput, data))
        if (errors.length > 0) {
            let messages = JSON.stringify(errors.map((error) => error.constraints))
            res.status(400).send(messages)
            return
        }
        const result = await this.adminService.addProduct(data)
        res.status(result.status).json(result)
    }

    async editProduct(req: Request, res: Response): Promise<void> {
        const id: number = parseInt(req.params.id as string)
        const data = req.body
        const errors = await validate(plainToInstance(ProductEdit, data))
        if (errors.length > 0) {
            let messages = JSON.stringify(errors.map((error) => error.constraints))
            res.status(400).send(messages)
            return
        }
        const result = await this.adminService.editProduct(id, data)
        res.status(result.status).json(result)
    }

    async deleteProduct(req: Request, res: Response): Promise<void> {
        const id: number = parseInt(req.params.id as string)
        const result = await this.adminService.deleteProduct(id)
        res.status(result.status).json(result)
    }

    // Order controller for admin
    async getAllOrders(res: Response): Promise<void> {
        const result = await this.adminService.getAllOrders()
        res.status(result.status).json(result)
    }

    async getOrderDetail(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id as string)
        const result = await this.adminService.getOrderDetail(id)
        res.status(result.status).json(result)
    }

    async changeOrderStatus(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id as string)
        const status = req.body.status
        if (!Object.values(OrderStatus).includes(status as OrderStatus)) {
            res.status(400).send({ message: 'Invalid status type!' })
            return
        }
        const result = await this.adminService.changeOrderStatus(id, status)
        res.status(result.status).json(result)
    }

    async adminIndex(res: Response): Promise<void> {
        res.render('admin/index.ejs')
    }
}
