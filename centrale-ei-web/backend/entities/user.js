import { EntitySchema } from 'typeorm';

export const User = new EntitySchema({
  name: 'User',
  tableName: 'user',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    username: {
      type: 'varchar',
      unique: true,
    },
    email: {
      type: 'varchar',
      unique: true,
    },
    birthYear: {
      type: 'int',
    },
    passwordHash: {
      type: 'varchar',
    },
  },
});

export default User;
