import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<User> {
    // check new user
    try {
      const exist = await this.users.findOne({ email });
      if (exist) {
        throw new Error('There is a user with that email already');
      }

      return await this.users.save(
        this.users.create({ email, password, role }),
      );
    } catch (e) {
      throw new Error("Couldn't create account");
    }
  }
}
