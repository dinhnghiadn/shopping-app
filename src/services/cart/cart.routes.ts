import {NextFunction, Request, Response, Router} from "express";
import {CartController} from "./cart.controller";
import {auth} from "../../utils/common/auth";

export class CartRoutes{
    constructor(private router: Router, public cartController: CartController) {
    }

    getRoutes(): Router {
        this.router.get('/cart', (req: Request, res: Response, next: NextFunction) => auth(req,res,next, this.cartController.cartService.userRepository)
            , (req: Request, res: Response) => this.cartController.viewCart(req, res))
        this.router.post('/cart', (req: Request, res: Response, next: NextFunction) => auth(req,res,next, this.cartController.cartService.userRepository)
            , (req: Request, res: Response) => this.cartController.addItems(req, res))
        return this.router
    }
}
