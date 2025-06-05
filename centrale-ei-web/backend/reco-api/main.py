from fastapi import FastAPI, HTTPException
import httpx
from typing import List
from collections import defaultdict
import numpy as np

app = FastAPI()

# À personnaliser : URL de l'API Node.js
NODE_API_URL = "http://localhost:8000"  # À adapter selon ton infra

# Helper: transforme un film en vecteur binaire (genres, réalisateurs)
def movie_to_vector(movie, all_genres, all_directors):
    vec = []
    # Genre (binaire, gère une liste de genres)
    film_genres = movie.get("genres", [])
    if isinstance(film_genres, str):
        # Si c'est une chaîne, on la convertit en liste (séparateur virgule)
        film_genres = [g.strip() for g in film_genres.split(",") if g.strip()]
    for g in all_genres:
        vec.append(1 if g in film_genres else 0)
    # Réalisateur (binaire)
    for d in all_directors:
        vec.append(1 if movie.get("director") == d else 0)
    return np.array(vec)

def cosine_similarity(a, b):
    if np.linalg.norm(a) == 0 or np.linalg.norm(b) == 0:
        return 0.0
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))

@app.get("/recommendations/{user_id}")
async def get_recommendations(user_id: int) -> List[dict]:
    async with httpx.AsyncClient() as client:
        # 1. Récupérer toutes les reviews de l'utilisateur
        reviews_resp = await client.get(f"{NODE_API_URL}/reviews/user/{user_id}")
        if reviews_resp.status_code != 200:
            raise HTTPException(status_code=502, detail="Erreur API reviews")
        reviews = reviews_resp.json()

        # 2. Filtrer les films bien notés (note >= 4)
        liked_movie_ids = [r["movieId"] for r in reviews if r["rating"] >= 4]
        if not liked_movie_ids:
            return []

        # 3. Récupérer tous les films
        all_movies_resp = await client.get(f"{NODE_API_URL}/movies")
        if all_movies_resp.status_code != 200:
            raise HTTPException(status_code=502, detail="Erreur API movies")
        all_movies = all_movies_resp.json()
        # Correction : s'assurer que all_movies est une liste de dicts
        if isinstance(all_movies, dict) and 'movies' in all_movies:
            all_movies = all_movies['movies']
        # 4. Construire la liste des genres et réalisateurs uniques (aplatir les genres)
        all_genres = sorted(set(
            g
            for m in all_movies if m.get("genres")
            for g in (m["genres"] if isinstance(m["genres"], list) else [m["genres"]])
        ))
        all_directors = sorted(set(m.get("director") for m in all_movies if m.get("director")))

        # 5. Construire les vecteurs des films aimés
        liked_movies = [m for m in all_movies if m["id"] in liked_movie_ids]
        liked_vectors = [movie_to_vector(m, all_genres, all_directors) for m in liked_movies]

        # 6. Pour chaque film non noté, calculer la somme des produits scalaires avec les films aimés
        scores = defaultdict(float)
        for m in all_movies:
            if m["id"] in liked_movie_ids:
                continue  # On ne recommande pas les films déjà notés
            v = movie_to_vector(m, all_genres, all_directors)
            # Score = somme des produits scalaires avec chaque film aimé
            score = sum(cosine_similarity(v, lv) for lv in liked_vectors)
            if score > 0:
                scores[m["id"]] = score

        # 7. Trier les films par score décroissant
        recommended = [m for m in all_movies if m["id"] in scores]
        recommended.sort(key=lambda m: scores[m["id"]], reverse=True)
        # Correction : retourner la liste complète, pas seulement le premier film
        return recommended
