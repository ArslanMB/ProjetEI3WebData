import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function MovieDetails({ user }) {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [rating, setRating] = useState(1);
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState('');
  const [userReviewId, setUserReviewId] = useState(null);
  const [averageRating, setAverageRating] = useState(0);
  const navigate = useNavigate();

  const fetchMovie = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/movies/${id}`);
      const movieData = res.data.movie || res.data;
      setMovie(movieData);

      if (movieData.reviews && user) {
        const existingReview = movieData.reviews.find(r => r.user?.id === user.id);
        if (existingReview) {
          setRating(existingReview.rating);
          setComment(existingReview.comment);
          setUserReviewId(existingReview.id);
        }
      }

      if (movieData.reviews && movieData.reviews.length > 0) {
        const avg = movieData.reviews.reduce((sum, r) => sum + r.rating, 0) / movieData.reviews.length;
        setAverageRating(avg.toFixed(1));
      }

    } catch {
      setMessage("Erreur lors du chargement du film.");
    }
  };

  useEffect(() => {
    fetchMovie();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return setMessage("Vous devez être connecté pour noter.");
    try {
      if (userReviewId) {
        await axios.put(`http://localhost:8000/reviews/${userReviewId}`, {
          rating,
          comment
        });
      } else {
        await axios.post('http://localhost:8000/reviews', {
          userId: user.id,
          movieId: movie.id,
          rating,
          comment
        });
      }
      setMessage("Avis enregistré !");
      fetchMovie();
    } catch (err) {
      setMessage(err.response?.data?.message || "Erreur.");
    }
  };

  const renderStars = (value, clickable = false) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          onClick={clickable ? () => setRating(i) : undefined}
          style={{
            cursor: clickable ? 'pointer' : 'default',
            color: i <= value ? '#f5c518' : '#555',
            fontSize: '1.5rem',
            marginRight: '4px',
          }}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  if (!movie || !movie.id) return <p className="error-message">Chargement...</p>;

  return (
    <div className="movie-details" style={{ background: 'linear-gradient(to right, #111 30%, #141e30 100%)', padding: '2rem', borderRadius: '12px', color: 'white', maxWidth: '1000px', margin: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button
          onClick={() => navigate('/')}
          className="btn"
          style={{
            backgroundColor: '#61dafb',
            color: '#000',
            borderRadius: '20px',
            padding: '8px 16px',
            fontWeight: 'bold',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          ← Retour à l'accueil
        </button>
      </div>
      {/* Section film */}
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        {movie.poster_path && (
          <div style={{ textAlign: 'center' }}>
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              style={{ maxWidth: '300px', borderRadius: '12px' }}
            />
            <div style={{ marginTop: '1rem' }}>
              {renderStars(rating, true)}
            </div>
          </div>
        )}

        <div style={{ flex: 1 }}>
          <h1>{movie.title}</h1>
          <p><strong>Date de sortie :</strong> {movie.release_date}</p>
          <p><strong>Durée :</strong> {movie.runtime ? `${movie.runtime} min` : 'Inconnue'}</p>
          <p><strong>Popularité :</strong> {movie.popularity || 'N/A'}</p>
          <p><strong>Genres :</strong> {movie.genres || 'Non spécifiés'}</p>
          <p style={{ marginTop: '1rem' }}><strong>Synopsis :</strong><br />{movie.overview || 'Pas de résumé disponible.'}</p>
          {averageRating > 0 && (
            <p style={{ marginTop: '1rem' }}>
              <strong>Note moyenne :</strong> {renderStars(Math.round(averageRating))} ({averageRating}/5)
            </p>
          )}
        </div>
      </div>

      {/* Section Avis des autres */}
      <div style={{ marginTop: '3rem' }}>
        <h2>Avis des spectateurs</h2>
        {movie.reviews && movie.reviews.length > 0 ? (
          <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
            {movie.reviews.map((review) => (
              <li key={review.id} style={{ marginBottom: '1.5rem', borderBottom: '1px solid #333', paddingBottom: '1rem' }}>
                <strong>{review.user?.name || "Utilisateur anonyme"}</strong>
                <div>{renderStars(review.rating)}</div>
                <p style={{ marginTop: '0.5rem' }}>{review.comment}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>Aucun avis pour le moment.</p>
        )}
      </div>

      {/* Formulaire d'avis */}
      <div style={{ marginTop: '3rem' }}>
        <h2>{userReviewId ? "Modifier votre avis" : "Laisser un avis"}</h2>
        <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
          <label>Commentaire</label><br />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Votre avis..."
            style={{ width: '100%', height: '100px', borderRadius: '8px', padding: '8px', backgroundColor: '#222', color: 'white', border: 'none' }}
          />
          <br /><br />
          <button
            type="submit"
            className="btn"
            style={{ padding: '10px 20px', backgroundColor: '#e50914', border: 'none', borderRadius: '20px', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {userReviewId ? "Mettre à jour" : "Envoyer l'avis"}
          </button>
          {message && <p className={message.includes("Erreur") ? "error-message" : ""} style={{ marginTop: '1rem' }}>{message}</p>}
        </form>
      </div>
    </div>
  );
}
