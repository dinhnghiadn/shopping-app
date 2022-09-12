import { Request, Response, Router } from 'express';
import { CategoryController } from './category.controller';
import * as express from 'express';

export class CategoryRoutes {
  constructor(private router: Router, public categoryController: CategoryController) {}

  getRoutes(): Router {
    this.router.get('/category/list', (req: Request, res: Response) =>
      this.categoryController.getAll(req, res)
    );
    this.router.get('/category/detail/:id', (req: Request, res: Response) =>
      this.categoryController.getOne(req, res)
    );
    return this.router;
  }
}
