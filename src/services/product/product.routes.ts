import {Request, Response, Router} from "express";
import {UserController} from "../user/user.controller";
import {ProductController} from "./product.controller";

export class ProductRoutes {
    constructor(private router: Router, public productController: ProductController) {
    }

    getRoutes(): Router {

        this.router.get('/product/list',
            (req: Request, res: Response) => this.productController.getAll(req, res))
        this.router.get('/product/detail',
            (req: Request, res: Response) => this.productController.getDetail(req, res))
        return this.router
    }
}
