import {
  Controller,
  Post,
  Body,
  Query,
  Param,
  Res,
  UseGuards,
  Get,
  Req,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PayBookingDto } from './dto/pay-booking.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { BookingsService } from '../bookings/bookings.service';
import { PaymentStatus } from '../bookings/booking.entity';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly bookingsService: BookingsService,
  ) {}

  @Post(':bookingId/initiate')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  @ApiOperation({ summary: 'Initiate Zarinpal payment for a booking' })
  async initiate(
    @Param('bookingId') bookingId: string,
    @Req() req,
    @Res() res,
  ) {
    const booking = await this.bookingsService.findById(+bookingId);
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.customer.id !== req.user.userId) {
      throw new ForbiddenException('Not your booking');
    }
    if (booking.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('Already paid');
    }

    const callbackUrl = `http://localhost:3000/payments/${bookingId}/verify?userId=${req.user.userId}`;
    const result = await this.paymentsService.requestPayment(
      booking.service.basePrice,
      `پرداخت برای سرویس ${booking.service.name}`,
      callbackUrl,
    );

    // optionally: save authority in DB (future feature)
    return res.json({ payUrl: result.url });
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Get(':bookingId/verify')
  @ApiOperation({ summary: 'Verify Zarinpal payment callback' })
  async verify(
    @Param('bookingId') bookingId: string,
    @Query('Authority') authority: string,
    @Query('Status') status: string,
    @Query('userId') userId: string,
    @Res() res,
  ) {
    if (status !== 'OK') {
      return res.status(400).send('پرداخت لغو شد');
    }

    const booking = await this.bookingsService.findById(+bookingId);
    if (!booking) throw new NotFoundException('Booking not found');
    const amount = booking.service.basePrice;

    const result = await this.paymentsService.verifyPayment(authority, amount);

    if (result.code === 100) {
      await this.bookingsService.markAsPaid(+bookingId);
      return res.redirect('http://localhost:4200/payment-success');
    } else {
      return res.status(400).send('پرداخت ناموفق بود');
    }
  }
}
