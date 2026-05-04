import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: Repository<Product>;

  const mockProductRepository = {
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
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repository = module.get<Repository<Product>>(getRepositoryToken(Product));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a new product if it does not exist', async () => {
      const dto = { name: 'Laptop', price: 1000, description: 'Gaming laptop' };
      mockProductRepository.findOneBy.mockResolvedValue(null);
      mockProductRepository.create.mockReturnValue(dto);
      mockProductRepository.save.mockResolvedValue({ id: '1', ...dto });

      const result = await service.create(dto);
      expect(result).toEqual({ id: '1', ...dto });
      expect(mockProductRepository.findOneBy).toHaveBeenCalledWith({ name: 'Laptop' });
    });

    it('should throw ConflictException if product already exists', async () => {
      const dto = { name: 'Laptop', price: 1000, description: 'Gaming laptop' };
      mockProductRepository.findOneBy.mockResolvedValue({ id: '1', ...dto });

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return all products', async () => {
      const products = [{ id: '1', name: 'Laptop', price: 1000, description: 'Gaming laptop' }];
      mockProductRepository.find.mockResolvedValue(products);

      const result = await service.findAll();
      expect(result).toEqual(products);
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      const product = { id: '1', name: 'Laptop', price: 1000, description: 'Gaming laptop' };
      mockProductRepository.findOneBy.mockResolvedValue(product);

      const result = await service.findOne('1');
      expect(result).toEqual(product);
    });

    it('should throw NotFoundException if product does not exist', async () => {
      mockProductRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update and return the product if it exists', async () => {
      const dto = { name: 'Updated Laptop' };
      const product = { id: '1', name: 'Laptop', price: 1000, description: 'Gaming' };
      mockProductRepository.findOneBy
        .mockResolvedValueOnce(product)
        .mockResolvedValueOnce({ id: '1', ...product, ...dto });

      const result = await service.update('1', dto);
      expect(result).toEqual({ id: '1', name: 'Updated Laptop', price: 1000, description: 'Gaming' });
      expect(mockProductRepository.update).toHaveBeenCalledWith('1', dto);
    });

    it('should throw NotFoundException if product does not exist', async () => {
      mockProductRepository.findOneBy.mockResolvedValue(null);

      await expect(service.update('1', { name: 'Updated' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete and return the deleted product', async () => {
      const product = { id: '1', name: 'Laptop', price: 1000, description: 'Gaming' };
      mockProductRepository.findOneBy.mockResolvedValue(product);
      mockProductRepository.remove.mockResolvedValue(product);

      const result = await service.remove('1');
      expect(result).toEqual(product);
      expect(mockProductRepository.remove).toHaveBeenCalledWith(product);
    });

    it('should throw NotFoundException if product does not exist', async () => {
      mockProductRepository.findOneBy.mockResolvedValue(null);

      await expect(service.remove('1')).rejects.toThrow(NotFoundException);
    });
  });
});
