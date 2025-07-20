from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer, util

model = SentenceTransformer('all-MiniLM-L6-v2')
app = FastAPI()

class SimilarityRequest(BaseModel):
    target: str
    guesses: dict  # { player_name: guess_text }

@app.post("/similarity")
def compute_similarity(req: SimilarityRequest):
    target_emb = model.encode(req.target, convert_to_tensor=True)
    results = {}

    for player_id, guess in req.guesses.items():
        guess_emb = model.encode(guess, convert_to_tensor=True)
        sim = util.cos_sim(target_emb, guess_emb).item()
        results[player_id] = {"guess": guess, "similarity": sim}

    winner = max(results.items(), key=lambda x: x[1]['similarity'])[0]

    return {
        "target": req.target,
        "results": results,
        "winner": winner
    }
