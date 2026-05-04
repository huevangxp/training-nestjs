import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('CategoryService', () => {
  let service: CategoryService;
  let repository: Repository<Category>;

  const mockCategoryRepository = {
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: getRepositoryToken(Category),
          useValue: mockCategoryRepository,
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    repository = module.get<Repository<Category>>(getRepositoryToken(Category));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a new category if it does not exist', async () => {
      const dto = { name: 'Electronics' };
      mockCategoryRepository.findOneBy.mockResolvedValue(null);
      mockCategoryRepository.create.mockReturnValue(dto);
      mockCategoryRepository.save.mockResolvedValue({ id: '1', ...dto });

      const result = await service.create(dto);
      expect(result).toEqual({ id: '1', name: 'Electronics' });
      expect(mockCategoryRepository.findOneBy).toHaveBeenCalledWith({ name: 'Electronics' });
    });

    it('should throw ConflictException if category already exists', async () => {
      const dto = { name: 'Electronics' };
      mockCategoryRepository.findOneBy.mockResolvedValue({ id: '1', ...dto });

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return all categories', async () => {
      const categories = [{ id: '1', name: 'Electronics' }];
      mockCategoryRepository.find.mockResolvedValue(categories);

      const result = await service.findAll();
      expect(result).toEqual(categories);
    });
  });

  describe('findOne', () => {
    it('should return a category by id', async () => {
      const category = { id: '1', name: 'Electronics' };
      mockCategoryRepository.findOneBy.mockResolvedValue(category);

      const result = await service.findOne('1');
      expect(result).toEqual(category);
    });

    it('should throw NotFoundException if category does not exist', async () => {
      mockCategoryRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update and return the category if it exists', async () => {
      const dto = { name: 'Updated Electronics' };
      const category = { id: '1', name: 'Electronics' };
      mockCategoryRepository.findOneBy
        .mockResolvedValueOnce(category)
        .mockResolvedValueOnce({ id: '1', ...dto });

      const result = await service.update('1', dto);
      expect(result).toEqual({ id: '1', name: 'Updated Electronics' });
      expect(mockCategoryRepository.update).toHaveBeenCalledWith('1', dto);
    });

    it('should throw NotFoundException if category does not exist', async () => {
      mockCategoryRepository.findOneBy.mockResolvedValue(null);

      await expect(service.update('1', { name: 'Updated' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete and return the deleted category', async () => {
      const category = { id: '1', name: 'Electronics' };
      mockCategoryRepository.findOneBy.mockResolvedValue(category);
      mockCategoryRepository.remove.mockResolvedValue(category);

      const result = await service.remove('1');
      expect(result).toEqual(category);
      expect(mockCategoryRepository.remove).toHaveBeenCalledWith(category);
    });

    it('should throw NotFoundException if category does not exist', async () => {
      mockCategoryRepository.findOneBy.mockResolvedValue(null);

      await expect(service.remove('1')).rejects.toThrow(NotFoundException);
    });
  });
});
