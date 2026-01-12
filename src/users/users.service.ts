import { Injectable, UnauthorizedException } from '@nestjs/common';
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
    // check if user already exists
    const user = await this.userRepository.findOneBy({
      email: createUserDto.email,
    });
    if (user) {
      throw new Error('User already exists');
    }
    const hashPassword = await bcrypt.hash(password, 10);
    return this.userRepository.save({ ...rest, password: hashPassword });
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    // this user data remove password
    const { password: _, ...rest } = user;
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const token = jwt.sign({ id: user.id }, 'Huevangxp', {
      expiresIn: '1h',
    });
    return { user: rest, token };
  }

  async findAll() {
    try {
      return await this.userRepository.find();
    } catch (error) {
      return error;
    }
  }

  async findOne(id: string) {
    try {
      return await this.userRepository.findOneBy({ id });
    } catch (error) {
      return error;
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.userRepository.findOneBy({ id });
      if (!user) {
        throw new Error('User not found');
      }
      const { password, ...rest } = updateUserDto;
      if (password) {
        const hashPassword = await bcrypt.hash(password, 10);
        return await this.userRepository.update(id, {
          ...rest,
          password: hashPassword,
        });
      }
      return await this.userRepository.update(id, rest);
    } catch (error) {
      return error;
    }
  }

  async remove(id: string) {
    try {
      const user = await this.userRepository.findOneBy({ id });
      if (!user) {
        throw new Error('User not found');
      }
      return await this.userRepository.delete(id);
    } catch (error) {
      return error;
    }
  }
}
