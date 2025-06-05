import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Dashboard({ user }) {
  const [reviews, setReviews] = useState([]);
  const [average, setAverage] = useState(null);
  const [error, setError] = useState('');

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
    <div style={{ padding: '2rem', color: 'white', background: 'linear-gradient(to right, #111 30%, #141e30 100%)', minHeight: '100vh' }}>
      <h2>Bienvenue, {user.username}</h2>
      <h3>Vous avez noté {reviews.length} film(s)</h3>
      {average !== null && <p> Moyenne de vos notes : <strong>{average.toFixed(2)}</strong></p>}

      <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
        {reviews.map((r) => (
          <li key={r.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #333', paddingBottom: '1rem' }}>
            {r.movie.poster_path && (
              <Link to={`/movies/${r.movie.id}`}>
                <img
                  src={`https://image.tmdb.org/t/p/w200${r.movie.poster_path}`}
                  alt={r.movie.title}
                  style={{ borderRadius: '8px', marginRight: '1rem', width: '100px' }}
                />
              </Link>
            )}

            <div>
              <Link to={`/movies/${r.movie.id}`} style={{ color: '#61dafb', textDecoration: 'none', fontSize: '1.2rem' }}>
                🎬 <strong>{r.movie.title}</strong>
              </Link>
              <br />
              Note : {r.rating} / 5
              {r.comment && <p style={{ fontStyle: 'italic', marginTop: '0.5rem' }}>"{r.comment}"</p>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
