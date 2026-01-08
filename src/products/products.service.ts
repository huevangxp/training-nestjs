import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  private readonly products: CreateProductDto[] = [];

  create(createProductDto: CreateProductDto) {
    this.products.push(createProductDto);
    return createProductDto;
  }

  findAll() {
    return this.products;
  }
}
