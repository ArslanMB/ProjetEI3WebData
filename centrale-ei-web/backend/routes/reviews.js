import express from 'express';
import { appDataSource } from '../datasource.js';
import Review from '../entities/review.js';
import Movie from '../entities/movie.js';
import User from '../entities/user.js';

const router = express.Router();

// POST: créer une review
router.post('/', async (req, res) => {
  const { userId, movieId, rating, comment } = req.body;

  if (!userId || !movieId || !rating) {
    return res.status(400).json({ message: 'Champs obligatoires manquants.' });
  }

  const reviewRepo = appDataSource.getRepository(Review);
  const userRepo = appDataSource.getRepository(User);
  const movieRepo = appDataSource.getRepository(Movie);

  try {
    const user = await userRepo.findOneBy({ id: userId });
    const movie = await movieRepo.findOneBy({ id: movieId });

    if (!user || !movie) {
      return res.status(404).json({ message: 'Utilisateur ou film introuvable.' });
    }

    const newReview = reviewRepo.create({
      user,
      movie,
      rating,
      comment,
    });

    await reviewRepo.save(newReview);
    res.status(201).json({ message: 'Avis enregistré.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// GET: avis pour un film
router.get('/movie/:movieId', async (req, res) => {
  const { movieId } = req.params;
  const reviewRepo = appDataSource.getRepository(Review);

  try {
    const reviews = await reviewRepo.find({
      where: {
        movie: {
          id: parseInt(movieId),
        },
      },
    });

    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

export default router;
