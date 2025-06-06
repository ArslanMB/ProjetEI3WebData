import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import rateflixLogo from '../Home/Rateflix.png';
import './Dashboard.css';

export default function Dashboard({ user }) {
  const [reviews, setReviews] = useState([]);
  const [average, setAverage] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    axios.get(`http://localhost:8000/users/${user.id}/reviews`)
      .then((res) => {
        setReviews(res.data.reviews);
        setAverage(res.data.average);
      })
      .catch(() => {
        setError("Erreur lors du chargement du dashboard.");
      });
  }, [user]);

  if (!user) return <p>Veuillez vous connecter.</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="dashboard-container">
      <div style={{ position: 'relative', marginBottom: '2rem' }}>
        <img
          src={rateflixLogo}
          alt="RateFlix Logo"
          className="register-logo"
          style={{ height: '90px', display: 'block', margin: '0 auto 1rem' }}
        />
        <button
          className="btn"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            margin: 0,
            width: 180,
            fontWeight: 600,
            fontSize: '1rem'
          }}
          onClick={() => navigate('/')}
        >
          ← Retour à l'accueil
        </button>
      </div>
      <h2 className="dashboard-subtitle">Bienvenue, {user.username}</h2>
      <h3 className="dashboard-subtitle">Vous avez noté {reviews.length} film(s)</h3>
      {average !== null && (
        <p className="dashboard-average">
          Moyenne de vos notes : <strong>{average.toFixed(2)}</strong>
        </p>
      )}

      <ul className="dashboard-reviews-list">
        {reviews.map((r) => (
          <li key={r.id} className="dashboard-review-item">
            {r.movie.poster_path && (
              <Link to={`/movies/${r.movie.id}`}>
                <img
                  src={`https://image.tmdb.org/t/p/w200${r.movie.poster_path}`}
                  alt={r.movie.title}
                  className="dashboard-movie-poster"
                />
              </Link>
            )}

            <div>
              <Link to={`/movies/${r.movie.id}`} className="dashboard-movie-title">
                🎬 <strong>{r.movie.title}</strong>
              </Link>
              <br />
              Note : {r.rating} / 5
              {r.comment && <p className="dashboard-comment">"{r.comment}"</p>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}