import { Controller, Get, Post, Body } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  getAllProducts() {
    return this.productsService.findAll();
  }

  @Post()
  addProduct(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }
}
