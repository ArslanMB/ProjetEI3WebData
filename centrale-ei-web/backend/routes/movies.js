import express from 'express';
import { appDataSource } from '../datasource.js';
import { Movie } from '../entities/movie.js';

const moviesRouter = express.Router();
const movieRepository = appDataSource.getRepository('Movie');


// ➤ GET /movies : renvoie tous les films
moviesRouter.get('/', async (req, res) => {
  try {
    const movies = await appDataSource.getRepository(Movie).find();
    res.status(200).json({ movies });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la récupération des films' });
  }
});

moviesRouter.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ message: 'ID invalide' });
  }

  try {
    const movie = await movieRepository.findOneBy({ id });

    if (!movie) {
      return res.status(404).json({ message: 'Film non trouvé' });
    }

    return res.status(200).json(movie);
  } catch (err) {
    return res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// ➤ POST /movies/new : ajoute un film
moviesRouter.post('/new', async (req, res) => {
  const { title, release_date } = req.body;

  if (!title || !release_date) {
    return res.status(400).json({ message: 'Titre et date requis' });
  }

  try {
    const movieRepository = appDataSource.getRepository(Movie);
    const newMovie = movieRepository.create({ title, release_date });

    await movieRepository.insert(newMovie);

    res.status(201).json({
      message: 'Film ajouté avec succès',
      movie: newMovie,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de l’ajout du film' });
  }
});

export default moviesRouter;
