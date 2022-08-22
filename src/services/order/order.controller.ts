import {OrderService} from "./order.service";
import {Request, Response} from "express";
export class OrderController{
    constructor(public orderService:OrderService) {
    }

    async complete(req: Request, res: Response): Promise<void> {
        const {user,token,...data} = req.body
        const result = await this.orderService.complete(data.orderId,user)
        res.status(result!.status).json(result)
    }
}
