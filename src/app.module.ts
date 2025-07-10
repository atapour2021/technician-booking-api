import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ServicesModule } from './services/services.module';
import { BookingsModule } from './bookings/bookings.module';
import { PaymentsModule } from './payments/payments.module';
import { ProfileModule } from './profile/profile.module';
import { CategoryModule } from './category/category.module';
import { OtpModule } from './otp/otp.module';
import { TechniciansModule } from './technicians/technicians.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'kia@123321',
      database: 'technician_booking',
      autoLoadEntities: true,
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
    ServicesModule,
    BookingsModule,
    PaymentsModule,
    ProfileModule,
    CategoryModule,
    OtpModule,
    TechniciansModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
