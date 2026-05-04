import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { NotFoundException, ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  const mockUserRepository = {
    findOneBy: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a new user', async () => {
      const dto = { name: 'Hue', email: 'hue@test.com', password: '123' };
      mockUserRepository.findOneBy.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_pw');
      mockUserRepository.save.mockResolvedValue({ id: '1', name: 'Hue', email: 'hue@test.com', password: 'hashed_pw' });

      const result = await service.create(dto);
      expect(result).toEqual({ id: '1', name: 'Hue', email: 'hue@test.com', password: 'hashed_pw' });
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ email: dto.email });
    });

    it('should throw ConflictException if user already exists', async () => {
      const dto = { name: 'Hue', email: 'hue@test.com', password: '123' };
      mockUserRepository.findOneBy.mockResolvedValue({ id: '1', email: dto.email });

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should login and return a token and user data', async () => {
      const dto = { email: 'hue@test.com', password: '123' };
      const user = { id: '1', email: 'hue@test.com', password: 'hashed_password', name: 'Hue' };
      mockUserRepository.findOneBy.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('mock_token');

      const result = await service.login(dto);
      expect(result).toEqual({
        user: { id: '1', email: 'hue@test.com', name: 'Hue' },
        token: 'mock_token',
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);

      await expect(service.login({ email: 'x', password: 'y' })).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      const user = { id: '1', email: 'hue@test.com', password: 'hashed_password' };
      mockUserRepository.findOneBy.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login({ email: 'hue@test.com', password: 'wrong' })).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = [{ id: '1', email: 'hue@test.com' }];
      mockUserRepository.find.mockResolvedValue(users);

      const result = await service.findAll();
      expect(result).toEqual(users);
    });
  });

  describe('findOne', () => {
    it('should return a user if exists', async () => {
      const user = { id: '1', email: 'hue@test.com' };
      mockUserRepository.findOneBy.mockResolvedValue(user);

      const result = await service.findOne('1');
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update user and return new user if exists', async () => {
      const dto = { name: 'Updated' };
      const user = { id: '1', email: 'hue@test.com', name: 'Hue' };
      mockUserRepository.findOneBy
        .mockResolvedValueOnce(user)
        .mockResolvedValueOnce({ id: '1', email: 'hue@test.com', name: 'Updated' });

      const result = await service.update('1', dto);
      expect(result).toEqual({ id: '1', email: 'hue@test.com', name: 'Updated' });
    });

    it('should update user password if provided in dto', async () => {
      const dto = { password: 'new_password' };
      const user = { id: '1', email: 'hue@test.com', password: 'old' };
      (bcrypt.hash as jest.Mock).mockResolvedValue('new_hash');
      mockUserRepository.findOneBy
        .mockResolvedValueOnce(user)
        .mockResolvedValueOnce({ id: '1', email: 'hue@test.com', password: 'new_hash' });

      const result = await service.update('1', dto);
      expect(result).toEqual({ id: '1', email: 'hue@test.com', password: 'new_hash' });
      expect(bcrypt.hash).toHaveBeenCalledWith('new_password', 10);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);

      await expect(service.update('1', { name: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete the user if exists', async () => {
      const user = { id: '1', email: 'hue@test.com' };
      mockUserRepository.findOneBy.mockResolvedValue(user);

      const result = await service.remove('1');
      expect(result).toEqual({ deleted: true });
      expect(mockUserRepository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);

      await expect(service.remove('1')).rejects.toThrow(NotFoundException);
    });
  });
});
