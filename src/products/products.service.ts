import { Injectable } from '@nestjs/common';
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
    const productAlreadyExists = await this.productRepository.findOneBy({
      name,
    });
    if (productAlreadyExists) {
      throw new Error('Product already exists');
    }
    const product = this.productRepository.create({
      name,
      price,
      description,
    });
    return await this.productRepository.save(product);
  }

  async findAll() {
    try {
      const data = await this.productRepository.find();
      if (!data) {
        throw new Error('No data found');
      }
      return data || [];
    } catch (error) {
      return error;
    }
  }

  async findOne(id: string) {
    try {
      const data = await this.productRepository.findOneBy({ id });
      if (!data) {
        throw new Error('No data found');
      }
      return data;
    } catch (error) {
      return error;
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    try {
      const data = await this.productRepository.findOneBy({ id });
      if (!data) {
        throw new Error('No data found');
      }
      return await this.productRepository.update(id, updateProductDto);
    } catch (error) {
      return error;
    }
  }

  async remove(id: string) {
    try {
      const data = await this.productRepository.findOneBy({ id });
      if (!data) {
        throw new Error('No data found');
      }
      return await this.productRepository.remove(data);
    } catch (error) {
      return error;
    }
  }
}
