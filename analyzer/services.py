import requests
from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from pydantic import BaseModel, Field

class Turn(BaseModel):
    turn_number: int = Field(description="The number of the turn, starting from 1")
    attacker: str = Field(description="Name of the attacking Pokemon")
    defender: str = Field(description="Name of the defending Pokemon")
    move_used: str = Field(description="A realistic valid Pokemon move used by the attacker. Never use 'N/A'.")
    damage_dealt: str = Field(description="Estimated damage dealt (e.g., '25 HP', 'Super Effective! 50 HP')")
    narrative_description: str = Field(description="An exciting, detailed narrative of what happened in the turn")
    health_remaining: str = Field(description="The remaining health of the defender after the attack. Must be a positive number or '0 HP' if fainted. Never negative or 'N/A'.")

class BattleSimulation(BaseModel):
    pre_battle_analysis: str = Field(description="An analysis of the matchup before the battle starts, explaining type advantages/disadvantages and who has the upper hand considering stats.")
    player_starting_hp: str = Field(description="The starting HP of the player's Pokemon")
    opponent_starting_hp: str = Field(description="The starting HP of the opponent's Pokemon")
    winner: str = Field(description="The predicted winner of the battle")
    turns: list[Turn] = Field(description="A sequential list of all turns in the battle until someone faints")

def get_pokemon_data(pokemon_name: str):
    """Fetches Pokemon types from PokeAPI."""
    name = pokemon_name.lower().strip()
    url = f"https://pokeapi.co/api/v2/pokemon/{name}"
    
    response = requests.get(url)
    if response.status_code == 404:
        raise ValueError(f"Pokemon '{pokemon_name}' not found in PokeAPI.")
    response.raise_for_status()
    
    data = response.json()
    types = [t["type"]["name"] for t in data["types"]]
    stats = {s["stat"]["name"]: s["base_stat"] for s in data["stats"]}
    return data["name"], types, stats

def explain_battle_strategy(player_name: str, player_types: list[str], player_stats: dict, opponent_name: str, opponent_types: list[str], opponent_stats: dict):
    """Uses LangChain and OpenAI to explain type weaknesses and optimal strategy."""
    
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
    structured_llm = llm.with_structured_output(BattleSimulation)
    
    prompt = PromptTemplate.from_template(
        "You are an expert Pokemon battle analyzer. "
        "The player is using {player_name} (Type: {player_types}, Stats: {player_stats}). "
        "The opponent represents {opponent_name} (Type: {opponent_types}, Stats: {opponent_stats}). "
        "Simulate an exciting turn-by-turn battle where both Pokémon fight optimally. "
        "Detail each move using real Pokémon move names, calculate reasonable damage based on stats and typing, and narrate the battle until one faints (usually 3-5 turns). "
        "Important rules:\n"
        "- Never use 'N/A' for any fields or move names.\n"
        "- Health remaining should start around the Pokemon's hp stat and decrease realistically. It must never drop below 0. If fainted, use '0 HP'."
    )
    
    chain = prompt | structured_llm
    
    return chain.invoke({
        "player_name": player_name.capitalize(),
        "player_types": ", ".join(player_types),
        "player_stats": str(player_stats),
        "opponent_name": opponent_name.capitalize(),
        "opponent_types": ", ".join(opponent_types),
        "opponent_stats": str(opponent_stats)
    })
