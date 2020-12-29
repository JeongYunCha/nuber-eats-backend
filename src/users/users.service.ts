import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
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
  }: CreateAccountInput): Promise<LoginOutput> {
    // check new user
    try {
      const exist = await this.users.findOne({ email });
      if (!exist) {
        return {
          ok: false,
          error: 'There is a user with that email already',
        };
      }
      await this.users.save(this.users.create({ email, password, role }));
      return { ok: true };
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }

  async login({ email, password }: LoginInput): Promise<LoginOutput> {
    try {
      // 이메일로 유저 찾기
      const user = await this.users.findOne({ email });
      if (!user) {
        return {
          ok: false,
          error: 'User not found',
        };
      }
      // 패스워드 체크
      const passwordCorrect = await user.checkPassword(password);
      if (!passwordCorrect) {
        return {
          ok: false,
          error: 'Wrong password',
        };
      }
      // JWT 생성후 유저에게 주기
      return {
        ok: true,
        token: 'user token alalala',
      };
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }
}
