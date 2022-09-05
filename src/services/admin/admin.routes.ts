import { NextFunction, Request, Response, Router } from 'express'
import { AdminController } from './admin.controller'
import { adminAuth } from '../../utils/common/auth'
import { upload } from '../../utils/common/images'

export class AdminRoutes {
    constructor(private router: Router, public adminController: AdminController) {}
    getRoutes(): Router {
        //Index
        this.router.get('/admin', (req: Request, res: Response) =>
            this.adminController.adminIndex(req, res)
        )
        //User routes
        this.router.get(
            '/admin/user',
            (req: Request, res: Response, next: NextFunction) =>
                adminAuth(req, res, next),
            (req: Request, res: Response) => this.adminController.getAllUsers(res)
        )
        this.router.get(
            '/admin/user/:id',
            (req: Request, res: Response, next: NextFunction) =>
                adminAuth(req, res, next),
            (req: Request, res: Response) => this.adminController.getUserDetail(req, res)
        )
        this.router.delete(
            '/admin/user/:id',
            (req: Request, res: Response, next: NextFunction) =>
                adminAuth(req, res, next),
            (req: Request, res: Response) => this.adminController.deleteUser(req, res)
        )
        this.router.post(
            '/admin/user/block/:id',
            (req: Request, res: Response, next: NextFunction) =>
                adminAuth(req, res, next),
            (req: Request, res: Response) => this.adminController.blockUser(req, res)
        )
        this.router.post(
            '/admin/user/unblock/:id',
            (req: Request, res: Response, next: NextFunction) =>
                adminAuth(req, res, next),
            (req: Request, res: Response) => this.adminController.unblockUser(req, res)
        )

        //Category routes
        this.router.get(
            '/admin/category',
            (req: Request, res: Response, next: NextFunction) =>
                adminAuth(req, res, next),
            (req: Request, res: Response) => this.adminController.getAllCategories(res)
        )
        this.router.get(
            '/admin/category/add',
            (req: Request, res: Response, next: NextFunction) =>
                adminAuth(req, res, next),
            (req: Request, res: Response) =>
                this.adminController.addCategoryIndex(req, res)
        )
        this.router.post(
            '/admin/category/add',
            upload.single('image'),
            (req: Request, res: Response, next: NextFunction) =>
                adminAuth(req, res, next),
            (req: Request, res: Response) => this.adminController.addCategory(req, res)
        )
        this.router.get(
            '/admin/category/:id',
            (req: Request, res: Response, next: NextFunction) =>
                adminAuth(req, res, next),
            (req: Request, res: Response) =>
                this.adminController.getCategoryDetail(req, res)
        )

        this.router.put(
            '/admin/category/:id',
            upload.single('image'),
            (req: Request, res: Response, next: NextFunction) =>
                adminAuth(req, res, next),
            (req: Request, res: Response) => this.adminController.editCategory(req, res)
        )
        this.router.delete(
            '/admin/category/:id',
            (req: Request, res: Response, next: NextFunction) =>
                adminAuth(req, res, next),
            (req: Request, res: Response) => this.adminController.deleteCategory(req, res)
        )

        //Product routes
        this.router.get(
            '/admin/product',
            (req: Request, res: Response, next: NextFunction) =>
                adminAuth(req, res, next),
            (req: Request, res: Response) => this.adminController.getAllProducts(res)
        )
        this.router.get(
            '/admin/product/add',
            (req: Request, res: Response, next: NextFunction) =>
                adminAuth(req, res, next),
            (req: Request, res: Response) =>
                this.adminController.addProductIndex(req, res)
        )
        this.router.get(
            '/admin/product/:id',
            (req: Request, res: Response, next: NextFunction) =>
                adminAuth(req, res, next),
            (req: Request, res: Response) =>
                this.adminController.getProductDetail(req, res)
        )
        // this.router.post(
        //     '/admin/product/images',
        //     upload.array('images'),
        //     (req: Request, res: Response, next: NextFunction) =>
        //         adminAuth(req, res, next),
        //     (req: Request, res: Response) =>
        //         this.adminController.addProductImages(req, res)
        // )

        this.router.post(
            '/admin/product/add',
            upload.array('images'),
            (req: Request, res: Response, next: NextFunction) =>
                adminAuth(req, res, next),
            (req: Request, res: Response) => this.adminController.addProduct(req, res)
        )
        this.router.put(
            '/admin/product/:id',
            upload.single('image'),
            (req: Request, res: Response, next: NextFunction) =>
                adminAuth(req, res, next),
            (req: Request, res: Response) => this.adminController.editProduct(req, res)
        )
        this.router.delete(
            '/admin/product/:id',
            (req: Request, res: Response, next: NextFunction) =>
                adminAuth(req, res, next),
            (req: Request, res: Response) => this.adminController.deleteProduct(req, res)
        )

        //Order routes
        this.router.get(
            '/admin/order',
            (req: Request, res: Response, next: NextFunction) =>
                adminAuth(req, res, next),
            (req: Request, res: Response) => this.adminController.getAllOrders(res)
        )
        this.router.get(
            '/admin/order/:id',
            (req: Request, res: Response, next: NextFunction) =>
                adminAuth(req, res, next),
            (req: Request, res: Response) => this.adminController.getOrderDetail(req, res)
        )
        this.router.post(
            '/admin/order/status/:id',
            (req: Request, res: Response, next: NextFunction) =>
                adminAuth(req, res, next),
            (req: Request, res: Response) =>
                this.adminController.changeOrderStatus(req, res)
        )

        return this.router
    }
}
