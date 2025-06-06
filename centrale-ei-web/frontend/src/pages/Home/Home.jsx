import './Home.css'
import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import { useFetchMovies } from './useFetchMovies'
import Movie from '../../components/Movie'
import { Link } from 'react-router-dom'
import rateflixLogo from './Rateflix.png';


function Home({ user }) {
  const [movieName, setMovieName] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [genreFilter, setGenreFilter] = useState('')
  const [sortOption, setSortOption] = useState('')
  const { movies, moviesLoadingError } = useFetchMovies(currentPage, movieName.trim())

  const [ubRecs, setUbRecs] = useState([])
  const [ubLoading, setUbLoading] = useState(true)
  const [ubError, setUbError] = useState('')

  const [cbRecs, setCbRecs] = useState([])
  const [cbLoading, setCbLoading] = useState(true)
  const [cbError, setCbError] = useState('')

  useEffect(() => {
    if (!user) {
      setUbRecs([])
      setUbLoading(false)
      setUbError('')
      setCbRecs([])
      setCbLoading(false)
      setCbError('')
      return
    }

    setUbLoading(true)
    setUbError('')
    axios
      .get(`http://localhost:8001/recommendations/${user.id}/user-based?top_n=5`)
      .then((res) => {
        const ids = res.data.map((r) => r.movie_id)
        if (ids.length === 0) {
          setUbRecs([])
          setUbLoading(false)
          return null
        }
        return Promise.all(ids.map((id) => axios.get(`http://localhost:8000/movies/${id}`)))
      })
      .then((arr) => {
        if (!arr) return
        setUbRecs(arr.map((r) => r.data))
        setUbLoading(false)
      })
      .catch(() => {
        setUbError('Vous n\'avez pas encore de recommandations personnalisées.')
        setUbLoading(false)
      })

    setCbLoading(true)
    setCbError('')
    axios
      .get(`http://localhost:8001/recommendations/${user.id}/content-based?top_n=5`)
      .then((res) => {
        const ids = res.data.map((r) => r.movie_id)
        if (ids.length === 0) {
          setCbRecs([])
          setCbLoading(false)
          return null
        }
        return Promise.all(ids.map((id) => axios.get(`http://localhost:8000/movies/${id}`)))
      })
      .then((arr) => {
        if (!arr) return
        setCbRecs(arr.map((r) => r.data))
        setCbLoading(false)
      })
      .catch(() => {
        setCbError('Impossible de charger les recommandations.')
        setCbLoading(false)
      })
  }, [user])

  const filteredAndSortedMovies = useMemo(() => {
    if (!movies) return []
    let result = movies.filter((m) => {
      if (!genreFilter.trim()) return true
      return (m.genres || '').toLowerCase().includes(genreFilter.trim().toLowerCase())
    })
    if (sortOption === 'popularity') {
      result.sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    } else if (sortOption === 'alpha') {
      result.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
    } else if (sortOption === 'year') {
      result.sort((a, b) => {
        const yearA = parseInt(a.release_date?.split('-')[0]) || 0
        const yearB = parseInt(b.release_date?.split('-')[0]) || 0
        return yearB - yearA
      })
    }
    return result
  }, [movies, genreFilter, sortOption])

  return (
    <div className="App">
      <header className="stream-header">
        <div className="top-bar">
          <img
        src={rateflixLogo}
        alt="RateFlix Logo"
        className="site-logo"
        style={{ height: '100px' }} 
      />
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
              {user && (
        <>
          <section className="recommendations-section" style={{ padding: '2rem' }}>
            <h2>Des utilisateurs aux goûts similaires ont adoré ce contenu</h2>
            {ubLoading && <p>Chargement des recommandations...</p>}
            {ubError && <p className="error-message">{ubError}</p>}
            {!ubLoading && ubRecs.length === 0 && !ubError && (
              <p>Aucune recommandation disponible pour le moment.</p>
            )}
            {!ubLoading && ubRecs.length > 0 && (
              <div className="movie-grid">
                {ubRecs.map((movie) => (
                  <Link key={movie.id} to={`/movies/${movie.id}`}>
                    <Movie movie={movie} />
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="recommendations-section" style={{ padding: '2rem' }}>
            <h2>Selon vos goûts, cette suggestion devrait vous plaire</h2>
            {cbLoading && <p>Chargement des recommandations...</p>}
            {cbError && <p className="error-message">{cbError}</p>}
            {!cbLoading && cbRecs.length === 0 && !cbError && (
              <p>Aucune recommandation disponible pour le moment.</p>
            )}
            {!cbLoading && cbRecs.length > 0 && (
              <div className="movie-grid">
                {cbRecs.map((movie) => (
                  <Link key={movie.id} to={`/movies/${movie.id}`}>
                    <Movie movie={movie} />
                  </Link>
                ))}
              </div>
            )}
          </section>
        </>
      )}


        <div className="search-section">
          <h2>Films populaires</h2>
          <input
            type="text"
            placeholder="Rechercher un film..."
            value={movieName}
            onChange={(e) => {
              setMovieName(e.target.value)
              setCurrentPage(1)
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
              setGenreFilter(e.target.value)
              setCurrentPage(1)
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
              setSortOption(e.target.value)
              setCurrentPage(1)
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
  )
}

export default Home
