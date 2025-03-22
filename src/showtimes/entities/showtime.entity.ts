import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Movie } from '../../movies/entities/movie.entity';

@Entity()
export class Showtime {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('float')
  price: number;

  @Column()
  theater: string;

  @Column('timestamp')
  startTime: Date;

  @Column('timestamp')
  endTime: Date;

  @Column()
  movieId: number;

  @ManyToOne(() => Movie, movie => movie.id)
  @JoinColumn({ name: 'movieId' })
  movie: Movie;
}