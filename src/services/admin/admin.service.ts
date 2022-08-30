import { In, Repository } from 'typeorm'
import { Cart } from '../../models/entities/Cart.entity'
import { CartProduct } from '../../models/entities/CartProduct.entity'
import { Product } from '../../models/entities/Product.entity'
import { User } from '../../models/entities/User.entity'
import { Order } from '../../models/entities/Order.entity'
import { OrderProduct } from '../../models/entities/OrderProduct.entity'
import { Category } from '../../models/entities/Category.entity'
import {
    ErrorResponse,
    isSuccessResponse,
    SuccessResponse,
} from '../../utils/common/interfaces'
import { OrderStatus, Owner, PaymentMethod, UserStatus } from '../../utils/common/enum'
import { CategoryInput } from '../../models/dto/category-input'
import { deleteImage, uploadImage } from '../../utils/common/images'
import { Image } from '../../models/entities/Image.entity'
import { CategoryEdit } from '../../models/dto/category-edit'
import { ProductInput } from '../../models/dto/product-input'
import { ProductEdit } from '../../models/dto/product-edit'

export class AdminService {
    constructor(
        private cartRepository: Repository<Cart>,
        private cartProductRepository: Repository<CartProduct>,
        private categoryRepository: Repository<Category>,
        private productRepository: Repository<Product>,
        private userRepository: Repository<User>,
        private orderRepository: Repository<Order>,
        private orderProductRepository: Repository<OrderProduct>,
        private imageRepository: Repository<Image>
    ) {}

    //User service for admin

    async getAllUsers(): Promise<SuccessResponse | ErrorResponse> {
        try {
            const listUser = await this.userRepository.find()
            if (listUser.length === 0) {
                return {
                    success: true,
                    status: 200,
                    message: 'Users list is empty!',
                }
            }
            return {
                success: true,
                status: 200,
                message: 'Get users list successfully!',
                resources: listUser,
            }
        } catch (e) {
            return {
                success: false,
                status: 500,
                message: 'Error occur!',
            }
        }
    }

    async getUserDetail(id: number): Promise<SuccessResponse | ErrorResponse> {
        try {
            const user = await this.userRepository.findOne({ where: { id } })
            if (!user) {
                return {
                    success: false,
                    status: 404,
                    message: 'User not found!',
                }
            }
            return {
                success: true,
                status: 200,
                message: 'Get user detail successfully!',
                resource: user,
            }
        } catch (e) {
            return {
                success: false,
                status: 500,
                message: 'Error occur!',
            }
        }
    }

    async deleteUser(id: number) {
        // try {
        const user = await this.userRepository.findOne({ where: { id } })
        if (!user) {
            return {
                success: false,
                status: 404,
                message: 'User not found!',
            }
        }
        if (user.status === UserStatus.Active)
            return {
                success: true,
                status: 200,
                message: 'User is active, cant delete!',
            }
        //TODO: fix constraint delete
        await this.userRepository.remove(user)
        return {
            success: true,
            status: 200,
            message: 'Delete user successfully!',
        }
        // } catch (e) {
        //     return {
        //         success: false,
        //         status: 500,
        //         message: 'Error occur!',
        //     }
        // }
    }

    async blockUser(id: number) {
        try {
            let user = await this.userRepository.findOne({ where: { id } })
            if (!user) {
                return {
                    success: false,
                    status: 404,
                    message: 'User not found!',
                }
            }
            if (user.status !== UserStatus.Active)
                return {
                    success: true,
                    status: 200,
                    message: 'User status is not active!',
                }
            user.status = UserStatus.Blocked
            user = await this.userRepository.save(user)
            return {
                success: true,
                status: 200,
                message: 'Block user successfully!',
                resource: user,
            }
        } catch (e) {
            return {
                success: false,
                status: 500,
                message: 'Error occur!',
            }
        }
    }

