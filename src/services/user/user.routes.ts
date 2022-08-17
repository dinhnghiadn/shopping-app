import {NextFunction, Request, Response, Router} from "express";
import {UserController} from "./user.controller";
import {auth} from "../../utils/common/auth";

export class UserRoutes {
    constructor(private router: Router, public userController: UserController) {
    }

    getUserRoutes(): Router {

        this.router.post('/register', (req: Request, res: Response) => this.userController.signUp(req.body, res))
        this.router.get('/verify', (req: Request, res: Response) => this.userController.verify(req, res))
        this.router.post('/login', (req: Request, res: Response) => this.userController.login(req.body, res))
        this.router.post('/forgot', (req: Request, res: Response) => this.userController.forgot(req.body, res))
        this.router.get('/reset', (req: Request, res: Response) => this.userController.reset(req, res))
        this.router.get('/profile', (req: Request, res: Response, next: NextFunction) => auth(req,res,next, this.userController.userService.userRepository)
            , (req: Request, res: Response) => this.userController.viewProfile(req, res))
        this.router.post('/profile', (req: Request, res: Response, next: NextFunction) => auth(req,res,next,this.userController.userService.userRepository)
        , (req: Request, res: Response) => this.userController.editProfile(req, res))

        return this.router
    }
}
