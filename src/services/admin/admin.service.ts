import { EntityManager, In, Repository } from 'typeorm';
import { Cart } from '../../models/entities/Cart.entity';
import { CartProduct } from '../../models/entities/CartProduct.entity';
import { Product } from '../../models/entities/Product.entity';
import { User } from '../../models/entities/User.entity';
import { Order } from '../../models/entities/Order.entity';
import { OrderProduct } from '../../models/entities/OrderProduct.entity';
import { Category } from '../../models/entities/Category.entity';
import {
  ErrorResponse,
  isSuccessResponse,
  SuccessResponse,
} from '../../utils/common/interfaces';
import { OrderStatus, Owner, PaymentMethod, UserStatus } from '../../utils/common/enum';
import { CategoryInput } from '../../models/dto/category-input';
import { deleteImage, uploadImage } from '../../utils/common/images';
import { Image } from '../../models/entities/Image.entity';
import { CategoryEdit } from '../../models/dto/category-edit';
import { ProductInput } from '../../models/dto/product-input';
import { ProductEdit } from '../../models/dto/product-edit';
import { throwError } from '../../utils/common/error';

export class AdminService {
  constructor(
    private readonly cartRepository: Repository<Cart>,
    private readonly cartProductRepository: Repository<CartProduct>,
    private readonly categoryRepository: Repository<Category>,
    private readonly productRepository: Repository<Product>,
    private readonly userRepository: Repository<User>,
    private readonly orderRepository: Repository<Order>,
    private readonly orderProductRepository: Repository<OrderProduct>,
    private readonly imageRepository: Repository<Image>,
    private readonly entityManager: EntityManager
  ) {}

  // User service for admin

  async getAllUsers(): Promise<SuccessResponse | ErrorResponse> {
    try {
      const listUser = await this.userRepository.find();
      return {
        success: true,
        status: 200,
        message: 'Get users list successfully!',
        resources: listUser,
      };
    } catch (e) {
      return {
        success: false,
        status: 500,
        message: 'Error occur!',
      };
    }
  }