    async unblockUser(id: number) {
        try {
            let user = await this.userRepository.findOne({ where: { id } })
            if (!user) {
                return {
                    success: false,
                    status: 404,
                    message: 'User not found!',
                }
            }
            if (user.status !== UserStatus.Blocked)
                return {
                    success: true,
                    status: 200,
                    message: 'User status is not blocked!',
                }
            user.status = UserStatus.Active
            user = await this.userRepository.save(user)
            return {
                success: true,
                status: 200,
                message: 'Unblock user successfully!',
                resource: user,
            }
        } catch (e) {
            return {
                success: false,
                status: 500,
                message: 'Error occur!',
            }
        }
    }

    //Category service for admin
    async getAllCategories(): Promise<SuccessResponse | ErrorResponse> {
        try {
            const listCategories = await this.categoryRepository.find()
            if (listCategories.length === 0) {
                return {
                    success: true,
                    status: 200,
                    message: 'Categories list is empty!',
                }
            }
            return {
                success: true,
                status: 200,
                message: 'Get categories list successfully!',
                resources: listCategories,
            }
        } catch (e) {
            return {
                success: false,
                status: 500,
                message: 'Error occur!',
            }
        }
    }

    async getCategoryDetail(id: number): Promise<SuccessResponse | ErrorResponse> {
        try {
            const category = await this.categoryRepository.findOne({ where: { id } })
            if (!category) {
                return {
                    success: false,
                    status: 404,
                    message: 'Category not found!',
                }
            }
            const image = await this.imageRepository.findOne({
                where: {
                    ownerId: category.id,
                    belongTo: Owner.Category,
                },
            })
            return {
                success: true,
                status: 200,
                message: 'Get category detail successfully!',
                resource: category,
                image: image,
            }
        } catch (e) {
            return {
                success: false,
                status: 500,
                message: 'Error occur!',
            }
        }
    }

    async addCategory(
        data: CategoryInput,
        file: Express.Multer.File
    ): Promise<SuccessResponse | ErrorResponse> {
        try {
            const category = this.categoryRepository.create(data)
            const savedCategory = await this.categoryRepository.save(category)
            const uploadResult = await uploadImage(file, 'categories')
            let savedImage
            if (isSuccessResponse(uploadResult)) {
                const imageUrl: string = uploadResult.resource as string
                const image = this.imageRepository.create({
                    url: imageUrl,
                    belongTo: Owner.Category,
                    ownerId: savedCategory.id,
                })
                savedImage = await this.imageRepository.save(image)
            }
            return {
                success: true,
                status: 201,
                message: 'Create category successfully!',
                resource: {
                    category: savedCategory,
                    image: savedImage,
                },
            }
        } catch (e) {
            return {
                success: false,
                status: 500,
                message: 'Error occur!',
            }
        }
    }

    async editCategory(
        id: number,
        data: CategoryEdit,
        file?: Express.Multer.File
    ): Promise<SuccessResponse | ErrorResponse> {
        try {
            let existCategory = await this.categoryRepository.findOne({ where: { id } })
            if (!existCategory) {
                return {
                    success: false,
                    status: 404,
                    message: 'Category not found!',
                }
            }

            if (file) {
                const uploadResult = await uploadImage(file, 'categories')
                if (isSuccessResponse(uploadResult)) {
                    const imageUrl: string = uploadResult.resource as string
                    const existImage = await this.imageRepository.findOne({
                        where: {
                            belongTo: Owner.Category,
                            ownerId: existCategory.id,
                        },
                    })
                    if (existImage) {
                        await deleteImage(existImage.url)
                        existImage.url = imageUrl
                        await this.imageRepository.save(existImage)
                    } else {
                        const image = this.imageRepository.create({
                            url: imageUrl,
                            belongTo: Owner.Category,
                            ownerId: existCategory.id,
                        })
                        await this.imageRepository.save(image)
                    }
                }
            }
            await this.categoryRepository.update(
                { id },
                {
                    name: data.name,
                    description: data.description,
                }
            )
            return {
                success: true,
                status: 200,
                message: 'Update category successfully!',
            }
        } catch (e) {
            return {
                success: false,
                status: 500,
                message: 'Error occur!',
            }
        }
    }

