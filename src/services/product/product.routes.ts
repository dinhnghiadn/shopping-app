import { Request, Response, Router } from 'express';
import { ProductController } from './product.controller';

export class ProductRoutes {
  constructor(
    private readonly router: Router,
    public productController: ProductController
  ) {}

  getRoutes(): Router {
    this.router.get('/product/list', (req: Request, res: Response) =>
      this.productController.getAll(req, res)
    );
    this.router.get('/product/detail/:id', (req: Request, res: Response) =>
      this.productController.getDetail(req, res)
    );
    return this.router;
  }
}
