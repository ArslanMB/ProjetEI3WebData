import express from 'express';
import { appDataSource } from '../datasource.js';
import { Movie } from '../entities/movie.js';

const moviesRouter = express.Router();
const movieRepository = appDataSource.getRepository('Movie');



// ➤ GET /movies : renvoie tous les films
moviesRouter.get('/', async (req, res) => {
  const page = parseInt(req.query.page || '1');
  const limit = parseInt(req.query.limit || '20');
  const skip = (page - 1) * limit;

  try {
    const [movies, total] = await movieRepository.findAndCount({
      skip,
      take: limit,
      order: { id: 'ASC' },
    });

    res.status(200).json({ movies, total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la récupération des films' });
  }
});

moviesRouter.get('/search', async (req, res) => {
  const q = req.query.q?.toLowerCase() || '';
  try {
    const movieRepository = appDataSource.getRepository('Movie');
    const movies = await movieRepository
      .createQueryBuilder('movie')
      .where('LOWER(movie.title) LIKE :q', { q: `%${q}%` })
      .getMany();

    res.status(200).json({ movies });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur de recherche' });
  }
});

moviesRouter.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ message: 'ID invalide' });
  }

  try {
    const movieRepository = appDataSource.getRepository(Movie);
    const movie = await movieRepository.findOneBy({ id });

    if (!movie) {
      return res.status(404).json({ message: 'Film non trouvé' });
    }

    return res.status(200).json(movie); // JSON direct du film
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
