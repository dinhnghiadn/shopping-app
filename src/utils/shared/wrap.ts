import { Router } from 'express'
import { UserService } from '../../services/user/user.service'
import { User } from '../../models/entities/User.entity'
import { UserController } from '../../services/user/user.controller'
import { UserRoutes } from '../../services/user/user.routes'
import { DatabaseConnection } from '../database/db'
import { ProductService } from '../../services/product/product.service'
import { ProductController } from '../../services/product/product.controller'
import { ProductRoutes } from '../../services/product/product.routes'
import { CategoryService } from '../../services/category/category.service'
import { CategoryController } from '../../services/category/category.controller'
import { CategoryRoutes } from '../../services/category/category.routes'
import { CartService } from '../../services/cart/cart.service'
import { CartController } from '../../services/cart/cart.controller'
import { CartRoutes } from '../../services/cart/cart.routes'
import { OrderService } from '../../services/order/order.service'
import { OrderController } from '../../services/order/order.controller'
import { OrderRoutes } from '../../services/order/order.routes'
import { AdminService } from '../../services/admin/admin.service'
import { AdminController } from '../../services/admin/admin.controller'
import { AdminRoutes } from '../../services/admin/admin.routes'

export const wrap = (dataSource: DatabaseConnection, router: Router) => {
    //Cart
    const cartService = new CartService(
        dataSource.getRepository('Cart'),
        dataSource.getRepository('CartProduct'),
        dataSource.getRepository('Product'),
        dataSource.getRepository('User'),
        dataSource.getRepository('Order'),
        dataSource.getRepository('OrderProduct')
    )
    const cartController = new CartController(cartService)
    new CartRoutes(router, cartController).getRoutes()

    //Cron jobs
    cartService.startCronJob()

    //Order
    const orderService = new OrderService(
        dataSource.getRepository('Order'),
        dataSource.getRepository('Product'),
        dataSource.getRepository('User'),
        dataSource.entityManager
    )
    const orderController = new OrderController(orderService)
    new OrderRoutes(router, orderController).getOrderRoutes()

    //Product
    const productService = new ProductService(dataSource.getRepository('Product'))
    const productController = new ProductController(productService)
    new ProductRoutes(router, productController).getRoutes()

    //Category
    const categoryService = new CategoryService(dataSource.getRepository('Category'))
    const categoryController = new CategoryController(categoryService)
    new CategoryRoutes(router, categoryController).getRoutes()

    //User
    const userService = new UserService(
        dataSource.getRepository('User'),
        dataSource.getRepository('Image'),
        dataSource.getRepository('Order')
    )

    const userController = new UserController(userService)
    new UserRoutes(router, userController).getUserRoutes()

    //Admin
    const adminService = new AdminService(
        dataSource.getRepository('Cart'),
        dataSource.getRepository('CartProduct'),
        dataSource.getRepository('Category'),
        dataSource.getRepository('Product'),
        dataSource.getRepository('User'),
        dataSource.getRepository('Order'),
        dataSource.getRepository('OrderProduct'),
        dataSource.getRepository('Image')
    )
    const adminController = new AdminController(adminService)
    new AdminRoutes(router, adminController).getRoutes()

    return router
}
