# API de recommandation de films (FastAPI)

Cette API propose des recommandations de films pour un utilisateur donné, en se basant sur les films qu'il a bien notés (note >= 4) et en utilisant les genres ou réalisateurs similaires. L'API interroge une API Node.js existante pour récupérer les données nécessaires.

## Fonctionnalités principales
- Route `/recommendations/{user_id}` : retourne une liste de films recommandés pour l'utilisateur.
- Appels HTTP à l'API Node.js pour récupérer les reviews et les détails des films.
- Squelette d'algorithme de recommandation basé sur le genre et le réalisateur.

## Démarrage rapide
1. Installez les dépendances :
   ```sh
   pip install -r requirements.txt
   ```
2. Lancez le serveur :
   ```sh
   uvicorn main:app --reload
   ```

## À compléter
- Ajouter l'URL de l'API Node.js dans le code Python.
- Adapter l'algorithme de recommandation selon vos besoins.
