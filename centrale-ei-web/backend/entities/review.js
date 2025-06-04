import { EntitySchema } from 'typeorm';
import User from './user.js';
import Movie from './movie.js';

const Review = new EntitySchema({
  name: 'Review',
  tableName: 'reviews',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    rating: {
      type: 'int',
    },
    comment: {
      type: 'text',
      nullable: true,
    },
    userId: {
      type: 'int',
    },
    movieId: {
      type: 'int',
    },
  },
  relations: {
    user: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: {
        name: 'userId',
      },
      eager: true,
    },
    movie: {
      type: 'many-to-one',
      target: 'Movie',
      joinColumn: {
        name: 'movieId',
      },
      eager: true,
    },
  },
  uniques: [
    {
      name: 'UQ_user_movie',
      columns: ['userId', 'movieId'],
    },
  ],
});

export default Review;