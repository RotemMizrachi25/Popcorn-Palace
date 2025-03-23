// src/filters/http-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      // Check if this is a validation error with detailed information
      if (typeof exceptionResponse === 'object') {
        if ('message' in exceptionResponse) {
          message = String(exceptionResponse['message']);
        }
        
        // Preserve the detailed errors if they exist
        if ('errors' in exceptionResponse) {
          errors = exceptionResponse['errors'];
        }
      } else {
        message = String(exception.message);
      }
    } else if (exception instanceof QueryFailedError) {
      // Handle database errors
      if (exception.message.includes('duplicate key')) {
        status = HttpStatus.CONFLICT;
        message = 'A record with the same unique values already exists';
        
        // Try to identify which entity caused the error
        if (exception.message.includes('movie')) {
          message = 'A movie with this title already exists';
        } else if (exception.message.includes('showtime')) {
          message = 'A showtime with these details already exists';
        } else if (exception.message.includes('booking')) {
          message = 'This seat is already booked for the selected showtime';
        }
      }
    } else if (exception instanceof Error) {
      // Handle any standard Error object
      message = exception.message;
    }

    const responseBody = {
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };
    
    // Add errors if they exist
    if (errors) {
      responseBody['errors'] = errors;
    }

    response.status(status).json(responseBody);
  }
}