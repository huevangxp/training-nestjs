import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}
  async create(createCategoryDto: CreateCategoryDto) {
    const { name } = createCategoryDto;
    const categoryAlreadyExists = await this.categoryRepository.findOneBy({
      name,
    });
    if (categoryAlreadyExists) {
      throw new Error('Category already exists');
    }
    const category = this.categoryRepository.create({ name });
    return await this.categoryRepository.save(category);
  }

  async findAll() {
    try {
      const data = await this.categoryRepository.find();
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
      const data = await this.categoryRepository.findOneBy({ id });
      if (!data) {
        throw new Error('No data found');
      }
      return data;
    } catch (error) {
      return error;
    }
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    try {
      const data = await this.categoryRepository.findOneBy({ id });
      if (!data) {
        throw new Error('No data found');
      }
      return await this.categoryRepository.update(id, updateCategoryDto);
    } catch (error) {
      return error;
    }
  }

  async remove(id: string) {
    try {
      const data = await this.categoryRepository.findOneBy({ id });
      if (!data) {
        throw new Error('No data found');
      }
      return await this.categoryRepository.remove(data);
    } catch (error) {
      return error;
    }
  }
}
