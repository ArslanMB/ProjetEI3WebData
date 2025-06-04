import { useEffect, useState } from 'react';
import axios from 'axios';

export function useFetchMovies(currentPage, searchQuery) {
  const [movies, setMovies] = useState([]);
  const [moviesLoadingError, setMoviesLoadingError] = useState(null);

  useEffect(() => {
    setMoviesLoadingError(null);

    const url = searchQuery
      ? `http://localhost:8000/movies/search?q=${encodeURIComponent(searchQuery)}`
      : `http://localhost:8000/movies?page=${currentPage}&limit=20`;

    axios.get(url)
      .then((res) => {
        setMovies(res.data.movies);
      })
      .catch((error) => {
        setMoviesLoadingError('Problème de chargement');
        console.error(error);
      });
  }, [currentPage, searchQuery]);

  return { movies, moviesLoadingError };
}
