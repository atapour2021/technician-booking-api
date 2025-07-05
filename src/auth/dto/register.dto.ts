import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, MinLength } from 'class-validator';
import { UserRole } from 'src/users/user.entity';

export class RegisterDto {
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsNotEmpty()
  @ApiProperty()
  fullName: string;

  @MinLength(6)
  @ApiProperty()
  password: string;

  @ApiProperty()
  @IsEnum(UserRole)
  role: UserRole;
}
