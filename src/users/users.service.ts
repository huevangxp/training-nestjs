import { Injectable, UnauthorizedException, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginDto } from './dto/login.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { password, ...rest } = createUserDto;
    const user = await this.userRepository.findOneBy({ email: createUserDto.email });
    if (user) {
      throw new ConflictException('User already exists');
    }
    const hashPassword = await bcrypt.hash(password, 10);
    return await this.userRepository.save({ ...rest, password: hashPassword });
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const { password: _, ...rest } = user;
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const token = jwt.sign({ id: user.id }, 'Huevangxp', { expiresIn: '1h' });
    return { user: rest, token };
  }

  async findAll() {
    return await this.userRepository.find();
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { password, ...rest } = updateUserDto;
    if (password) {
      const hashPassword = await bcrypt.hash(password, 10);
      await this.userRepository.update(id, { ...rest, password: hashPassword });
    } else {
      await this.userRepository.update(id, rest);
    }
    return await this.findOne(id);
  }

  async remove(id: string) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.userRepository.delete(id);
    return { deleted: true };
  }
}