    async deleteCategory(id: number) {
        try {
            let existCategory = await this.categoryRepository.findOne({ where: { id } })
            if (!existCategory) {
                return {
                    success: false,
                    status: 404,
                    message: 'Category not found!',
                }
            }
            if (existCategory.numberOfProducts !== 0) {
                return {
                    success: false,
                    status: 400,
                    message: 'Cant delete category which have products!',
                }
            }
            const existImage = await this.imageRepository.findOne({
                where: {
                    belongTo: Owner.Category,
                    ownerId: existCategory.id,
                },
            })
            if (existImage) {
                await deleteImage(existImage.url)
                await this.imageRepository.remove(existImage)
            }
            await this.categoryRepository.remove(existCategory)
            return {
                success: true,
                status: 200,
                message: 'Delete category successfully!',
            }
        } catch (e) {
            return {
                success: false,
                status: 500,
                message: 'Error occur!',
            }
        }
    }

    //Product service for admin
    async getAllProducts() {
        try {
            const listProducts = await this.productRepository.find()
            if (listProducts.length === 0) {
                return {
                    success: true,
                    status: 200,
                    message: 'Products list is empty!',
                }
            }
            return {
                success: true,
                status: 200,
                message: 'Get products list successfully!',
                resources: listProducts,
            }
        } catch (e) {
            return {
                success: false,
                status: 500,
                message: 'Error occur!',
            }
        }
    }

    async getProductDetail(id: number) {
        try {
            const product = await this.productRepository.findOne({ where: { id } })
            if (!product) {
                return {
                    success: false,
                    status: 404,
                    message: 'Product not found!',
                }
            }
            const images = await this.imageRepository.find({
                where: {
                    ownerId: product.id,
                    belongTo: Owner.Product,
                },
            })
            return {
                success: true,
                status: 200,
                message: 'Get product detail successfully!',
                resource: { product, images },
            }
        } catch (e) {
            return {
                success: false,
                status: 500,
                message: 'Error occur!',
            }
        }
    }

    async addProductImages(files: Express.Multer.File[]) {
        try {
            let savedImages: Image[] = []
            for (const file of files) {
                const uploadResult = await uploadImage(file, `products`)
                if (isSuccessResponse(uploadResult)) {
                    const imageUrl: string = uploadResult.resource as string
                    const image = this.imageRepository.create({
                        url: imageUrl,
                        belongTo: Owner.Product,
                        primary: false,
                    })
                    const savedImage = await this.imageRepository.save(image)
                    savedImages.push(savedImage)
                }
            }
            return {
                success: true,
                status: 201,
                message: 'Upload products image successfully!',
                resource: {
                    images: savedImages,
                },
            }
        } catch (e) {
            return {
                success: false,
                status: 500,
                message: 'Error occur!',
            }
        }
    }

    async addProduct(data: ProductInput) {
        try {
            const product = this.productRepository.create(data)
            product.categories = await this.categoryRepository.findBy({
                id: In(data.categoryId),
            })
            const savedProduct = await this.productRepository.save(product)
            const productImages = await this.imageRepository.findBy({
                id: In(data.imageId),
            })
            productImages.forEach((image) => {
                image.ownerId = savedProduct.id
            })
            const savedImages = await this.imageRepository.save(productImages)
            return {
                success: true,
                status: 201,
                message: 'Create product successfully!',
                resource: {
                    product: savedProduct,
                    images: savedImages,
                },
            }
        } catch (e) {
            return {
                success: false,
                status: 500,
                message: 'Error occur!',
            }
        }
    }

