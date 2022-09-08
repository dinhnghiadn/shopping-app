import { UserService } from './user.service'
import { SignIn } from '../../models/dto/sign-in'
import { SignUp } from '../../models/dto/sign-up'
import { Request, Response } from 'express'
import { validate } from 'class-validator'
import { plainToClass, plainToInstance } from 'class-transformer'
import { ForgotPassword } from '../../models/dto/forgot-password'
import { EditProfile } from '../../models/dto/edit-profile'
import { isSuccessResponse } from '../../utils/common/interfaces'
import { Role } from '../../utils/common/enum'
import { User } from '../../models/entities/User.entity'
import { upload, uploadImage } from '../../utils/common/images'
import { EditItems } from '../../models/dto/edit-items'

export class UserController {
    constructor(public userService: UserService) {}

    async signUp(body: SignUp, res: Response): Promise<void> {
        const errors = await validate(plainToInstance(SignUp, body))
        if (errors.length > 0) {
            let messages = JSON.stringify(errors.map((error) => error.constraints))
            res.status(400).send(messages)
            return
        }

        const result = await this.userService.signUp(body)
        res.status(result.status).json(result)
    }

    async verify(req: Request, res: Response): Promise<void> {
        const token = req.query.token
        const result = await this.userService.verify(token as string)
        res.status(result.status).json(result)
    }

    async login(req: Request, res: Response): Promise<void> {
        // if (req.session.isAdmin) {
        //     res.redirect('/admin/user')
        //     return
        // }
        const data = req.body
        const errors = await validate(plainToInstance(SignIn, data))
        if (errors.length > 0) {
            let messages = JSON.stringify(errors.map((error) => error.constraints))
            res.status(400).send(messages)
            return
        }
        const result = await this.userService.login(data)
        if (isSuccessResponse(result)) {
            const user = result.resource as User
            if (user.role === Role.Admin) {
                req.session.isAdmin = true
                res.redirect('/admin/user')
                return
            }
        }
        res.status(result.status).json(result)
    }

    async forgot(body: ForgotPassword, res: Response): Promise<void> {
        const errors = await validate(plainToInstance(ForgotPassword, body))
        if (errors.length > 0) {
            let messages = JSON.stringify(errors.map((error) => error.constraints))
            res.status(400).send(messages)
            return
        }
        const result = await this.userService.forgotPassword(body)
        res.status(result.status).json(result)
    }

    async reset(req: Request, res: Response): Promise<void> {
        const token = req.query.token
        const result = await this.userService.reset(token as string)
        res.status(result.status).json(result)
    }

    async viewProfile(req: Request, res: Response): Promise<void> {
        const result = await this.userService.viewProfile(req.body.user)
        res.status(result.status).json(result)
    }

    async addProfile(req: Request, res: Response): Promise<void> {
        const { user, token, ...profile } = req.body
        const errors = await validate(plainToInstance(EditProfile, profile))
        if (errors.length > 0) {
            let messages = JSON.stringify(errors.map((error) => error.constraints))
            res.status(400).send(messages)
            return
        }
        const result = await this.userService.addProfile(profile, user)
        res.status(result.status).json(result)
    }

    async getAvatar(req: Request, res: Response): Promise<void> {
        const user = req.body.user
        const result = await this.userService.getAvatar(user)
        res.status(result.status).json(result)
    }

    async uploadAvatar(req: Request, res: Response): Promise<void> {
        const user = req.body.user
        if (!req.file) {
            res.status(400).send('Error: No files found')
            return
        }
        const result = await this.userService.uploadAvatar(req.file, user)
        res.status(result.status).json(result)
    }

    async getAllOrders(req: Request, res: Response): Promise<void> {
        const user = req.body.user
        const orderBy: string = req.query.sort as string
        const result = await this.userService.getAllOrders(user, orderBy)
        res.status(result.status).json(result)
    }

    async getOrderDetail(req: Request, res: Response) {
        const id = parseInt(req.params.id as string)
        const user = req.body.user
        const result = await this.userService.getOrderDetail(user, id)
        res.status(result.status).json(result)
    }
}
