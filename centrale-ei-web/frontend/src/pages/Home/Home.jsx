import './Home.css';
import { useState } from 'react';
import { useFetchMovies } from './useFetchMovies';
import Movie from '../../components/Movie';
import { Link } from 'react-router-dom';

function Home({ user }) {
  const [movieName, setMovieName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { movies, moviesLoadingError } = useFetchMovies(currentPage, movieName.trim());

  return (
    <div className="App">
      <header className="stream-header">
        <div className="top-bar">
          <h1 className="site-title">🎬 RateFlix</h1>
          <div className="user-actions">
            {user ? (
              <>
                <span className="welcome">Bonjour, {user.username}</span>
                <Link to="/dashboard" className="btn btn-dashboard">Dashboard</Link>
              </>
            ) : (
              <>
                <a href="/register" className="btn">S'inscrire</a>
                <a href="/login" className="btn">Se connecter</a>
              </>
            )}
          </div>
        </div>

        <div className="search-section">
          <h2>Films populaires</h2>
          <input
            type="text"
            placeholder="Rechercher un film..."
            value={movieName}
            onChange={(e) => {
              setMovieName(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </header>

      {moviesLoadingError && <p className="error-message">{moviesLoadingError}</p>}

      <main className="movie-grid">
        {movies.map((movie) => (
          <Link key={movie.id} to={`/movies/${movie.id}`}>
            <Movie movie={movie} />
          </Link>
        ))}
      </main>

      {movieName.trim() === '' && (
        <div className="page-controls">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            ← Page {currentPage - 1}
          </button>
          <button onClick={() => setCurrentPage((prev) => prev + 1)}>
            Page {currentPage + 1} →
          </button>
        </div>
      )}
    </div>
  );
}

export default Home;
