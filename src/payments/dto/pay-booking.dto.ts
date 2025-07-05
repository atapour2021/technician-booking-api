import { ApiProperty } from '@nestjs/swagger';

export class PayBookingDto {
  @ApiProperty({ example: 10000 })
  amount: number;

  @ApiProperty({ example: 'پرداخت سرویس نصب کولر' })
  description: string;
}
