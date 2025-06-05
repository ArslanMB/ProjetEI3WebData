import pandas as pd
import sqlite3
from scipy.stats import pearsonr
import numpy as np

# Connexion à la base de données SQLite
db_path = "/mnt/data/database.sqlite"  # Remplace par le bon chemin si nécessaire
conn = sqlite3.connect(db_path)

# Charger les reviews depuis la base
reviews_df = pd.read_sql_query("SELECT userId, movieId, rating FROM reviews", conn)

# Construction de la matrice utilisateur-film
ratings_matrix = reviews_df.pivot(index='userId', columns='movieId', values='rating')

def recommend_movies(user_id, ratings_matrix, top_n=5):
    if user_id not in ratings_matrix.index:
        return []

    target_ratings = ratings_matrix.loc[user_id]
    similarities = {}

    for other_user in ratings_matrix.index:
        if other_user == user_id:
            continue
        other_ratings = ratings_matrix.loc[other_user]

        common = target_ratings.notna() & other_ratings.notna()
        if common.sum() >= 2:
            sim, _ = pearsonr(target_ratings[common], other_ratings[common])
            if not np.isnan(sim):
                similarities[other_user] = sim

    # Trier les utilisateurs similaires
    similar_users = sorted(similarities.items(), key=lambda x: x[1], reverse=True)

    # Calcul des scores de pertinence pour les films non encore vus
    scores = {}
    for movie_id in ratings_matrix.columns:
        if pd.notna(ratings_matrix.loc[user_id, movie_id]):
            continue

        num, den = 0.0, 0.0
        for other_user, sim in similar_users:
            rating = ratings_matrix.loc[other_user, movie_id]
            if pd.notna(rating):
                num += sim * rating
                den += abs(sim)

        if den > 0:
            scores[movie_id] = num / den

    recommended = sorted(scores.items(), key=lambda x: x[1], reverse=True)[:top_n]
    return recommended

# Exemple : recommander des films à l'utilisateur 1
recommendations = recommend_movies(user_id=1, ratings_matrix=ratings_matrix, top_n=5)
import ace_tools as tools; tools.display_dataframe_to_user(name="Recommandations pour l'utilisateur 1", dataframe=pd.DataFrame(recommendations, columns=["movieId", "predicted_rating"]))
