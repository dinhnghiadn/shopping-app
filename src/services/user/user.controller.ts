import {UserService} from "./user.service";
import {SignIn} from "../../models/dto/sign-in";
import {SignUp} from "../../models/dto/sign-up";
import {Request, Response} from "express";
import {validate} from "class-validator";
import {plainToClass, plainToInstance} from "class-transformer";
import {ForgotPassword} from "../../models/dto/forgot-password";
import {EditProfile} from "../../models/dto/edit-profile";


export class UserController {
    constructor(public userService: UserService) {
    }


    async signUp(body: SignUp, res: Response): Promise<void> {
        const errors = await validate(plainToClass(SignUp, body))
        if (errors.length > 0) {
            let messages = JSON.stringify(errors.map(error => error.constraints))
            res.status(400).send(messages)
            return
        }

        const result = await this.userService.signUp(body)
        res.status(result.status).json(result)
        return

    }

    async verify(req: Request, res: Response): Promise<void> {
        const token = req.query.token
        const result = await this.userService.verify(token as string)
        res.status(result.status).json(result)
        return

    }

    async login(data: SignIn, res: Response): Promise<void> {
        const errors = await validate(plainToInstance(SignIn, data))
        if (errors.length > 0) {
            let messages = JSON.stringify(errors.map(error => error.constraints))
            res.status(400).send(messages)
            return
        }
        const result = await this.userService.login(data)
        res.status(result.status).json(result)
        return

    }

    async forgot(body: ForgotPassword, res: Response): Promise<void> {
        const result = await this.userService.forgotPassword(body)
        res.status(result.status).json(result)
        return
    }

    async reset(req: Request, res: Response): Promise<void> {
        const token = req.query.token
        const result = await this.userService.reset(token as string)
        res.status(result.status).json(result)
        return
    }

    async viewProfile(req:Request,res: Response): Promise<void>{
        const result = await this.userService.viewProfile(req.body.user)
        res.status(result.status).json(result)
        return
    }

    async editProfile(req:Request,res: Response): Promise<void>{
        const {user,token,...profile} = req.body
        const errors = await validate(plainToInstance(EditProfile, profile))
        if (errors.length > 0) {
            let messages = JSON.stringify(errors.map(error => error.constraints))
            res.status(400).send(messages)
            return
        }
        const result = await this.userService.editProfile(profile,user)
        res.status(result.status).json(result)
        return
    }
}
