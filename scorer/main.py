from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer, util

model = SentenceTransformer('all-MiniLM-L6-v2')
app = FastAPI()

class SimilarityRequest(BaseModel):
    target: str
    guesses: dict[str, list[str]]  # Each player has a list of guesses


@app.post("/similarity")
def compute_similarity(req: SimilarityRequest):
    target_emb = model.encode(req.target, convert_to_tensor=True)
    results = {}

    for player_id, guess_list in req.guesses.items():
        player_results = []
        for guess in guess_list:
            guess_emb = model.encode(guess, convert_to_tensor=True)
            sim = util.cos_sim(target_emb, guess_emb).item()
            player_results.append({
                "guess": guess,
                "similarity": sim
            })
        results[player_id] = player_results

    # Determine winner based on **highest similarity across all guesses**
    best_player = None
    best_similarity = -1

    for player_id, guesses in results.items():
        player_best = max(guesses, key=lambda g: g["similarity"])
        if player_best["similarity"] > best_similarity:
            best_similarity = player_best["similarity"]
            best_player = player_id

    return {
        "target": req.target,
        "results": results,  # All guesses with scores
        "winner": best_player
    }
