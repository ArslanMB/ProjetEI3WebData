import { useEffect, useState } from 'react';
import axios from 'axios';

export function useFetchMovies(currentPage) {
  const [movies, setMovies] = useState([]);
  const [moviesLoadingError, setMoviesLoadingError] = useState(null);

  useEffect(() => {
    setMoviesLoadingError(null);

    const options = {
      method: 'GET',
      url: `https://api.themoviedb.org/3/movie/popular?language=fr-FR&page=${currentPage}`,
      headers: {
        accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxZjlmNjAwMzY4MzMzODNkNGIwYjNhNzJiODA3MzdjNCIsInN1YiI6IjY0NzA5YmE4YzVhZGE1MDBkZWU2ZTMxMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.Em7Y9fSW94J91rbuKFjDWxmpWaQzTitxRKNdQ5Lh2Eo'
      }
    };

    axios
      .request(options)
      .then((response) => {
        setMovies(response.data.results);
      })
      .catch((error) => {
        setMoviesLoadingError('Problème de chargement');
        console.error(error);
      });
  }, [currentPage]);

  return { movies, moviesLoadingError };
}
