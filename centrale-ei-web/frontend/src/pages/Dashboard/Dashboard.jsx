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
      .catch((err) => {
        setError("Erreur lors du chargement du dashboard.");
      });
  }, [user]);

  if (!user) return <p>Veuillez vous connecter.</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Bienvenue, {user.username}</h2>
      <h3>Vous avez noté {reviews.length} film(s)</h3>
      {average !== null && <p>🎯 Moyenne de vos notes : <strong>{average.toFixed(2)}</strong></p>}

      <ul>
        {reviews.map((r) => (
          <li key={r.id} style={{ marginBottom: '1rem' }}>
            <Link to={`/movies/${r.movie.id}`}>
              🎬 <strong>{r.movie.title}</strong>
            </Link>
            <br />
            Note : {r.rating} / 5
            {r.comment && <p><i>"{r.comment}"</i></p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
