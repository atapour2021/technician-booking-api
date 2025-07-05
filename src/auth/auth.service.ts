import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User } from 'src/users/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;

      return result;
    }
    return null;
  }

  async register(dto: RegisterDto) {
    const hashed = await bcrypt.hash(dto.password, 10);

    const userData = new User();

    userData.email = dto.email;
    userData.fullName = dto.fullName;
    userData.role = dto.role;
    userData.password = hashed;

    const user = await this.usersService.create(userData);

    return this.getTokens(user.id, user.role);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.getTokens(user.id, user.role);
  }

  getTokens(userId: number, role: string) {
    const payload = { sub: userId, role };
    const access_token = this.jwtService.sign(payload);

    return { access_token };
  }
}
