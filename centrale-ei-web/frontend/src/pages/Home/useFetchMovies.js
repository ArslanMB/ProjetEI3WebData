import { useEffect, useState } from 'react';
import axios from 'axios';

export function useFetchMovies(currentPage) {
  const [movies, setMovies] = useState([]);
  const [moviesLoadingError, setMoviesLoadingError] = useState(null);

  useEffect(() => {
    setMoviesLoadingError(null);

    axios
      .get('http://localhost:8000/movies') // ← appel à ton backend local
      .then((response) => {
        setMovies(response.data); // ← doit être un tableau de films [{ id, title, ... }]
      })
      .catch((error) => {
        console.error(error);
        setMoviesLoadingError('Erreur lors du chargement des films');
      });
  }, [currentPage]);

  return { movies, moviesLoadingError };
}
