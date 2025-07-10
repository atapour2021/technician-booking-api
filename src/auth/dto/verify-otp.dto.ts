import { IsString, Length, IsPhoneNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
  @ApiProperty()
  @IsString()
  @IsPhoneNumber('IR')
  phone: string;

  @ApiProperty()
  @IsString()
  @Length(4, 6)
  otp: string;
}
