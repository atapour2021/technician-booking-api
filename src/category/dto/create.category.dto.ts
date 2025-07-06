import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDtp {
  @ApiProperty({ required: true })
  title: string;

  @ApiProperty()
  description: string;
}
