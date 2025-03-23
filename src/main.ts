import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException  } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      exceptionFactory: (errors) => {
        const formattedErrors = errors.map(error => {
          const constraints = error.constraints ? 
            Object.values(error.constraints).join(', ') : 
            'Invalid value';
          return `${error.property}: ${constraints}`;
        });
        return new BadRequestException({
          message: 'Validation failed',
          errors: formattedErrors
        });
      },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(3000);
}
bootstrap();