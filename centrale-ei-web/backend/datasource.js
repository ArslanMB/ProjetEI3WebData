import { DataSource } from 'typeorm';
import User from './entities/user.js';
import Movie from './entities/movie.js';
import Review from './entities/review.js';
import 'reflect-metadata';

export const appDataSource = new DataSource({
  type: 'sqlite',
  database: './db.sqlite',
  synchronize: true,
  entities: [User, Movie, Review],
  logging: true,
  migrations: ['./src/migrations/*.js'],
});

