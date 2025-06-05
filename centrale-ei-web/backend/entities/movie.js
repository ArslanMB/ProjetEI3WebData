import { EntitySchema } from 'typeorm';
import Review from './review.js';

export const Movie = new EntitySchema({
  name: 'Movie',
  tableName: 'movies',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    title: {
      type: 'varchar',
    },
    release_date: {
      type: 'text',
    },
    poster_path: {
      type: 'varchar',
      nullable: true,
    },
    overview: {
      type: 'text',
      nullable: true,
    },
    runtime: {
      type: 'int',
      nullable: true,
    },
    popularity: {
      type: 'float',
      nullable: true,
    },
    genres: {
      type: 'text',
      nullable: true,
    },
  },
  relations: {
    reviews: {
      type: 'one-to-many',
      target: 'Review',
      inverseSide: 'movie',
      cascade: true,
      eager: false, // tu peux garder false si tu préfères charger manuellement
    },
  },
});

export default Movie;