  async getUserDetail(id: number): Promise<SuccessResponse | ErrorResponse> {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        return {
          success: false,
          status: 404,
          message: 'User not found!',
        };
      }
      return {
        success: true,
        status: 200,
        message: 'Get user detail successfully!',
        resource: user,
      };
    } catch (e) {
      return {
        success: false,
        status: 500,
        message: 'Error occur!',
      };
    }
  }

  async deleteUser(id: number): Promise<SuccessResponse | ErrorResponse> {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        return {
          success: false,
          status: 404,
          message: 'User not found!',
        };
      }
      if (user.status === UserStatus.Active)
        return {
          success: true,
          status: 200,
          message: 'User is active, cant delete!',
        };
      const existPendingOrders = await this.orderRepository.find({
        where: { userId: user.id, status: OrderStatus.Pending },
      });
      if (existPendingOrders.length !== 0) {
        return {
          success: true,
          status: 200,
          message: 'User is active, cant delete!',
        };
      }
      await this.userRepository.remove(user);
      return {
        success: true,
        status: 200,
        message: 'Delete user successfully!',
      };
    } catch (e) {
      return {
        success: false,
        status: 500,
        message: 'Error occur!',
      };
    }
  }

  async blockUser(id: number): Promise<SuccessResponse | ErrorResponse> {
    try {
      let user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        return {
          success: false,
          status: 404,
          message: 'User not found!',
        };
      }
      if (user.status !== UserStatus.Active)
        return {
          success: true,
          status: 200,
          message: 'User status is not active!',
        };
      user.status = UserStatus.Blocked;
      user = await this.userRepository.save(user);
      return {
        success: true,
        status: 200,
        message: 'Block user successfully!',
        resource: user,
      };
    } catch (e) {
      return {
        success: false,
        status: 500,
        message: 'Error occur!',
      };
    }
  }

  async unblockUser(id: number): Promise<SuccessResponse | ErrorResponse> {
    try {
      let user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        return {
          success: false,
          status: 404,
          message: 'User not found!',
        };
      }
      if (user.status !== UserStatus.Blocked)
        return {
          success: true,
          status: 200,
          message: 'User status is not blocked!',
        };
      user.status = UserStatus.Active;
      user = await this.userRepository.save(user);
      return {
        success: true,
        status: 200,
        message: 'Unblock user successfully!',
        resource: user,
      };
    } catch (e) {
      return {
        success: false,
        status: 500,
        message: 'Error occur!',
      };
    }
  }

  // Category service for admin
  async getAllCategories(): Promise<SuccessResponse | ErrorResponse> {
    try {
      const listCategories = await this.categoryRepository.find();
      const images: Image[] = [];
      for (const category of listCategories) {
        const image = await this.imageRepository.findOne({
          where: {
            belongTo: Owner.Category,
            ownerId: category.id,
          },
        });
        if (image) {
          images.push(image);
        }
      }

      return {
        success: true,
        status: 200,
        message: 'Get categories list successfully!',
        resources: listCategories,
        images,
      };
    } catch (e) {
      return {
        success: false,
        status: 500,
        message: 'Error occur!',
      };
    }
  }

  async getCategoryDetail(id: number): Promise<SuccessResponse | ErrorResponse> {
    try {
      const category = await this.categoryRepository.findOne({ where: { id } });
      if (!category) {
        return {
          success: false,
          status: 404,
          message: 'Category not found!',
        };
      }
      const image = await this.imageRepository.findOne({
        where: {
          ownerId: category.id,
          belongTo: Owner.Category,
        },
      });
      return {
        success: true,
        status: 200,
        message: 'Get category detail successfully!',
        resource: category,
        image,
      };
    } catch (e) {
      return {
        success: false,
        status: 500,
        message: 'Error occur!',
      };
    }
  }

  async addCategory(
    data: CategoryInput,
    file: Express.Multer.File
  ): Promise<SuccessResponse | ErrorResponse> {
    try {
      let category = this.categoryRepository.create(data);
      let savedImage: Image;
      await this.entityManager.transaction(async (transactionalEntityManager) => {
        try {
          category = await transactionalEntityManager.save(category);
          const uploadResult = await uploadImage(file, 'categories');
          if (isSuccessResponse(uploadResult)) {
            const imageUrl: string = uploadResult.resource as string;
            const image = transactionalEntityManager.create(Image, {
              url: imageUrl,
              belongTo: Owner.Category,
              ownerId: category.id,
            });
            savedImage = await transactionalEntityManager.save(image);
          } else {
            throwError(`Something went wrong with upload image process !`);
          }
        } catch (e) {
          console.log(e);
          throw new Error('Something went wrong!...');
        }
      });

      return {
        success: true,
        status: 201,
        message: 'Create category successfully!',
        resource: category,
        image: savedImage!,
      };
    } catch (e) {
      return {
        success: false,
        status: 500,
        message: 'Error occur!',
      };
    }
  }

  async editCategory(
    id: number,
    data?: CategoryEdit,
    file?: Express.Multer.File
  ): Promise<SuccessResponse | ErrorResponse> {
    try {
      const existCategory = await this.categoryRepository.findOne({ where: { id } });
      if (!existCategory) {
        return {
          success: false,
          status: 404,
          message: 'Category not found!',
        };
      }
      await this.entityManager.transaction(async (transactionalEntityManager) => {
        try {
          if (file) {
            const uploadResult = await uploadImage(file, 'categories');
            if (isSuccessResponse(uploadResult)) {
              const imageUrl: string = uploadResult.resource as string;
              const existImage = await transactionalEntityManager.findOne(Image, {
                where: {
                  belongTo: Owner.Category,
                  ownerId: existCategory.id,
                },
              });
              if (existImage) {
                await deleteImage(existImage.url);
                existImage.url = imageUrl;
                await transactionalEntityManager.save(existImage);
              } else {
                const image = transactionalEntityManager.create(Image, {
                  url: imageUrl,
                  belongTo: Owner.Category,
                  ownerId: existCategory.id,
                });
                await transactionalEntityManager.save(image);
              }
            }
          }
          if (data) {
            if (Object.keys(data).length > 0) {
              await transactionalEntityManager.update(
                Category,
                { id },
                {
                  name: data.name,
                  description: data.description,
                }
              );
            }
          }
        } catch (e) {
          console.log(e);
          throw new Error('Something went wrong!...');
        }
      });

      return {
        success: true,
        status: 200,
        message: 'Update category successfully!',
      };
    } catch (e) {
      return {
        success: false,
        status: 500,
        message: 'Error occur!',
      };
    }
  }

  async deleteCategory(id: number): Promise<SuccessResponse | ErrorResponse> {
    try {
      const existCategory = await this.categoryRepository.findOne({ where: { id } });
      if (!existCategory) {
        return {
          success: false,
          status: 404,
          message: 'Category not found!',
        };
      }
      if (existCategory.numberOfProducts !== 0) {
        return {
          success: false,
          status: 400,
          message: 'Cant delete category which have products!',
        };
      }

      const existImage = await this.imageRepository.findOne({
        where: {
          belongTo: Owner.Category,
          ownerId: existCategory.id,
        },
      });
      await this.entityManager.transaction(async (transactionalEntityManager) => {
        try {
          if (existImage) {
            await deleteImage(existImage.url);
            await transactionalEntityManager.remove(existImage);
          }
          await transactionalEntityManager.remove(existCategory);
        } catch (e) {
          console.log(e);
          throw new Error('Something went wrong!...');
        }
      });

      return {
        success: true,
        status: 200,
        message: 'Delete category successfully!',
      };
    } catch (e) {
      return {
        success: false,
        status: 500,
        message: 'Error occur!',
      };
    }
  }

  // Product service for admin
  async getAllProducts(): Promise<SuccessResponse | ErrorResponse> {
    try {
      const listProducts = await this.productRepository.find();
      const images: Image[] = [];
      for (const product of listProducts) {
        const image = await this.imageRepository.findOne({
          where: {
            belongTo: Owner.Product,
            primary: true,
            ownerId: product.id,
          },
        });
        if (image) {
          images.push(image);
        }
      }
      return {
        success: true,
        status: 200,
        message: 'Get products list successfully!',
        resources: listProducts,
        images,
      };
    } catch (e) {
      return {
        success: false,
        status: 500,
        message: 'Error occur!',
      };
    }
  }

  async getProductDetail(id: number): Promise<SuccessResponse | ErrorResponse> {
    try {
      const product = await this.productRepository.findOne({ where: { id } });
      if (!product) {
        return {
          success: false,
          status: 404,
          message: 'Product not found!',
        };
      }
      const images = await this.imageRepository.find({
        where: {
          ownerId: product.id,
          belongTo: Owner.Product,
        },
      });
      return {
        success: true,
        status: 200,
        message: 'Get product detail successfully!',
        resource: product,
        images,
      };
    } catch (e) {
      return {
        success: false,
        status: 500,
        message: 'Error occur!',
      };
    }
  }

  async addProduct(
    data: ProductInput,
    files: Express.Multer.File[]
  ): Promise<SuccessResponse | ErrorResponse> {
    try {
      let product = this.productRepository.create(data);
      product.categories = await this.categoryRepository.findBy({
        id: In(data.categoryId),
      });
      for (const category of product.categories) {
        category.numberOfProducts++;
      }
      const savedImages: Image[] = [];
      await this.entityManager.transaction(async (transactionalEntityManager) => {
        try {
          product = await transactionalEntityManager.save(product);
          for (const file of files) {
            const uploadResult = await uploadImage(file, `products`);
            if (isSuccessResponse(uploadResult)) {
              const imageUrl: string = uploadResult.resource as string;
              const image = transactionalEntityManager.create(Image, {
                url: imageUrl,
                belongTo: Owner.Product,
                primary: false,
                ownerId: product.id,
              });
              const savedImage = await transactionalEntityManager.save(image);
              savedImages.push(savedImage);
            }
          }
        } catch (e) {
          console.log(e);
          throw new Error('Something went wrong!...');
        }
      });

      return {
        success: true,
        status: 201,
        message: 'Create product successfully!',
        resource: {
          product,
          images: savedImages,
        },
      };
    } catch (e) {
      return {
        success: false,
        status: 500,
        message: 'Error occur!',
      };
    }
  }

  async editProduct(
    id: number,
    data: ProductEdit
  ): Promise<SuccessResponse | ErrorResponse> {
    try {
      const existProduct = await this.productRepository.findOne({ where: { id } });
      if (!existProduct) {
        return {
          success: false,
          status: 404,
          message: 'Product not found!',
        };
      }
      await this.entityManager.transaction(async (transactionalEntityManager) => {
        try {
          if (data.thumbnailId) {
            const images = await transactionalEntityManager.find(Image, {
              where: {
                ownerId: existProduct.id,
                belongTo: Owner.Product,
              },
            });
            images.forEach((image: Image) => {
              image.primary = image.id === data.thumbnailId;
            });
            await transactionalEntityManager.save(images);
          }
          if (data.categoryId) {
            existProduct.categories = await transactionalEntityManager.findBy(Category, {
              id: In(data.categoryId),
            });
          }
          const dataUpdated = {
            ...existProduct,
            name: data.name,
            description: data.description,
            price: data.price,
            quantity: data.quantity,
          };
          await transactionalEntityManager.save(dataUpdated);
        } catch (e) {
          console.log(e);
          throw new Error('Something went wrong!...');
        }
      });

      return {
        success: true,
        status: 200,
        message: 'Update product successfully!',
      };
    } catch (e) {
      return {
        success: false,
        status: 500,
        message: 'Error occur!',
      };
    }
  }

  async deleteProduct(id: number): Promise<SuccessResponse | ErrorResponse> {
    try {
      const existProduct = await this.productRepository.findOne({ where: { id } });
      if (!existProduct) {
        return {
          success: false,
          status: 404,
          message: 'Product not found!',
        };
      }
      const existInCart = await this.cartProductRepository.findOne({
        where: { productId: existProduct.id },
      });
      const existInOrder = await this.orderProductRepository.findOne({
        where: { productId: existProduct.id },
      });
      if (existInCart || existInOrder) {
        return {
          success: false,
          status: 400,
          message: 'Product not in cart or being buy. Cant delete',
        };
      }
      const existImages = await this.imageRepository.find({
        where: {
          belongTo: Owner.Product,
          ownerId: existProduct.id,
        },
      });
      await this.entityManager.transaction(async (transactionalEntityManager) => {
        try {
          if (existImages.length !== 0) {
            await Promise.all(existImages.map((image) => deleteImage(image.url)));
            await transactionalEntityManager.remove(existImages);
          }

          for (const category of existProduct.categories) {
            category.numberOfProducts--;
          }
          await transactionalEntityManager.save(existProduct);
          await transactionalEntityManager.remove(existProduct);
        } catch (e) {
          console.log(e);
          throw new Error('Something went wrong!...');
        }
      });

      return {
        success: true,
        status: 200,
        message: 'Delete product successfully!',
      };
    } catch (e) {
      return {
        success: false,
        status: 500,
        message: 'Error occur!',
      };
    }
  }

  // Order service for admin
  async getAllOrders(): Promise<SuccessResponse | ErrorResponse> {
    try {
      const listOrders = await this.orderRepository.find();
      if (listOrders.length === 0) {
        return {
          success: true,
          status: 200,
          message: 'Orders list is empty!',
        };
      }
      return {
        success: true,
        status: 200,
        message: 'Get orders list successfully!',
        resources: listOrders,
      };
    } catch (e) {
      return {
        success: false,
        status: 500,
        message: 'Error occur!',
      };
    }
  }

  async getOrderDetail(id: number): Promise<SuccessResponse | ErrorResponse> {
    try {
      const order = await this.orderRepository.findOne({ where: { id } });
      if (!order) {
        return {
          success: false,
          status: 404,
          message: 'Order not found!',
        };
      }
      return {
        success: true,
        status: 200,
        message: 'Get Order detail successfully!',
        resource: order,
      };
    } catch (e) {
      return {
        success: false,
        status: 500,
        message: 'Error occur!',
      };
    }
  }

  async changeOrderStatus(
    id: number,
    status: OrderStatus
  ): Promise<SuccessResponse | ErrorResponse> {
    try {
      let order = await this.orderRepository.findOne({ where: { id } });
      if (!order) {
        return {
          success: false,
          status: 404,
          message: 'Order not found!',
        };
      }
      order.status = status;
      if (status === OrderStatus.Completed) {
        order.completedDate = new Date();
      }
      switch (order.paymentMethod) {
        case PaymentMethod.Cash:
          order.paymentDate = order.completedDate;
          break;
        case PaymentMethod.Visa:
          order.paymentDate = order.orderDate;
      }
      order = await this.orderRepository.save(order);
      return {
        success: true,
        status: 200,
        message: 'Change order status successfully!',
        resource: order,
      };
    } catch (e) {
      return {
        success: false,
        status: 500,
        message: 'Error occur!',
      };
    }
  }
}
