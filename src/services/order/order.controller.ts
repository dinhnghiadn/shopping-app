import { OrderService } from './order.service'
import { Request, Response } from 'express'
export class OrderController {
    constructor(public orderService: OrderService) {}

    async complete(req: Request, res: Response): Promise<void> {
        const id: number = parseInt(req.params.id as string)
        const user = req.body.user
        const result = await this.orderService.complete(id, user)
        res.status(result.status).json(result)
    }

    async successPayment(req: Request, res: Response): Promise<void> {
        const token: string = req.query.token as string
        const result = await this.orderService.successPayment(token)
        res.status(result.status).json(result)
    }

    async cancelPayment(req: Request, res: Response): Promise<void> {
        const token: string = req.query.token as string
        const result = await this.orderService.cancelPayment(token)
        res.status(result.status).json(result)
    }
}
