import { ApiProperty } from '@nestjs/swagger';
import { CreateCategoryDtp } from './create.category.dto';
import { Service } from 'src/services/service.entity';

export class UpdateCategoryDto extends CreateCategoryDtp {
  @ApiProperty()
  service: Service;
}
