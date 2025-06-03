import { EntitySchema } from 'typeorm';

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
  },
});

export default Movie;
