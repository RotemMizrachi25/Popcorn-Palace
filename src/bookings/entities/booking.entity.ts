import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Booking {
  @ApiProperty({ 
    example: 'd1a6423b-4469-4b00-8c5f-e3cfc42eacae',
    description: 'The unique identifier of the booking (UUID)'
  })
  @PrimaryGeneratedColumn('uuid')
  bookingId: string;

  @ApiProperty({ example: 1, description: 'The ID of the showtime being booked' })
  @Column()
  showtimeId: number;

  @ApiProperty({ example: 15, description: 'The seat number being booked' })
  @Column()
  seatNumber: number;

  @ApiProperty({ 
    example: '84438967-f68f-4fa0-b620-0f08217e76af',
    description: 'The ID of the user making the booking'
  })
  @Column()
  userId: string;
}