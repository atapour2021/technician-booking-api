import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { Service } from './service.entity';
import { CategoryModule } from 'src/category/category.module';
import { Booking } from 'src/bookings/booking.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Service]),
    TypeOrmModule.forFeature([Booking]),
    CategoryModule,
  ],
  providers: [ServicesService],
  controllers: [ServicesController],
  exports: [ServicesService],
})
export class ServicesModule {}
