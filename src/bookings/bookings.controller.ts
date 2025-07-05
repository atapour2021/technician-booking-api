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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { BookingStatus } from './booking.entity';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { AssignTechnicianDto } from './dto/assign-technician.dto';
import { RateBookingDto } from './dto/rate-booking.dto';
import { PayBookingDto } from './dto/pay-booking.dto';

@ApiTags('Bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  @ApiOperation({ summary: 'Create a booking (customer only)' })
  create(@Body() dto: CreateBookingDto, @Request() req) {
    return this.bookingsService.create(req.user.userId, dto);
  }

  @Get()
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer', 'admin')
  @ApiOperation({ summary: 'Get current user bookings' })
  getMyBookings(@Request() req) {
    return this.bookingsService.findByCustomer(req.user.userId);
  }

  @Patch(':id/status')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update booking status (admin only)' })
  updateStatus(@Param('id') id: string, @Body() body: UpdateBookingStatusDto) {
    return this.bookingsService.updateStatus(+id, body.status as BookingStatus);
  }

  @Patch(':id/technician')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Assign technician to booking (admin only)' })
  assignTechnician(@Param('id') id: string, @Body() body: AssignTechnicianDto) {
    return this.bookingsService.assignTechnician(+id, body.technicianId);
  }

  @Get('technician/my')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('technician')
  @ApiOperation({ summary: 'Get bookings assigned to logged-in technician' })
  getTechnicianBookings(@Request() req) {
    return this.bookingsService.findByTechnician(req.user.userId);
  }

  @Patch(':id/status/technician')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('technician')
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
  @Roles('customer')
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
  @Roles('customer')
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
}
