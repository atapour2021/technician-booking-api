import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { FilterQuery } from 'src/common';
import { UserRole } from 'src/users/user.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { BookingsService } from './bookings.service';
import { AssignTechnicianDto } from './dto/assign-technician.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { FilterBookingsDto } from './dto/filter-bookings.dto';
import { PayBookingDto } from './dto/pay-booking.dto';
import { RateBookingDto } from './dto/rate-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';

@ApiTags('Bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Create a booking (customer only)' })
  create(@Body() dto: CreateBookingDto, @Request() req) {
    return this.bookingsService.create(req.user.userId, dto);
  }

  @Get()
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get current user bookings' })
  getMyBookings(@Request() req) {
    return this.bookingsService.findByCustomer(req.user.userId);
  }

  @Patch(':id/status')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update booking status (admin only)' })
  updateStatus(@Param('id') id: string, @Body() body: UpdateBookingStatusDto) {
    return this.bookingsService.updateStatus(+id, body.status);
  }

  @Patch(':id/technician')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Assign technician to booking (admin only)' })
  assignTechnician(@Param('id') id: string, @Body() body: AssignTechnicianDto) {
    return this.bookingsService.assignTechnician(+id, body.technicianId);
  }

  @Get('technician/my')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TECHNICIAN)
  @ApiOperation({ summary: 'Get bookings assigned to logged-in technician' })
  getTechnicianBookings(@Request() req) {
    return this.bookingsService.findByTechnician(req.user.userId);
  }

  @Patch(':id/status/technician')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TECHNICIAN)
  @ApiOperation({ summary: 'Technician updates their own booking status' })
  updateStatusByTechnician(
    @Param('id') id: string,
    @Body() dto: UpdateBookingStatusDto,
    @Request() req,
  ) {
    return this.bookingsService.technicianUpdateStatus(
      +id,
      req.user.userId,
      dto.status,
    );
  }

  @Patch(':id/rate')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Customer rates the booking after completion' })
  rateBooking(
    @Param('id') id: string,
    @Body() dto: RateBookingDto,
    @Request() req,
  ) {
    return this.bookingsService.rateBooking(
      +id,
      req.user.userId,
      dto.rating,
      dto.comment,
    );
  }

  @Patch(':id/pay')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Pay for a booking (mock)' })
  payBooking(
    @Param('id') id: string,
    @Body() dto: PayBookingDto,
    @Request() req,
  ) {
    return this.bookingsService.payForBooking(
      +id,
      req.user.userId,
      dto.paymentReference,
    );
  }

  @Get('admin/bookings/:id/payment')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get payment info for a booking (admin only)' })
  async getBookingPaymentInfo(@Param('id') id: string) {
    return await this.bookingsService.getBookingPaymentInfo(+id);
  }

  @Get('admin/bookings/payments')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiQuery({
    type: FilterBookingsDto,
  })
  @ApiOperation({ summary: 'Admin: List payments with filters and pagination' })
  async getPayments(@FilterQuery(FilterBookingsDto) filter: FilterBookingsDto) {
    return await this.bookingsService.getFilteredPayments(filter);
  }
}
