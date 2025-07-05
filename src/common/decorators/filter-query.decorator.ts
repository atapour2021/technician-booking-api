import {
  createParamDecorator,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

export function FilterQuery<T>(dtoClass: new () => T) {
  return createParamDecorator(async (_, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const query = request.query;

    const instance = plainToInstance(dtoClass, query, {
      enableImplicitConversion: true,
    });

    if (!instance || typeof instance !== 'object') {
      throw new BadRequestException('Invalid filter parameters');
    }

    const errors = await validate(instance as object, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return instance;
  })();
}
