import {NextFunction, Request, Response, Router} from "express";
import {auth} from "../../utils/common/auth";
import {OrderController} from "./order.controller";

export class OrderRoutes {
    constructor(private router: Router, public orderController: OrderController) {
    }

    getOrderRoutes(): Router {
        this.router.post('/order/complete', (req: Request, res: Response, next: NextFunction) => auth(req,res,next, this.orderController.orderService.userRepository)
            , (req: Request, res: Response) => this.orderController.complete(req, res))

        return this.router
    }
}
