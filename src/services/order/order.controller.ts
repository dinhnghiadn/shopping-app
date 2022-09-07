import { OrderService } from './order.service'
import { Request, Response } from 'express'
import { isSuccessResponse } from '../../utils/common/interfaces'
export class OrderController {
    constructor(public orderService: OrderService) {}

    async complete(req: Request, res: Response): Promise<void> {
        const id: number = parseInt(req.params.id as string)
        const user = req.body.user
        const sig = req.headers['stripe-signature'] as string
        const result = await this.orderService.complete(id, user, sig)
        res.status(result.status).json(result)
    }

    async successPayment(req: Request, res: Response): Promise<void> {
        const id: number = parseInt(req.query.orderId as string)
        const sessionId: string = req.query.sessionId as string
        const result = await this.orderService.successPayment(id, sessionId)
        res.status(result.status).json(result)
    }

    async cancelPayment(req: Request, res: Response): Promise<void> {
        const id: number = parseInt(req.query.token as string)
        const sessionId: string = req.query.sessionId as string
        const result = await this.orderService.cancelPayment(id, sessionId)
        res.status(result.status).json(result)
    }

    async orderResultHandler(req: Request, res: Response): Promise<void> {
        const payload = req.body
        // console.log('Got payload: ' + payload)
        const sig: string = req.headers['stripe-signature'] as string
        await this.orderService.orderResultHandler(payload, sig)
        res.status(200).end()
    }
}
