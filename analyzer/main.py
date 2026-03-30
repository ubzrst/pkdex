import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from services import get_pokemon_data, explain_type_weakness

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
async def analyze_pokemon(pokemon: str):
    if not os.environ.get("OPENAI_API_KEY"):
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY environment variable not set")
        
    try:
        # 1. Fetch data from PokeAPI
        pokemon_name, types = get_pokemon_data(pokemon)
        
        # 2. Get explanation from LangChain
        explanation = explain_type_weakness(pokemon_name, types)
        
        return {
            "pokemon": pokemon_name,
            "types": types,
            "explanation": explanation
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