    async editProduct(id: number, data: ProductEdit) {
        try {
            const existProduct = await this.productRepository.findOne({ where: { id } })
            if (!existProduct) {
                return {
                    success: false,
                    status: 404,
                    message: 'Product not found!',
                }
            }
            if (data.thumbnailId) {
                const images = await this.imageRepository.find({
                    where: {
                        ownerId: existProduct.id,
                        belongTo: Owner.Product,
                    },
                })
                images.forEach((image: Image) => {
                    image.primary = image.id === data.thumbnailId
                })
                await this.imageRepository.save(images)
            }
            if (data.categoryId) {
                existProduct.categories = await this.categoryRepository.findBy({
                    id: In(data.categoryId),
                })
            }
            let dataUpdated = {
                ...existProduct,
                name: data.name,
                description: data.description,
                price: data.price,
                quantity: data.quantity,
            }
            await this.productRepository.save(dataUpdated)
            return {
                success: true,
                status: 200,
                message: 'Update product successfully!',
            }
        } catch (e) {
            return {
                success: false,
                status: 500,
                message: 'Error occur!',
            }
        }
    }

    async deleteProduct(id: number) {
        try {
            let existProduct = await this.productRepository.findOne({ where: { id } })
            if (!existProduct) {
                return {
                    success: false,
                    status: 404,
                    message: 'Product not found!',
                }
            }
            const existInCart = await this.cartProductRepository.findOne({
                where: { productId: existProduct.id },
            })
            const existInOrder = await this.orderProductRepository.findOne({
                where: { productId: existProduct.id },
            })
            if (existInCart || existInOrder) {
                return {
                    success: false,
                    status: 400,
                    message: 'Product not in cart or being buy. Cant delete',
                }
            }
            const existImages = await this.imageRepository.find({
                where: {
                    belongTo: Owner.Product,
                    ownerId: existProduct.id,
                },
            })
            if (existImages.length !== 0) {
                await Promise.all(existImages.map((image) => deleteImage(image.url)))
                await this.imageRepository.remove(existImages)
            }
            await this.productRepository.remove(existProduct)
            return {
                success: true,
                status: 200,
                message: 'Delete product successfully!',
            }
        } catch (e) {
            return {
                success: false,
                status: 500,
                message: 'Error occur!',
            }
        }
    }

    //Order service for admin
    async getAllOrders() {
        try {
            const listOrders = await this.orderRepository.find()
            if (listOrders.length === 0) {
                return {
                    success: true,
                    status: 200,
                    message: 'Orders list is empty!',
                }
            }
            return {
                success: true,
                status: 200,
                message: 'Get orders list successfully!',
                resources: listOrders,
            }
        } catch (e) {
            return {
                success: false,
                status: 500,
                message: 'Error occur!',
            }
        }
    }

    async getOrderDetail(id: number) {
        try {
            const order = await this.orderRepository.findOne({ where: { id } })
            if (!order) {
                return {
                    success: false,
                    status: 404,
                    message: 'Order not found!',
                }
            }
            return {
                success: true,
                status: 200,
                message: 'Get Order detail successfully!',
                resource: order,
            }
        } catch (e) {
            return {
                success: false,
                status: 500,
                message: 'Error occur!',
            }
        }
    }

    async changeOrderStatus(id: number, status: OrderStatus) {
        try {
            let order = await this.orderRepository.findOne({ where: { id } })
            if (!order) {
                return {
                    success: false,
                    status: 404,
                    message: 'Order not found!',
                }
            }
            order.status = status
            if (status === OrderStatus.Completed) {
                order.completedDate = new Date()
            }
            switch (order.paymentMethod) {
                case PaymentMethod.Cash:
                    order.paymentDate = order.completedDate
                    break
                case PaymentMethod.Visa:
                    order.paymentDate = order.orderDate
            }
            order = await this.orderRepository.save(order)
            return {
                success: true,
                status: 200,
                message: 'Change order status successfully!',
                resource: order,
            }
        } catch (e) {
            return {
                success: false,
                status: 500,
                message: 'Error occur!',
            }
        }
    }
}
