import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export interface Pokemon {
    name: string;
    image: string;
    imageBack: string;
    types: PokemonType[];
    stats: PokemonStat[];
    abilities: PokemonAbility[];
}

interface PokemonType {
    type: {
        name: string;
        url: string;
    }
}

interface PokemonAbility {
    ability: {
        name: string;
        url: string;
    }
}

interface PokemonStat {
    base_stat: number;
    stat: {
        name: string;
        url: string;
    }
}

export const colorsByType: Record<string, string> = {
    grass: "#c4e792",
    fire: "#fca675",
    water: "#9bd1e8",
    bug: "#a7b723",
    normal: "#a4acaf",
    poison: "#b97fc9",
    electric: "#f7cf29",
    ground: "#d8c064",
    fairy: "#fdb9e9",
    fighting: "#c22626",
    psychic: "#f366b9",
    rock: "#a99820",
    ghost: "#735797",
    ice: "#98d8d8",
    dragon: "#7038f8",
    dark: "#524038",
    steel: "#b7b7ce",
    flying: "#a898f0",
}

export default function Index() {
    const [pokemons, setPokemons] = useState<Pokemon[]>([]);

    useEffect(() => {
        fetchPokemons();
    }, []);

    async function fetchPokemons() {
        try {
            const limit = 10;
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}`);
            const data = await response.json();
            const detailedPokemons = await Promise.all(data.results.map((async (pokemon: any) => {
                const res = await fetch(pokemon.url);
                const details = await res.json();
                return {
                    name: details.name,
                    image: details.sprites.front_default,
                    imageBack: details.sprites.back_default,
                    types: details.types
                }
            })));
            console.log(detailedPokemons);
            setPokemons(detailedPokemons);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <ScrollView contentContainerStyle={{
            // backgroundColor: "#fec",
            flexDirection: "row",
            flexWrap: "wrap",
            padding: 16,
            gap: 16,
        }}>
            {pokemons.map((pokemon) => (
                <Link key={pokemon.name} href={{ pathname: "/[name]", params: { name: pokemon.name, allPokemons: JSON.stringify(pokemons.map(p => p.name)) } }} asChild>
                    <Pressable style={{
                        backgroundColor: colorsByType[pokemon.types[0].type.name] + "80",
                        padding: 10,
                        borderRadius: 15,
                        borderWidth: 1.5,
                        borderColor: colorsByType[pokemon.types[0].type.name] + "ff",
                        width: "48%",
                        alignItems: "center",
                        justifyContent: "center",
                    }}>
                        <View style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                            <Image source={{ uri: pokemon.image }} style={{ width: 150, height: 150 }} />
                        </View>
                        <View>
                            <Text style={styles.name}>{pokemon.name}</Text>
                            <Text style={styles.type}>{pokemon.types[0].type.name}</Text>
                        </View>
                    </Pressable>
                </Link>
            ))}
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    name: {
        fontSize: 24,
        fontWeight: "bold",
        textTransform: "capitalize",
        // fontFamily: "PokemonGb"
    },
    type: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#555555",
        textTransform: "capitalize",
        textAlign: "center",
    }
})