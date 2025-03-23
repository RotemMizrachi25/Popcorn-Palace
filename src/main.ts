import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Set up validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
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
  
  // Set up exception filter
  app.useGlobalFilters(new HttpExceptionFilter());
  
  // Set up Swagger
  const config = new DocumentBuilder()
    .setTitle('Popcorn Palace API')
    .setDescription('Movie ticket booking system API')
    .setVersion('1.0')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  await app.listen(3000);
}
bootstrap();