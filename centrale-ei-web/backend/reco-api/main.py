from fastapi import FastAPI, HTTPException
import httpx
from typing import List
from collections import defaultdict
import numpy as np

app = FastAPI()

# À personnaliser : URL de l'API Node.js
NODE_API_URL = "http://localhost:8000"  # À adapter selon ton infra

# Helper: transforme un film en vecteur binaire (genres, réalisateurs)
def movie_to_vector(movie, all_genres):
    vec = []
    movies_genres = genre_movie(movie)
    for genre in all_genres:
        if genre in movies_genres:
            vec.append(1)
        else:
            vec.append(0)
    return vec


def genre_movie(movie):
    genres = movie["genres"]
    if isinstance(genres, str):
        import json
        genres = json.loads(genres)
        for g in genres:
            if g not in genres:
                genres.append(g)
    return(genres)            


def all_genretest(movies): 
    all_genres=[]
    for i in range(len(movies)): 
        genres = movies[i]["genres"]
        if isinstance(genres, str):
            import json
            genres = json.loads(genres)
            for g in genres:
                if g not in all_genres:
                    all_genres.append(g)
    return all_genres                
         



def genres_dict_for_movies(movies, all_genres):
    result = []
    for m in movies:
        film_genres = m.get("genres", [])
        if isinstance(film_genres, str):
            film_genres = [g.strip() for g in film_genres.split(",") if g.strip()]
        d = {g: 1 if g in film_genres else 0 for g in all_genres}
        d["id"] = m["id"]  # optionnel : pour retrouver le film
        result.append(d)
    return result

def movie_similarity_score(movie, liked_vectors, all_genres):
            v = movie_to_vector(movie, all_genres)
            return {movie["id"]: int(sum(np.dot(v, lv) for lv in liked_vectors))}
        
        
def ldico_reco(all_movies, reviewed_movies, liked_vectors, all_genres):
    scores = []
    for m in all_movies:
        if movie_similarity_score(m, liked_vectors, all_genres)[m["id"]] != 0:    
            scores.append(movie_similarity_score(m, liked_vectors, all_genres))
    # Trie la liste par score décroissant (valeur du score)
    scores.sort(key=lambda d: list(d.values())[0], reverse=True)
    return scores

def list_reco(scores):
    return [list(d.keys())[0] for d in scores]

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
        
        reviewed_movies = [r["movieId"] for r in reviews] 
        

        # 3. Récupérer tous les films
        all_movies_resp = await client.get(f"{NODE_API_URL}/movies")
        if all_movies_resp.status_code != 200:
            raise HTTPException(status_code=502, detail="Erreur API movies")
        all_movies = all_movies_resp.json()
        # Correction : s'assurer que all_movies est une liste de dicts
        if isinstance(all_movies, dict) and 'movies' in all_movies:
            all_movies = all_movies['movies']
            
        # 4. Construire la liste des genres et réalisateurs uniques (aplatir les genres)
        all_genres = all_genretest(all_movies)
        

        # 5. Construire les vecteurs des films aimés
        liked_movies = [m for m in all_movies if m["id"] in liked_movie_ids]
        liked_vectors = [movie_to_vector(m, all_genres) for m in liked_movies]
       
        # Affiche la liste des genres uniques
        



        # ...après la construction de all_genres...
        all_movies_genres_vectors = genres_dict_for_movies(all_movies, all_genres)


        # 6. Pour chaque film non noté, calculer la somme des produits scalaires avec les films aimés
        print(ldico_reco(all_movies, reviewed_movies, liked_vectors, all_genres))  # Debug: afficher les scores des films recommandés
        print(list_reco(ldico_reco(all_movies, reviewed_movies, liked_vectors, all_genres)))
        list_triee= list_reco(ldico_reco(all_movies, reviewed_movies, liked_vectors, all_genres))
         # Debug: afficher le score du premier film
            
        # scores = defaultdict(float)
        # for m in all_movies:
        #     if m["id"] in liked_movie_ids:
        #         continue  # On ne recommande pas les films déjà notés
        #     v = movie_to_vector(m, all_genres)
        #     # Score = somme des produits scalaires avec chaque film aimé
        #     score = sum(np.dot(v, lv) for lv in liked_vectors)
        #     if score > 0:
        #         scores[m["id"]] = score

        # 7. Trier les films par score décroissant
        print (list_triee)
        movie_dict = {m["id"]: m for m in all_movies}
# Construit la liste recommended dans l'ordre de list_triee
        recommended = [movie_dict[mid] for mid in list_triee if mid in movie_dict]
        print(recommended)
        # Correction : retourner la liste complète, pas seulement le premier film
        return recommended
