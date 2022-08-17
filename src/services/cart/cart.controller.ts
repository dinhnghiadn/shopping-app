import {CartService} from "./cart.service";
import {Request, Response} from "express";
export class CartController {
    constructor(public cartService: CartService) {
    }

    async viewCart(req: Request, res: Response): Promise<void> {
        const result = await this.cartService.viewCart(req)
        res.status(result.status).json(result)
    }

    async addItems(req: Request, res: Response): Promise<void>{
        // const result = await this.cartService.addItems(req)
        // res.status(result.status).json(result)
    }
}
