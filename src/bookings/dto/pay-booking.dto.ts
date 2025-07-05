import { ApiProperty } from '@nestjs/swagger';

export class PayBookingDto {
  @ApiProperty({ example: 'fake-receipt-123' })
  paymentReference: string;
}
