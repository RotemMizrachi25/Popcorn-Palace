import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({
    description: 'ID of the showtime to book',
    example: 1
  })
  @IsNotEmpty()
  @IsNumber()
  showtimeId: number;

  @ApiProperty({
    description: 'Seat number to book',
    example: 15,
    minimum: 1
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  seatNumber: number;

  @ApiProperty({
    description: 'ID of the user making the booking',
    example: '84438967-f68f-4fa0-b620-0f08217e76af'
  })
  @IsNotEmpty()
  @IsString()
  userId: string;
}