import {Repository} from "typeorm";
import {Cart} from "../../models/entities/Cart.entity";
import {CartProduct} from "../../models/entities/CartProduct.entity";
import {Product} from "../../models/entities/Product.entity";
import {User} from "../../models/entities/User.entity";
import {Order} from "../../models/entities/Order.entity";
import {OrderProduct} from "../../models/entities/OrderProduct.entity";
import {Category} from "../../models/entities/Category.entity";
import {
    ErrorResponse,
    isSuccessResponse, ProductImages,
    SuccessResponse
} from "../../utils/common/interfaces";
import {Owner, UserStatus} from "../../utils/common/enum";
import {CategoryInput} from "../../models/dto/category-input";
import {deleteImage, uploadImage} from "../../utils/common/images";
import {Image} from "../../models/entities/Image.entity";
import {CategoryEdit} from "../../models/dto/category-edit";
import {ProductInput} from "../../models/dto/product-input";

export class AdminService {
    constructor(private cartRepository: Repository<Cart>,
                private cartProductRepository: Repository<CartProduct>,
                private categoryRepository: Repository<Category>,
                private productRepository: Repository<Product>,
                private userRepository: Repository<User>,
                private orderRepository: Repository<Order>,
                private orderProductRepository: Repository<OrderProduct>,
                private imageRepository: Repository<Image>) {

    }

    //User service for admin

    async getAllUsers(): Promise<SuccessResponse | ErrorResponse> {
        const listUser = await this.userRepository.find()
        if (listUser.length === 0) {
            return {
                'success': true,
                'status': 200,
                'message': 'Users list is empty!'
            }
        }
        return {
            'success': true,
            'status': 200,
            'message': 'Get users list successfully!',
            resources: listUser
        }
    }

    async getUserDetail(id: number): Promise<SuccessResponse | ErrorResponse> {
        const user = await this.userRepository.findOne({where: {id}})
        if (!user) {
            return {
                'success': false,
                'status': 404,
                'message': 'User not found!'
            }
        }
        return {
            'success': true,
            'status': 200,
            'message': 'Get user detail successfully!',
            resource: user
        }
    }

    async deleteUser(id: number) {
        const user = await this.userRepository.findOne({where: {id}})
        if (!user) {
            return {
                'success': false,
                'status': 404,
                'message': 'User not found!'
            }
        }
        if (user.status === UserStatus.Active)
            return {
                'success': true,
                'status': 200,
                'message': 'User is active, cant delete!'
            }
        await this.userRepository.remove(user)
        return {
            'success': true,
            'status': 200,
            'message': 'Delete user successfully!'
        }
    }

    async blockUser(id: number) {
        let user = await this.userRepository.findOne({where: {id}})
        if (!user) {
            return {
                'success': false,
                'status': 404,
                'message': 'User not found!'
            }
        }
        if (user.status !== UserStatus.Active)
            return {
                'success': true,
                'status': 200,
                'message': 'User status is not active!'
            }
        user.status = UserStatus.Blocked
        user = await this.userRepository.save(user)
        return {
            'success': true,
            'status': 200,
            'message': 'Block user successfully!',
            resource: user
        }
    }

    async unblockUser(id: number) {
        let user = await this.userRepository.findOne({where: {id}})
        if (!user) {
            return {
                'success': false,
                'status': 404,
                'message': 'User not found!'
            }
        }
        if (user.status !== UserStatus.Blocked)
            return {
                'success': true,
                'status': 200,
                'message': 'User status is not blocked!'
            }
        user.status = UserStatus.Inactive
        user = await this.userRepository.save(user)
        return {
            'success': true,
            'status': 200,
            'message': 'Unblock user successfully!',
            resource: user
        }
    }

    //Category service for admin
    async getAllCategories(): Promise<SuccessResponse | ErrorResponse> {
        const listCategories = await this.categoryRepository.find()
        if (listCategories.length === 0) {
            return {
                'success': true,
                'status': 200,
                'message': 'Categories list is empty!'
            }
        }
        return {
            'success': true,
            'status': 200,
            'message': 'Get categories list successfully!',
            resources: listCategories
        }
    }

