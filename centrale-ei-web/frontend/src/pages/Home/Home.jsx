import './Home.css';
import { useState } from 'react';
import { useFetchMovies } from './useFetchMovies';
import Movie from '../../components/Movie';
import { Link } from 'react-router-dom';

function Home({ user }) {
  const [movieName, setMovieName] = useState('');
  const [styleIndex, setStyleIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const { movies, moviesLoadingError } = useFetchMovies(currentPage, movieName.trim());

  return (
    <div className={`App`}>
      <header className="App-header">
        {user ? (
          <p>Bonjour, {user.username} !</p>
        ) : (
          <>
            <a href="/register">S'inscrire</a>
            <a href="/login" style={{ marginLeft: '20px' }}>Se connecter</a>
          </>
        )}

        <button onClick={() => setStyleIndex((styleIndex + 1) % 4)}>
          Changer le fond
        </button>

        <h1>Films populaires</h1>
        <input
          type="text"
          placeholder="Rechercher un film..."
          value={movieName}
          onChange={(e) => {
            setMovieName(e.target.value);
            setCurrentPage(1); // reset page to 1 when searching
          }}
        />

        {moviesLoadingError && <p style={{ color: 'red' }}>{moviesLoadingError}</p>}

        <div className="movie-grid">
          {movies.map((movie) => (
            <Link key={movie.id} to={`/movies/${movie.id}`}>
              <Movie movie={movie} />
            </Link>
          ))}
        </div>
      </header>

      {movieName.trim() === '' && (
        <div style={{ marginBottom: '30px' }}>
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            {currentPage - 1}
          </button>
          <button onClick={() => setCurrentPage((prev) => prev + 1)}>
            {currentPage + 1}
          </button>
          <p><strong>Page actuelle : {currentPage}</strong></p>
        </div>
      )}
    </div>
  );
}

export default Home;
