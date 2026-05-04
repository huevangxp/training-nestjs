import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
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
    const categoryAlreadyExists = await this.categoryRepository.findOneBy({ name });
    if (categoryAlreadyExists) {
      throw new ConflictException('Category already exists');
    }
    const category = this.categoryRepository.create({ name });
    return await this.categoryRepository.save(category);
  }

  async findAll() {
    return await this.categoryRepository.find();
  }

  async findOne(id: string) {
    const data = await this.categoryRepository.findOneBy({ id });
    if (!data) {
      throw new NotFoundException('No data found');
    }
    return data;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const data = await this.categoryRepository.findOneBy({ id });
    if (!data) {
      throw new NotFoundException('No data found');
    }
    await this.categoryRepository.update(id, updateCategoryDto);
    return await this.findOne(id);
  }

  async remove(id: string) {
    const data = await this.categoryRepository.findOneBy({ id });
    if (!data) {
      throw new NotFoundException('No data found');
    }
    return await this.categoryRepository.remove(data);
  }
}

