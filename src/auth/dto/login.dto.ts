import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @ApiProperty({ default: 'admin@gmail.com' })
  email: string;

  @IsNotEmpty()
  @ApiProperty({ default: '123456' })
  password: string;
}
