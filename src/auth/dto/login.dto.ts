import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @ApiProperty({ default: 'test12@gmail.com' })
  email: string;

  @IsNotEmpty()
  @ApiProperty({ default: '123456' })
  password: string;
}
