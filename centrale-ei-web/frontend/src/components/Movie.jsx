import './Movie.css';

function Movie({ movie, styleClass }) {
  const { title, release_date, poster_path } = movie;
  const imageUrl = `https://image.tmdb.org/t/p/w500${poster_path}`;

  return (
    <div className={`movie-card ${styleClass}`}>
      <img src={imageUrl} alt={title} />
      <h3>{title}</h3>
      <p>{release_date}</p>
    </div>
  );
}



export default Movie;

