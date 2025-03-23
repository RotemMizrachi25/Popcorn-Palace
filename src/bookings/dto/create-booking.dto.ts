import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateBookingDto {
  @IsNotEmpty()
  @IsNumber()
  showtimeId: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  seatNumber: number;

  @IsNotEmpty()
  @IsString()
  userId: string;
}