import { IsPhoneNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendOtpDto {
  @ApiProperty({ default: '09053162772' })
  @IsPhoneNumber('IR')
  phone: string;
}
