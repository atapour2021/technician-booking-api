import { Module } from '@nestjs/common';
import { TechniciansService } from './technicians.service';
import { TechniciansController } from './technicians.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Technician } from './entity/technician.entity';
import { Skill } from './entity/skill.entity';
import { Document } from './entity/document.entity';
import { ServiceArea } from './entity/service-area.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Technician, Skill, ServiceArea, Document]),
  ],
  providers: [TechniciansService],
  controllers: [TechniciansController],
})
export class TechniciansModule {}
