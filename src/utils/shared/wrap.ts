import {Router} from "express";
import {UserService} from "../../services/user/user.service";
import {User} from "../../models/entities/User.entity";
import {UserController} from "../../services/user/user.controller";
import {UserRoutes} from "../../services/user/user.routes";
import {DatabaseConnection} from "../database/db";
import {ProductService} from "../../services/product/product.service";
import {ProductController} from "../../services/product/product.controller";
import {ProductRoutes} from "../../services/product/product.routes";


// export const wrapRepositories = (dataSource:DatabaseConnection) => {
//     const productRepository = dataSource.getRepository('Product')
//     const userRepository = dataSource.getRepository('User')
//     return {
//         productRepository,
//         userRepository
//     }
// }

export const wrap = (dataSource: DatabaseConnection, router: Router) => {

    //Product
    const productRepository = dataSource.getRepository('Product')
    const productService = new ProductService(productRepository)
    const productController = new ProductController(productService)
    const productRoutes = new ProductRoutes(router, productController).getRoutes()

    //User
    const userRepository = dataSource.getRepository('User')
    const userService = new UserService(userRepository)
    const userController = new UserController(userService)
    const userRoutes = new UserRoutes(router, userController).getUserRoutes()

    return {userRoutes, productRoutes}
}
