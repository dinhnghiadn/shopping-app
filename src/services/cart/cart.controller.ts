import { CartService } from './cart.service'
import { Request, Response } from 'express'
import { CheckoutItems } from '../../models/dto/checkout-items'
import { PaymentMethod } from '../../utils/common/enum'
import { validate } from 'class-validator'
import { plainToInstance } from 'class-transformer'
import { CategoryInput } from '../../models/dto/category-input'
import { EditItems } from '../../models/dto/edit-items'

export class CartController {
    constructor(public cartService: CartService) {}

    async viewCart(req: Request, res: Response): Promise<void> {
        const result = await this.cartService.viewCart(req)
        res.status(result.status).json(result)
    }

    async addItems(req: Request, res: Response): Promise<void> {
        const { user, token, ...data } = req.body
        const errors = await validate(plainToInstance(EditItems, data))
        if (errors.length > 0) {
            let messages = JSON.stringify(errors.map((error) => error.constraints))
            res.status(400).send(messages)
            return
        }
        const result = await this.cartService.addItems(data, user)
        res.status(result.status).json(result)
    }

    async removeItems(req: Request, res: Response): Promise<void> {
        // const {user, token, ...data} = req.body
        // const errors = await validate(plainToInstance(EditItems, data))
        // if (errors.length > 0) {
        //     let messages = JSON.stringify(errors.map(error => error.constraints))
        //     res.status(400).send(messages)
        //     return
        // }
        const user = req.body.user
        const id: number = req.body.productId
        const result = await this.cartService.removeItems(id, user)
        res.status(result.status).json(result)
    }

    async checkOut(req: Request, res: Response): Promise<void> {
        const { user, token, ...data } = req.body
        const dataArray: CheckoutItems[] = data.checkoutProduct
        for (const data of dataArray) {
            const errors = await validate(plainToInstance(CheckoutItems, data))
            if (errors.length > 0) {
                let messages = JSON.stringify(errors.map((error) => error.constraints))
                res.status(400).send(messages)
                return
            }
        }
        const paymentMethod: PaymentMethod = data.paymentMethod
        const result = await this.cartService.checkOut(dataArray, paymentMethod, user)
        res.status(result.status).json(result)
    }
}
