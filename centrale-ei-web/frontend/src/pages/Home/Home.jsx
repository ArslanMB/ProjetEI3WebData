// src/pages/Home.jsx

import './Home.css';
import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useFetchMovies } from './useFetchMovies';
import Movie from '../../components/Movie';
import { Link } from 'react-router-dom';

function Home({ user }) {
  const [movieName, setMovieName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [genreFilter, setGenreFilter] = useState('');
  const [sortOption, setSortOption] = useState('');
  const { movies, moviesLoadingError } = useFetchMovies(currentPage, movieName.trim());

  const [recommendations, setRecommendations] = useState([]);
  const [recoLoading, setRecoLoading] = useState(true);
  const [recoError, setRecoError] = useState('');

  useEffect(() => {
    if (!user) {
      setRecommendations([]);
      setRecoLoading(false);
      setRecoError('');
      return;
    }

    setRecoLoading(true);
    setRecoError('');

    axios
      .get(`http://localhost:8001/recommendations/${user.id}/user-based?top_n=5`)
      .then((res) => {
        const movieIds = res.data.map((r) => r.movie_id);
        if (movieIds.length === 0) {
          setRecommendations([]);
          setRecoLoading(false);
          return null;
        }
        return Promise.all(movieIds.map((id) => axios.get(`http://localhost:8000/movies/${id}`)));
      })
      .then((resArr) => {
        if (!resArr) return;
        setRecommendations(resArr.map((r) => r.data));
        setRecoLoading(false);
      })
      .catch(() => {
        setRecoError('Impossible de charger les recommandations.');
        setRecoLoading(false);
      });
  }, [user]);

  const filteredAndSortedMovies = useMemo(() => {
    if (!movies) return [];

    let result = movies.filter((m) => {
      if (!genreFilter.trim()) return true;
      return (m.genres || '').toLowerCase().includes(genreFilter.trim().toLowerCase());
    });

    if (sortOption === 'popularity') {
      result.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    } else if (sortOption === 'alpha') {
      result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    } else if (sortOption === 'year') {
      result.sort((a, b) => {
        const yearA = parseInt(a.release_date?.split('-')[0]) || 0;
        const yearB = parseInt(b.release_date?.split('-')[0]) || 0;
        return yearB - yearA;
      });
    }

    return result;
  }, [movies, genreFilter, sortOption]);

  return (
    <div className="App">
      {user && (
        <section className="recommendations-section" style={{ padding: '2rem' }}>
          <h2>Films recommandés pour vous</h2>
          {recoLoading && <p>Chargement des recommandations...</p>}
          {recoError && <p className="error-message">{recoError}</p>}
          {!recoLoading && recommendations.length === 0 && !recoError && (
            <p>Aucune recommandation disponible pour le moment.</p>
          )}
          {!recoLoading && recommendations.length > 0 && (
            <div className="movie-grid">
              {recommendations.map((movie) => (
                <Link key={movie.id} to={`/movies/${movie.id}`}>
                  <Movie movie={movie} />
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

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
        <div className="filters-section" style={{ marginTop: '1.5rem', padding: '0 2rem' }}>
          <label htmlFor="genre" style={{ marginRight: '0.5rem' }}>Filtrer par genre :</label>
          <input
            id="genre"
            type="text"
            placeholder="Entrez un genre (ex : Action)"
            value={genreFilter}
            onChange={(e) => {
              setGenreFilter(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: '6px 10px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#222',
              color: 'white',
              marginRight: '1rem',
            }}
          />
          <label htmlFor="sort" style={{ marginRight: '0.5rem' }}>Trier par :</label>
          <select
            id="sort"
            value={sortOption}
            onChange={(e) => {
              setSortOption(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: '6px 10px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#222',
              color: 'white',
              marginRight: '1rem',
            }}
          >
            <option value="">Aucun tri</option>
            <option value="popularity">Popularité (décroissant)</option>
            <option value="alpha">Titre (A → Z)</option>
            <option value="year">Année de sortie (récentes d’abord)</option>
          </select>
        </div>
      </header>

      {moviesLoadingError && <p className="error-message">{moviesLoadingError}</p>}

      <main className="movie-grid">
        {filteredAndSortedMovies.map((movie) => (
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
