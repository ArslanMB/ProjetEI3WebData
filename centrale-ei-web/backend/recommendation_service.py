from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
import pandas as pd
import numpy as np
from sqlalchemy import create_engine, Column, Integer, Float, String, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = "sqlite:////Users/nabila/Desktop/TP EI/centrale-ei-web/backend/db.sqlite"
  # Chemin vers la base de données SQLite

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Review(Base):
    __tablename__ = "reviews"
    id = Column(Integer, primary_key=True, index=True)
    rating = Column(Integer)
    comment = Column(String)
    userId = Column(Integer, ForeignKey("user.id"))
    movieId = Column(Integer, ForeignKey("movies.id"))

class User(Base):
    __tablename__ = "user"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True)

class Movie(Base):
    __tablename__ = "movies"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    release_date = Column(String)
    poster_path = Column(String)
    overview = Column(String)
    runtime = Column(Integer)
    popularity = Column(Float)
    genres = Column(String)

class Recommendation(BaseModel):
    movie_id: int
    score: float

class Recommender:
    def __init__(self, engine):
        self.engine = engine
        self.ratings_df: pd.DataFrame = None
        self.movie_ids: List[int] = []
        self.user_ids: List[int] = []
        self.user_movie_matrix: pd.DataFrame = None
        self.movies_df: pd.DataFrame = None
        self.content_matrix: pd.DataFrame = None
        self.genre_list: List[str] = []

    def load_ratings(self):
        query = "SELECT userId, movieId, rating FROM reviews"
        self.ratings_df = pd.read_sql(query, self.engine)
        self.movie_ids = self.ratings_df["movieId"].unique().tolist()
        self.user_ids = self.ratings_df["userId"].unique().tolist()
        self.user_movie_matrix = self.ratings_df.pivot_table(
            index="userId", columns="movieId", values="rating"
        )

    def load_content(self):
        query = "SELECT id, genres, popularity FROM movies"
        self.movies_df = pd.read_sql(query, self.engine)
        all_genres = set()
        for g_str in self.movies_df["genres"].fillna(""):
            for genre in g_str.split(","):
                genre = genre.strip()
                if genre:
                    all_genres.add(genre)
        self.genre_list = sorted(all_genres)

        def make_genre_vector(g_str: str) -> List[int]:
            vect = [0] * len(self.genre_list)
            for genre in g_str.split(","):
                genre = genre.strip()
                if genre in self.genre_list:
                    idx = self.genre_list.index(genre)
                    vect[idx] = 1
            return vect

        genre_vectors = []
        for _, row in self.movies_df.iterrows():
            vect = make_genre_vector(row["genres"] or "")
            genre_vectors.append(vect)

        self.content_matrix = pd.DataFrame(
            data=np.array(genre_vectors),
            index=self.movies_df["id"].values,
            columns=self.genre_list,
        )

    def get_popular_unseen(self, user_id: int, exclude_ids: set, top_n: int) -> List[Recommendation]:
        popular_df = pd.read_sql("SELECT id, popularity FROM movies ORDER BY popularity DESC", self.engine)
        recommendations = []
        count = 0
        for _, row in popular_df.iterrows():
            mid = int(row["id"])
            if mid in exclude_ids:
                continue
            recommendations.append(Recommendation(movie_id=mid, score=float(row["popularity"] or 0.0)))
            count += 1
            if count >= top_n:
                break
        return recommendations

    def user_based_recommendations(self, user_id: int, top_n: int = 5) -> List[Recommendation]:
        self.load_ratings()
        if user_id not in self.user_movie_matrix.index:
            raise HTTPException(status_code=404, detail="User not found in ratings.")
        target_ratings = self.user_movie_matrix.loc[user_id]
        rated_movies = set(target_ratings[target_ratings.notna()].index.tolist())
        raw_sims = self.user_movie_matrix.corrwith(target_ratings, axis=1, method="pearson")
        user_similarities = raw_sims.dropna()
        user_similarities = user_similarities[user_similarities.index != user_id]
        if user_similarities.empty:
            return self.get_popular_unseen(user_id, rated_movies, top_n)
        user_similarities = user_similarities.sort_values(ascending=False)
        sim_users = user_similarities.index.tolist()
        sim_scores = user_similarities.values
        unseen_movies = [m for m in self.movie_ids if m not in rated_movies]
        movie_scores: Dict[int, float] = {}
        for movie in unseen_movies:
            movie_ratings = self.user_movie_matrix.loc[sim_users, movie]
            rated_mask = ~movie_ratings.isna()
            if rated_mask.sum() == 0:
                continue
            weights = sim_scores[rated_mask.values]
            ratings = movie_ratings[rated_mask].values
            denom = np.sum(np.abs(weights))
            if denom == 0:
                continue
            score = np.dot(weights, ratings) / denom
            if not np.isnan(score):
                movie_scores[movie] = float(score)
        sorted_pairs = sorted(movie_scores.items(), key=lambda x: x[1], reverse=True)
        recommendations: List[Recommendation] = []
        for mid, sc in sorted_pairs[:top_n]:
            recommendations.append(Recommendation(movie_id=mid, score=sc))
        if len(recommendations) < top_n:
            needed = top_n - len(recommendations)
            exclude = rated_movies.union({r.movie_id for r in recommendations})
            fallback = self.get_popular_unseen(user_id, exclude, needed)
            recommendations.extend(fallback)
        return recommendations[:top_n]

    def content_based_recommendations(self, user_id: int, top_n: int = 5) -> List[Recommendation]:
        self.load_ratings()
        self.load_content()
        if user_id not in self.user_movie_matrix.index:
            raise HTTPException(status_code=404, detail="User not found in ratings.")
        target_ratings = self.user_movie_matrix.loc[user_id]
        rated_movies = set(target_ratings[target_ratings.notna()].index.tolist())
        if not rated_movies:
            return self.get_popular_unseen(user_id, rated_movies, top_n)

        # Comptabiliser la fréquence des genres pour les films notés
        genre_counts: Dict[str, int] = {}
        for mid in rated_movies:
            genres_str_array = self.movies_df.loc[self.movies_df["id"] == mid, "genres"].values
            if len(genres_str_array) == 0:
                continue
            for g in genres_str_array[0].split(","):
                g = g.strip()
                if g:
                    genre_counts[g] = genre_counts.get(g, 0) + 1

        if not genre_counts:
            return self.get_popular_unseen(user_id, rated_movies, top_n)

        # Déterminer le(s) genre(s) le(s) plus fréquent(s)
        max_count = max(genre_counts.values())
        top_genres = {g for g, cnt in genre_counts.items() if cnt == max_count}

        # Sélectionner tous les films non notés dont les genres contiennent au moins un genus principal
        candidates = []
        for _, row in self.movies_df.iterrows():
            mid = int(row["id"])
            if mid in rated_movies:
                continue
            genres_str = row["genres"] or ""
            movie_genres = {g.strip() for g in genres_str.split(",") if g.strip()}
            # Calculez le nombre de genres correspondants avec top_genres
            common_genre_count = len(movie_genres.intersection(top_genres))
            if common_genre_count > 0:
                candidates.append((mid, common_genre_count, float(row["popularity"] or 0.0)))

        if not candidates:
            return self.get_popular_unseen(user_id, rated_movies, top_n)

        # Trier d'abord par nombre de genres correspondants (décroissant),
        # puis par popularité (décroissant) pour les égalités
        candidates_sorted = sorted(
            candidates,
            key=lambda x: (x[1], x[2]),
            reverse=True
        )

        recommendations: List[Recommendation] = []
        for mid, genre_count, pop in candidates_sorted[:top_n]:
            # Le score primaire est le nombre de genres correspondants, on peut combiner avec la popularité si voulu
            score = float(genre_count)  # on garde ici count en score, car priorité au genre
            recommendations.append(Recommendation(movie_id=mid, score=score))

        if len(recommendations) < top_n:
            needed = top_n - len(recommendations)
            exclude = rated_movies.union({r.movie_id for r in recommendations})
            fallback = self.get_popular_unseen(user_id, exclude, needed)
            recommendations.extend(fallback)

        return recommendations[:top_n]

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
recommender = Recommender(engine)

@app.get("/recommendations/{user_id}/user-based", response_model=List[Recommendation])
def recommend_user_based(user_id: int, top_n: int = 5):
    return recommender.user_based_recommendations(user_id, top_n)

# @app.get("/recommendations/{user_id}/content-based", response_model=List[Recommendation])
# def recommend_content_based(user_id: int, top_n: int = 5):
#     return recommender.content_based_recommendations(user_id, top_n)




