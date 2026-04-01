import requests
from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
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
    player_starting_hp: str = Field(description="The starting HP of Pokemon A")
    opponent_starting_hp: str = Field(description="The starting HP of Pokemon B")
    winner: str = Field(description="The predicted winner of the battle")
    turns: list[Turn] = Field(description="A sequential list of all turns in the battle until someone faints")

def get_pokemon_data_graphql(pokemon_name: str):
    url = "https://beta.pokeapi.co/graphql/v1beta"
    query = """
    query($name: String!) {
      pokemon_v2_pokemon(where: {name: {_eq: $name}}) {
        name
        pokemon_v2_pokemontypes {
          pokemon_v2_type {
            name
            damage_relations: pokemon_v2_typeefficacies {
              damage_factor
              target_type: pokemonV2TypeByTargetTypeId {
                name
              }
            }
          }
        }
        pokemon_v2_pokemonstats {
          base_stat
          pokemon_v2_stat {
            name
          }
        }
      }
    }
    """
    response = requests.post(url, json={"query": query, "variables": {"name": pokemon_name.lower().strip()}})
    response.raise_for_status()
    data = response.json()
    
    if not data["data"]["pokemon_v2_pokemon"]:
        raise ValueError(f"Pokemon '{pokemon_name}' not found.")
        
    pkmn = data["data"]["pokemon_v2_pokemon"][0]
    
    types_info = {}
    for t in pkmn["pokemon_v2_pokemontypes"]:
        type_name = t["pokemon_v2_type"]["name"]
        relations = {}
        for rel in t["pokemon_v2_type"]["damage_relations"]:
            target_name = rel["target_type"]["name"]
            relations[target_name] = rel["damage_factor"] / 100.0
        types_info[type_name] = relations
        
    stats = {}
    for s in pkmn["pokemon_v2_pokemonstats"]:
        stats[s["pokemon_v2_stat"]["name"]] = s["base_stat"]
        
    return pkmn["name"], types_info, stats

def calculate_type_matchups(attacker_types_info: dict, defender_types_list: list) -> str:
    matchup_strings = []
    for atk_type, relations in attacker_types_info.items():
        multiplier = 1.0
        for def_type in defender_types_list:
            multiplier *= relations.get(def_type, 1.0)
        matchup_strings.append(f"{atk_type}-type attacks deal {multiplier}x damage to the opponent.")
    return " ".join(matchup_strings)

def explain_battle_strategy(p1_name: str, p1_types: list[str], p1_stats: dict, p1_matchup: str, 
                            p2_name: str, p2_types: list[str], p2_stats: dict, p2_matchup: str):
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
    structured_llm = llm.with_structured_output(BattleSimulation)
    
    prompt = PromptTemplate.from_template(
        "You are an expert Pokemon battle analyzer. "
        "Pokemon A is {p1_name} (Type: {p1_types}, Stats: {p1_stats}). "
        "Pokemon A's Damage Capabilities: {p1_matchup}\n\n"
        "Pokemon B is {p2_name} (Type: {p2_types}, Stats: {p2_stats}). "
        "Pokemon B's Damage Capabilities: {p2_matchup}\n\n"
        "Simulate an exciting turn-by-turn battle where both Pokémon fight optimally. "
        "Detail each move using real Pokémon move names, calculate reasonable damage based on stats and typing, and narrate the battle until one faints (usually 3-5 turns). "
        "Important rules:\n"
        "- Do not artificially favor Pokemon A or Pokemon B. Determine the winner strictly objectively based on the stats and the given matchup facts.\n"
        "- Speed stats determine who attacks first each turn.\n"
        "- Never use 'N/A' for any fields or move names.\n"
        "- Health remaining should start around the Pokemon's hp stat and decrease realistically. It must never drop below 0. If fainted, use '0 HP'."
    )
    
    chain = prompt | structured_llm
    
    return chain.invoke({
        "p1_name": p1_name.capitalize(),
        "p1_types": ", ".join(p1_types),
        "p1_stats": str(p1_stats),
        "p1_matchup": p1_matchup,
        "p2_name": p2_name.capitalize(),
        "p2_types": ", ".join(p2_types),
        "p2_stats": str(p2_stats),
        "p2_matchup": p2_matchup
    })
