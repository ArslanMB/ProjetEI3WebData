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
    <div style={{ padding: '2rem' }}>
     {movie.poster_path && (
      <img
        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
        alt={movie.title}
        style={{ maxWidth: '300px', borderRadius: '8px', marginBottom: '1rem' }}
      />
    )}      
      <h1>{movie.title}</h1>
      <p>Date de sortie : {movie.release_date}</p>

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
        />
        <br /><br />
        <button type="submit">Envoyer l'avis</button>
        <p>{message}</p>
      </form>
    </div>
  );
}
