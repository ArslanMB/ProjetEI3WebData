import 'reflect-metadata';
import { DataSource } from 'typeorm';
import User from './entities/user.js';
import { Movie } from './entities/movie.js';

export const appDataSource = new DataSource({
  type: 'sqlite',
  database: './db.sqlite',
  synchronize: true,
  entities: [User, Movie],
  migrations: ['./src/migrations/*.js'],
});

