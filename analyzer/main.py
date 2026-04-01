import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from services import get_pokemon_data_graphql, calculate_type_matchups, explain_battle_strategy

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
        # 1. Fetch data from PokeAPI via GraphQL
        p1_name, p1_types_info, p1_stats = get_pokemon_data_graphql(player)
        p2_name, p2_types_info, p2_stats = get_pokemon_data_graphql(opponent)
        
        p1_types_list = list(p1_types_info.keys())
        p2_types_list = list(p2_types_info.keys())
        
        # Calculate true damage multipliers
        p1_matchup = calculate_type_matchups(p1_types_info, p2_types_list)
        p2_matchup = calculate_type_matchups(p2_types_info, p1_types_list)
        
        # 2. Get explanation from LangChain without bias
        simulation = explain_battle_strategy(
            p1_name, p1_types_list, p1_stats, p1_matchup,
            p2_name, p2_types_list, p2_stats, p2_matchup
        )
        
        return {
            "player": p1_name,
            "player_types": p1_types_list,
            "opponent": p2_name,
            "opponent_types": p2_types_list,
            "simulation": simulation.dict()
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
