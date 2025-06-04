import 'dotenv/config.js';
import axios from 'axios';
import { appDataSource } from '../datasource.js';
import Movie from '../entities/movie.js';

const API_BASE = 'https://api.themoviedb.org/3';
const POPULAR_URL = `${API_BASE}/movie/popular`;
const TOTAL_PAGES = 15;

const headers = {
  accept: 'application/json',
  Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
};

async function fetchPopularMovieIds(page) {
  const response = await axios.get(`${POPULAR_URL}?language=fr-FR&page=${page}`, { headers });
  return response.data.results.map(movie => movie.id); // récupère uniquement les IDs
}

async function fetchMovieDetails(movieId) {
  const response = await axios.get(`${API_BASE}/movie/${movieId}?language=fr-FR`, { headers });
  return response.data;
}

async function populate() {
  await appDataSource.initialize();
  console.log('Connexion DB réussie');

  const movieRepository = appDataSource.getRepository(Movie);
  const existing = await movieRepository.find();
  const existingKeys = new Set(existing.map(m => `${m.title}-${m.release_date}`));

  let added = 0;

  for (let page = 1; page <= TOTAL_PAGES; page++) {
    console.log(`Page ${page}`);
    const movieIds = await fetchPopularMovieIds(page);

    for (const movieId of movieIds) {
      try {
        const movie = await fetchMovieDetails(movieId);
        const key = `${movie.title}-${movie.release_date}`;
        if (existingKeys.has(key)) continue;

        const newMovie = movieRepository.create({
          title: movie.title,
          release_date: movie.release_date,
          poster_path: movie.poster_path,
          overview: movie.overview,
          runtime: movie.runtime,
          popularity: movie.popularity,
          genres: JSON.stringify(movie.genres.map(g => g.name)), // ← genre names sous forme de string JSON
        });

        await movieRepository.save(newMovie);
        existingKeys.add(key);
        added++;
        console.log(`${movie.title}`);
      } catch (err) {
        console.warn(`Erreur pour le film ID ${movieId} : ${err.message}`);
      }
    }
  }

  console.log(`🎉 ${added} films ajoutés à la base.`);
  process.exit(0);
}

populate().catch((err) => {
  console.error('Erreur :', err);
  process.exit(1);
});

