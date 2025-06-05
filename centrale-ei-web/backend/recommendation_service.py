from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
import pandas as pd
import numpy as np
from sqlalchemy import create_engine, Column, Integer, Float, String, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker

# -------------------------------------------------------------------
# 1) CONFIGURATION DE L'URL SQLITE (chemin absolu vers db.sqlite)
# -------------------------------------------------------------------
# Attention aux espaces dans le chemin : recopiez exactement le path de votre dossier backend.
DATABASE_URL = "sqlite:////Users/nabila/Desktop/TP EI/centrale-ei-web/backend/db.sqlite"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# -------------------------------------------------------------------
# 2) DÉFINITION DES ENTITÉS (pour s'assurer que SQLAlchemy voit bien les tables existantes)
# -------------------------------------------------------------------
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

# -------------------------------------------------------------------
# 3) SCHÉMA DE SORTIE POUR LES RECOMMANDATIONS
# -------------------------------------------------------------------
class Recommendation(BaseModel):
    movie_id: int
    score: float

# -------------------------------------------------------------------
# 4) CLASSE DE RECOMMANDATION (User-Based CF et Item-Based CF)
# -------------------------------------------------------------------
class Recommender:
    def __init__(self, engine):
        self.engine = engine
        self.ratings_df = None
        self.movie_ids = []
        self.user_ids = []

    def load_data(self):
        query = "SELECT userId, movieId, rating FROM reviews"
        self.ratings_df = pd.read_sql(query, self.engine)
        self.movie_ids = self.ratings_df["movieId"].unique().tolist()
        self.user_ids = self.ratings_df["userId"].unique().tolist()

    def user_based_recommendations(self, user_id: int, top_n: int = 10) -> List[Recommendation]:
        if self.ratings_df is None:
            self.load_data()

        # matrice user×movie (notes)
        user_movie_matrix = self.ratings_df.pivot_table(
            index="userId", columns="movieId", values="rating"
        )

        if user_id not in user_movie_matrix.index:
            raise HTTPException(status_code=404, detail="User not found in ratings.")

        target_ratings = user_movie_matrix.loc[user_id]
        user_similarities = (
            user_movie_matrix.corrwith(target_ratings, axis=1, method="pearson")
            .dropna()
        )
        user_similarities = user_similarities[user_similarities.index != user_id].sort_values(ascending=False)

        sim_users = user_similarities.index.tolist()
        sim_scores = user_similarities.values

        unseen_movies = target_ratings[target_ratings.isna()].index.tolist()
        movie_scores: Dict[int, float] = {}

        for movie in unseen_movies:
            movie_ratings = user_movie_matrix.loc[sim_users, movie]
            rated_mask = ~movie_ratings.isna()
            if rated_mask.sum() == 0:
                continue
            weights = sim_scores[rated_mask.values]
            ratings = movie_ratings[rated_mask].values
            score = np.dot(weights, ratings) / np.sum(np.abs(weights))
            movie_scores[movie] = score

        sorted_movies = sorted(movie_scores.items(), key=lambda x: x[1], reverse=True)[:top_n]
        return [Recommendation(movie_id=mid, score=float(score)) for mid, score in sorted_movies]

    def item_based_recommendations(self, user_id: int, top_n: int = 10) -> List[Recommendation]:
        if self.ratings_df is None:
            self.load_data()

        user_movie_matrix = self.ratings_df.pivot_table(
            index="userId", columns="movieId", values="rating"
        )

        if user_id not in user_movie_matrix.index:
            raise HTTPException(status_code=404, detail="User not found in ratings.")

        movie_user_matrix = user_movie_matrix.T
        item_similarity = movie_user_matrix.corr(method="pearson").fillna(0)

        target_ratings = user_movie_matrix.loc[user_id]
        rated_movies = target_ratings[target_ratings.notna()].index.tolist()

        movie_scores: Dict[int, float] = {}

        for movie in self.movie_ids:
            if movie in rated_movies:
                continue

            sim_sum = 0.0
            weighted_sum = 0.0
            for rated_movie in rated_movies:
                sim = item_similarity.loc[movie, rated_movie]
                rating = target_ratings[rated_movie]
                if np.isnan(sim) or sim == 0:
                    continue
                weighted_sum += sim * rating
                sim_sum += abs(sim)
            if sim_sum > 0:
                movie_scores[movie] = weighted_sum / sim_sum

        sorted_movies = sorted(movie_scores.items(), key=lambda x: x[1], reverse=True)[:top_n]
        return [Recommendation(movie_id=mid, score=float(score)) for mid, score in sorted_movies]

# -------------------------------------------------------------------
# 5) INSTANCIATION FASTAPI + CORS
# -------------------------------------------------------------------
app = FastAPI()

# Autoriser le front React (port 3000) à appeler ce service
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # adapter si votre front tourne ailleurs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

recommender = Recommender(engine)

@app.get("/recommendations/{user_id}/user-based", response_model=List[Recommendation])
def recommend_user_based(user_id: int, top_n: int = 10):
    return recommender.user_based_recommendations(user_id, top_n)

@app.get("/recommendations/{user_id}/item-based", response_model=List[Recommendation])
def recommend_item_based(user_id: int, top_n: int = 10):
    return recommender.item_based_recommendations(user_id, top_n)