    async getCategoryDetail(id: number): Promise<SuccessResponse | ErrorResponse> {
        const category = await this.categoryRepository.findOne({where: {id}})
        if (!category) {
            return {
                'success': false,
                'status': 404,
                'message': 'Category not found!'
            }
        }
        const image = await this.imageRepository.findOne({
            where: {
                ownerId: category.id,
                belongTo: Owner.Category
            }
        })
        return {
            'success': true,
            'status': 200,
            'message': 'Get category detail successfully!',
            resource: {category, image}
        }
    }

    async addCategory(data: CategoryInput, file: Express.Multer.File): Promise<SuccessResponse | ErrorResponse> {
        const category = this.categoryRepository.create(data)
        const savedCategory = await this.categoryRepository.save(category)
        const uploadResult = await uploadImage(file, 'categories')
        let savedImage
        if (isSuccessResponse(uploadResult)) {
            const imageUrl: string = uploadResult.resource as string
            const image = this.imageRepository.create({
                url: imageUrl,
                belongTo: Owner.Category,
                ownerId: savedCategory.id
            })
            savedImage = await this.imageRepository.save(image)
        }
        return {
            'success': true,
            'status': 201,
            'message': 'Create category successfully!',
            resource: {
                category: savedCategory,
                image: savedImage
            }
        }
    }

    async editCategory(id: number, data: CategoryEdit, file?: Express.Multer.File): Promise<SuccessResponse | ErrorResponse> {
        let existCategory = await this.categoryRepository.findOne({where: {id}})
        if (!existCategory) {
            return {
                'success': false,
                'status': 404,
                'message': 'Category not found!'
            }
        }

        if (file) {
            const uploadResult = await uploadImage(file, 'categories')
            if (isSuccessResponse(uploadResult)) {
                const imageUrl: string = uploadResult.resource as string
                const existImage = await this.imageRepository.findOne({
                    where: {
                        belongTo: Owner.Category,
                        ownerId: existCategory.id
                    }
                })
                if (existImage) {
                    await deleteImage(existImage.url)
                    existImage.url = imageUrl
                    await this.imageRepository.save(existImage)
                } else {
                    const image = this.imageRepository.create({
                        url: imageUrl,
                        belongTo: Owner.Category,
                        ownerId: existCategory.id
                    })
                    await this.imageRepository.save(image)
                }
            }
        }
        await this.categoryRepository.update({id}, {
            name: data.name,
            description: data.description
        })
        return {
            'success': true,
            'status': 200,
            'message': 'Update category successfully!',
        }

    }

    async deleteCategory(id: number) {
        let existCategory = await this.categoryRepository.findOne({where: {id}})
        if (!existCategory) {
            return {
                'success': false,
                'status': 404,
                'message': 'Category not found!'
            }
        }
        if (existCategory.numberOfProducts !== 0) {
            return {
                'success': false,
                'status': 400,
                'message': 'Cant delete category which have products!'
            }
        }
        const existImage = await this.imageRepository.findOne({
            where: {
                belongTo: Owner.Category,
                ownerId: existCategory.id
            }
        })
        if (existImage) {
            await deleteImage(existImage.url)
            await this.imageRepository.remove(existImage)
        }
        await this.categoryRepository.remove(existCategory)
        return {
            'success': true,
            'status': 200,
            'message': 'Delete category successfully!'
        }

    }

    async getAllProducts() {
        const listProducts = await this.productRepository.find()
        if (listProducts.length === 0) {
            return {
                'success': true,
                'status': 200,
                'message': 'Products list is empty!'
            }
        }
        return {
            'success': true,
            'status': 200,
            'message': 'Get products list successfully!',
            resources: listProducts
        }
    }

    async addProduct(data: ProductInput, files: Express.Multer.File[]) {
        const product = this.productRepository.create(data)
        const savedProduct = await this.productRepository.save(product)
        let savedImages: ProductImages[] = []
        for (const file of files) {
            const uploadResult = await uploadImage(file, `products/${savedProduct.id}`)
            if (isSuccessResponse(uploadResult)) {
                const imageUrl: string = uploadResult.resource as string
                const image = this.imageRepository.create({
                    url: imageUrl,
                    belongTo: Owner.Product,
                    ownerId: savedProduct.id,
                    primary: false
                })
                const savedImage = await this.imageRepository.save(image)
                savedImages.push({
                    primary: savedImage.primary,
                    url: savedImage.url
                })
            }
        }
        //TODO: add categories to added product
        return {
            'success': true,
            'status': 201,
            'message': 'Create category successfully!',
            resource: {
                category: savedProduct,
                images: savedImages
            }
        }
    }
}
