import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from services import get_pokemon_data, explain_battle_strategy

load_dotenv()

app = FastAPI(title="Pokemon Battle Analyzer")

# Allow CORS for React Native dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/analyze")
async def analyze_pokemon(player: str, opponent: str):
    if not os.environ.get("OPENAI_API_KEY"):
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY environment variable not set")
        
    try:
        # 1. Fetch data from PokeAPI
        player_name, player_types, player_stats = get_pokemon_data(player)
        opponent_name, opponent_types, opponent_stats = get_pokemon_data(opponent)
        
        # 2. Get explanation from LangChain
        simulation = explain_battle_strategy(player_name, player_types, player_stats, opponent_name, opponent_types, opponent_stats)
        
        return {
            "player": player_name,
            "player_types": player_types,
            "opponent": opponent_name,
            "opponent_types": opponent_types,
            "simulation": simulation.dict()
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
