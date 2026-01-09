import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductsService {
  private readonly products: any[] = [];

  create(product: any) {
    this.products.push(product);
    return product;
  }

  findAll() {
    return this.products;
  }
}
