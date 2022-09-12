import { AdminService } from './admin.service';
import { Request, Response } from 'express';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CategoryInput } from '../../models/dto/category-input';
import { CategoryEdit } from '../../models/dto/category-edit';
import { ProductInput } from '../../models/dto/product-input';
import { ProductEdit } from '../../models/dto/product-edit';
import { OrderStatus } from '../../utils/common/enum';
import { isSuccessResponse } from '../../utils/common/interfaces';

export class AdminController {
  constructor(public adminService: AdminService) {}

  // User controller for admin
  async getAllUsers(res: Response): Promise<void> {
    const result = await this.adminService.getAllUsers();
    if (isSuccessResponse(result)) {
      const users = result.resources;
      res.render('admin/user/user_index', { users });
      return;
    }
    res.status(result.status).json(result);
  }

  async getUserDetail(req: Request, res: Response): Promise<void> {
    const id: number = parseInt(req.params.id);
    const result = await this.adminService.getUserDetail(id);
    if (isSuccessResponse(result)) {
      const user = result.resource;
      res.render('admin/user/user_detail', { user });
      return;
    }
    res.status(result.status).json(result);
  }

  async deleteUser(req: Request, res: Response): Promise<void> {
    const id: number = parseInt(req.params.id);
    const result = await this.adminService.deleteUser(id);
    res.status(result.status).json(result);
  }

  async blockUser(req: Request, res: Response): Promise<void> {
    const id: number = parseInt(req.params.id);
    const result = await this.adminService.blockUser(id);
    res.status(result.status).json(result);
  }

  async unblockUser(req: Request, res: Response): Promise<void> {
    const id: number = parseInt(req.params.id);
    const result = await this.adminService.unblockUser(id);
    res.status(result.status).json(result);
  }

  // Category controller for admin

  async getAllCategories(res: Response): Promise<void> {
    const result = await this.adminService.getAllCategories();
    if (isSuccessResponse(result)) {
      const categories = result.resources;
      const images = result.images;
      res.render('admin/category/category_index', { categories, images });
      return;
    }
    res.status(result.status).json(result);
  }

  async getCategoryDetail(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id);
    const result = await this.adminService.getCategoryDetail(id);

    if (isSuccessResponse(result)) {
      const category = result.resource;
      const image = result.image;
      res.render('admin/category/category_detail', { category, image });
      return;
    }
    res.status(result.status).json(result);
  }

  async addCategory(req: Request, res: Response): Promise<void> {
    const data = req.body;
    const errors = await validate(plainToInstance(CategoryInput, data));
    if (errors.length > 0) {
      const messages = JSON.stringify(errors.map((error) => error.constraints));
      res.status(400).send(messages);
      return;
    }
    const file = req.file!;
    const result = await this.adminService.addCategory(data, file);
    res.status(result.status).json(result);
  }

  async editCategory(req: Request, res: Response): Promise<void> {
    const id: number = parseInt(req.params.id);
    const data = req.body;

    const errors = await validate(plainToInstance(CategoryEdit, data));
    if (errors.length > 0) {
      const messages = JSON.stringify(errors.map((error) => error.constraints));
      res.status(400).send(messages);
      return;
    }
    const file = req.file!;
    const result = await this.adminService.editCategory(id, data, file);
    res.status(result.status).json(result);
  }

  async deleteCategory(req: Request, res: Response): Promise<void> {
    const id: number = parseInt(req.params.id);
    const result = await this.adminService.deleteCategory(id);

    res.status(result.status).json(result);
  }

  // Product controller for admin
  async getAllProducts(res: Response): Promise<void> {
    const result = await this.adminService.getAllProducts();
    if (isSuccessResponse(result)) {
      const products = result.resources;
      const images = result.images;
      res.render('admin/product/product_index.ejs', { products, images });
      return;
    }
    res.status(result.status).json(result);
  }

  async getProductDetail(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id);
    const result = await this.adminService.getProductDetail(id);
    if (isSuccessResponse(result)) {
      const product = result.resource;
      const images = result.images;
      res.render('admin/product/product_detail', { product, images });
      return;
    }
    res.status(result.status).json(result);
  }

  async addProduct(req: Request, res: Response): Promise<void> {
    const files = req.files as Express.Multer.File[];
    const data = req.body;
    data.categoryId = data.categoryId.map((id: string) => parseInt(id));
    data.price = parseInt(data.price);
    data.quantity = parseInt(data.quantity);
    const errors = await validate(plainToInstance(ProductInput, data));
    if (errors.length > 0) {
      const messages = JSON.stringify(errors.map((error) => error.constraints));
      res.status(400).send(messages);
      return;
    }
    const result = await this.adminService.addProduct(data, files);
    res.status(result.status).json(result);
  }

  async editProduct(req: Request, res: Response): Promise<void> {
    const id: number = parseInt(req.params.id);
    const data = req.body;
    data.price = parseInt(data.price);
    data.quantity = parseInt(data.quantity);
    data.thumbnailId = parseInt(data.thumbnailId);
    const errors = await validate(plainToInstance(ProductEdit, data));
    if (errors.length > 0) {
      const messages = JSON.stringify(errors.map((error) => error.constraints));
      res.status(400).send(messages);
      return;
    }
    const result = await this.adminService.editProduct(id, data);
    res.status(result.status).json(result);
  }

  async deleteProduct(req: Request, res: Response): Promise<void> {
    const id: number = parseInt(req.params.id);
    const result = await this.adminService.deleteProduct(id);
    res.status(result.status).json(result);
  }

  // Order controller for admin
  async getAllOrders(res: Response): Promise<void> {
    const result = await this.adminService.getAllOrders();
    res.status(result.status).json(result);
  }

  async getOrderDetail(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id);
    const result = await this.adminService.getOrderDetail(id);
    res.status(result.status).json(result);
  }

  async changeOrderStatus(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id);
    const status = req.body.status;
    if (!Object.values(OrderStatus).includes(status as OrderStatus)) {
      res.status(400).send({ message: 'Invalid status type!' });
      return;
    }
    const result = await this.adminService.changeOrderStatus(id, status);
    res.status(result.status).json(result);
  }

  async adminIndex(req: Request, res: Response): Promise<void> {
    if (req.session.isAdmin) {
      res.redirect('/admin/user');
      return;
    }
    res.render('admin/index.ejs');
  }

  async addCategoryIndex(req: Request, res: Response): Promise<void> {
    res.render('admin/category/add_category.ejs');
  }

  async addProductIndex(req: Request, res: Response): Promise<void> {
    res.render('admin/product/add_product.ejs');
  }
}

// "eslint-config-standard-with-typescript": "^22.0.0",
//     "eslint-plugin-import": "^2.26.0",
//     "eslint-plugin-n": "^15.2.5",
//     "eslint-plugin-promise": "^6.0.1",
