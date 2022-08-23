import {NextFunction, Request, Response, Router} from "express";
import {AdminController} from "./admin.controller";
import {adminAuth} from "../../utils/common/auth";

export class AdminRoutes {
    constructor(private router: Router, public adminController: AdminController) {
    }
    getRoutes(): Router {
        //User routes
        this.router.get('/admin/user/list',
            (req: Request, res: Response, next: NextFunction) => adminAuth(req, res, next),
            (req: Request, res: Response) => this.adminController.getAllUsers(res))
        this.router.get('/admin/user',
            (req: Request, res: Response, next: NextFunction) => adminAuth(req, res, next),
            (req: Request, res: Response) => this.adminController.getUserDetail(req,res))
        this.router.delete('/admin/user',
            (req: Request, res: Response, next: NextFunction) => adminAuth(req, res, next),
            (req: Request, res: Response) => this.adminController.deleteUser(req,res))
        this.router.patch('/admin/user/block',
            (req: Request, res: Response, next: NextFunction) => adminAuth(req, res, next),
            (req: Request, res: Response) => this.adminController.blockUser(req,res))
        this.router.patch('/admin/user/unblock',
            (req: Request, res: Response, next: NextFunction) => adminAuth(req, res, next),
            (req: Request, res: Response) => this.adminController.unblockUser(req,res))

        //Category routes
        this.router.get('/admin/category/list',
            (req: Request, res: Response, next: NextFunction) => adminAuth(req, res, next),
            (req: Request, res: Response) => this.adminController.getAllCategories(res))
        this.router.get('/admin/category',
            (req: Request, res: Response, next: NextFunction) => adminAuth(req, res, next),
            (req: Request, res: Response) => this.adminController.getCategoryDetail(res))
        return this.router
    }
}
