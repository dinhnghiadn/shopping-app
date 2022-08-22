import {CartService} from "./cart.service";
import {Request, Response} from "express";
import {CheckoutItems} from "../../models/dto/checkout-items";
import { PaymentMethod} from "../../utils/common/enum";
export class CartController {
    constructor(public cartService: CartService) {
    }

    async viewCart(req: Request, res: Response): Promise<void> {
        const result = await this.cartService.viewCart(req)
        res.status(result.status).json(result)

    }

    async addItems(req: Request, res: Response): Promise<void>{
        const {user,token,...data} = req.body
        const result = await this.cartService.addItems(data,user)
        res.status(result.status).json(result)
    }

    async removeItems(req: Request, res: Response): Promise<void>{
        const {user,token,...data} = req.body
        const result = await this.cartService.removeItems(data,user)
        res.status(result.status).json(result)
    }

    async checkOut(req: Request, res: Response): Promise<void>{
        const {user,token,...data} = req.body
        const dataArray : CheckoutItems[] = data.checkoutProduct
        const paymentMethod : PaymentMethod = data.paymentMethod
        const result = await this.cartService.checkOut(dataArray,paymentMethod,user)
        res.status(result.status).json(result)
    }
}
