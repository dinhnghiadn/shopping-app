import {Router} from "express";
import {UserService} from "../../services/user/user.service";
import {User} from "../../models/entities/User.entity";
import {UserController} from "../../services/user/user.controller";
import {UserRoutes} from "../../services/user/user.routes";
import {DatabaseConnection} from "../database/db";
import {ProductService} from "../../services/product/product.service";
import {ProductController} from "../../services/product/product.controller";
import {ProductRoutes} from "../../services/product/product.routes";
import {CategoryService} from "../../services/category/category.service";
import {CategoryController} from "../../services/category/category.controller";
import {CategoryRoutes} from "../../services/category/category.routes";
import {CartService} from "../../services/cart/cart.service";
import {CartController} from "../../services/cart/cart.controller";
import {CartRoutes} from "../../services/cart/cart.routes";



export const wrap = (dataSource: DatabaseConnection, router: Router) => {

    //Cart
    const cartService = new CartService(dataSource.getRepository('Cart'),dataSource.getRepository('User'))
    const cartController = new CartController(cartService)
    new CartRoutes(router,cartController).getRoutes()

    //Product
    const productService = new ProductService(dataSource.getRepository('Product'))
    const productController = new ProductController(productService)
    new ProductRoutes(router,productController).getRoutes()

    //Category
    const categoryService = new CategoryService(dataSource.getRepository('Category'))
    const categoryController = new CategoryController(categoryService)
    new CategoryRoutes(router, categoryController).getRoutes()

    //User
    const userService = new UserService(dataSource.getRepository('User'),dataSource.getRepository('Cart'))
    const userController = new UserController(userService)
    new UserRoutes(router, userController).getUserRoutes()

    return router
}
