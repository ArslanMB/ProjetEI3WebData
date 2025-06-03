// backend/server.js
import express from 'express';
import logger from 'morgan';
import cors from 'cors';
import indexRouter from './routes/index.js';
import usersRouter from './routes/users.js';
import moviesRouter from './routes/movies.js';
import { routeNotFoundJsonHandler } from './services/routeNotFoundJsonHandler.js';
import { jsonErrorHandler } from './services/jsonErrorHandler.js';
import { appDataSource } from './datasource.js';


appDataSource
  .initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
    const app = express();

    app.use(express.json());
    app.use(logger('dev'));
    app.use(cors());
    app.use(express.urlencoded({ extended: false }));

    app.use('/', indexRouter);
    app.use('/users', usersRouter);
    app.use('/movies', moviesRouter);

    app.use(routeNotFoundJsonHandler);
    app.use(jsonErrorHandler);

    const port = parseInt(process.env.PORT || '8000');
    app.listen(port, () => {
      console.log(`Server listening at http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error('Error during Data Source initialization:', err);
  });
