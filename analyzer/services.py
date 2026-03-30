import requests
from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser

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
    return data["name"], types

def explain_type_weakness(pokemon_name: str, types: list[str]) -> str:
    """Uses LangChain and OpenAI to explain type weaknesses."""
    
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
    
    prompt = PromptTemplate.from_template(
        "You are an expert Pokemon battle analyzer. "
        "The Pokemon {pokemon_name} has the following type(s): {types}. "
        "Briefly explain its type weaknesses and resistances in 2-3 sentences. "
        "Recommend one optimal strategy against it."
    )
    
    chain = prompt | llm | StrOutputParser()
    
    types_str = ", ".join(types)
    return chain.invoke({
        "pokemon_name": pokemon_name.capitalize(),
        "types": types_str
    })
