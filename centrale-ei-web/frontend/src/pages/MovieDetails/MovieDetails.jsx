import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function MovieDetails({ user }) {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [rating, setRating] = useState(1);
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get(`http://localhost:8000/movies/${id}`)
      .then((res) => {
        console.log("Film reçu:", res.data);
        setMovie(res.data.movie || res.data);
      })
      .catch(() => setMessage("Erreur lors du chargement du film."));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return setMessage("Vous devez être connecté pour noter.");
    try {
      await axios.post('http://localhost:8000/reviews', {
        userId: user.id,
        movieId: movie.id,
        rating,
        comment,
      });
      setMessage("Avis enregistré !");
    } catch (err) {
      setMessage(err.response?.data?.message || "Erreur.");
    }
  };

  if (!movie || !movie.id) return <p>Chargement...</p>;

  return (
    <div style={{ padding: '2rem', color: '#fff', backgroundColor: '#1c1c1c', borderRadius: '12px', maxWidth: '800px', margin: 'auto' }}>
      {movie.poster_path && (
        <img
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
          alt={movie.title}
          style={{ maxWidth: '300px', borderRadius: '8px', float: 'left', marginRight: '2rem' }}
        />
      )}

      <div>
        <h1>{movie.title}</h1>
        <p><strong>Date de sortie :</strong> {movie.release_date}</p>
        <p><strong>Durée :</strong> {movie.runtime ? `${movie.runtime} min` : 'Inconnue'}</p>
        <p><strong>Popularité :</strong> {movie.popularity || 'N/A'}</p>
        <p><strong>Genres :</strong> {movie.genres || 'Non spécifiés'}</p>
        <p style={{ marginTop: '1rem' }}><strong>Synopsis :</strong><br />{movie.overview || 'Pas de résumé disponible.'}</p>
      </div>

      <div style={{ clear: 'both', marginTop: '2rem' }}>
        <h2>Laisser un avis</h2>
        <form onSubmit={handleSubmit}>
          <label>Note (1 à 5)</label><br />
          <input
            type="number"
            min={1}
            max={5}
            value={rating}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              if (value >= 1 && value <= 5) setRating(value);
            }}
            required
          />
          <br /><br />
          <label>Commentaire</label><br />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Votre avis..."
            style={{ width: '100%', height: '80px' }}
          />
          <br /><br />
          <button type="submit" style={{ padding: '10px 20px' }}>Envoyer l'avis</button>
          <p>{message}</p>
        </form>
      </div>
    </div>
  );
}
