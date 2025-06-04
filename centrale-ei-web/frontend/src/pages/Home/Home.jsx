import './Home.css';
import logo from './logo.svg';
import { useState } from 'react';
import { useFetchMovies } from './useFetchMovies';
import Movie from '../../components/Movie';
import { Link } from 'react-router-dom';

function Home({ user }) {
  const [movieName, setMovieName] = useState('');
  const [styleIndex, setStyleIndex] = useState(0);
  const bgStyles = ['bg-glass', 'bg-zoom', 'bg-polaroid', 'bg-dark'];
  const [currentPage, setCurrentPage] = useState(1);
  const { movies, moviesLoadingError } = useFetchMovies(currentPage);

  return (
    <div className={`App ${bgStyles[styleIndex]}`}>
      <header className="App-header">
        {user ? (
          <p>Bonjour, {user.username} !</p>
        ) : (
          <>
            <a href="/register">S'inscrire</a>
            <a href="/login" style={{ marginLeft: '20px' }}>Se connecter</a>
          </>
        )}
        <button
          onClick={() => setStyleIndex((styleIndex + 1) % bgStyles.length)}
          style={{ margin: '20px', padding: '10px 20px', fontSize: '16px' }}
        >
          Changer le fond
        </button>


        <h1>Films populaires</h1>
        <input
          type="text"
          placeholder="Rechercher un film..."
          value={movieName}
          onChange={(e) => setMovieName(e.target.value)}
          style={{ padding: '8px', width: '300px', fontSize: '16px' }}
        />

        {moviesLoadingError && <p style={{ color: 'red' }}>{moviesLoadingError}</p>}

        <div className="movie-grid">
          {movies
            .filter((movie) => movie.title.toLowerCase().includes(movieName.toLowerCase()))
            .map((movie) => {
              console.log("Film:", movie);
              return (
                <Link key={movie.id} to={`/movies/${movie.id}`}>
                  <Movie movie={movie} />
                </Link>
              );
            })}
        </div>
      </header>
      <div 
        style={{ 
          marginBottom: '30px',
          backgroundColor: '#282c34'
        }}
      >
        <button
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          style={{
              marginRight: '10px',
            }}
        >
          {currentPage - 1}
        </button>

        <button
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          {currentPage +1}
        </button>

        <p><strong>Page actuelle : {currentPage}</strong></p>
      </div>      
    </div>
    
  );
}

export default Home;
