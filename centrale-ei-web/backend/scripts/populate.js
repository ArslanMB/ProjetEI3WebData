import 'dotenv/config.js';
import axios from 'axios';
import { appDataSource } from '../datasource.js';
import Movie from '../entities/movie.js';

const API_URL = 'https://api.themoviedb.org/3/movie/popular';
const TOTAL_PAGES = 15;

const headers = {
  accept: 'application/json',
  Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
};

async function fetchMoviesFromApi(page) {
  const response = await axios.get(`${API_URL}?language=fr-FR&page=${page}`, { headers });
  return response.data.results;
}

async function populate() {
  await appDataSource.initialize();
  console.log('🔗 Connexion DB réussie');

  const movieRepository = appDataSource.getRepository(Movie);
  const existing = await movieRepository.find();
  const existingTitles = new Set(existing.map(m => `${m.title}-${m.release_date}`));

  let added = 0;

  for (let page = 1; page <= TOTAL_PAGES; page++) {
    console.log(`📥 Page ${page}...`);
    const movies = await fetchMoviesFromApi(page);

    for (const movie of movies) {
      const key = `${movie.title}-${movie.release_date}`;
      if (!existingTitles.has(key)) {
        const newMovie = movieRepository.create({
          title: movie.title,
          release_date: movie.release_date,
        });
        await movieRepository.save(newMovie);
        existingTitles.add(key);
        added++;
      }
    }
  }

  console.log(`${added} films ajoutés à la base.`);
  process.exit(0);
}

populate().catch((err) => {
  console.error('❌ Erreur :', err);
  process.exit(1);
});
