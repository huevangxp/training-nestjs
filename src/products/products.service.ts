import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const { name, price, description } = createProductDto;
    const productAlreadyExists = await this.productRepository.findOneBy({ name });
    if (productAlreadyExists) {
      throw new ConflictException('Product already exists');
    }
    const product = this.productRepository.create({ name, price, description });
    return await this.productRepository.save(product);
  }

  async findAll() {
    return await this.productRepository.find();
  }

  async findOne(id: string) {
    const data = await this.productRepository.findOneBy({ id });
    if (!data) {
      throw new NotFoundException('No data found');
    }
    return data;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const data = await this.productRepository.findOneBy({ id });
    if (!data) {
      throw new NotFoundException('No data found');
    }
    await this.productRepository.update(id, updateProductDto);
    return await this.findOne(id);
  }

  async remove(id: string) {
    const data = await this.productRepository.findOneBy({ id });
    if (!data) {
      throw new NotFoundException('No data found');
    }
    return await this.productRepository.remove(data);
  }
}
