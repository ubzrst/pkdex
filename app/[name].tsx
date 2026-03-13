import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, View } from "react-native";

interface Pokemon {
    name: string;
    abilities: PokemonAbility[];
    image: string;
    imageBack: string;
    stats: PokemonStat[];
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

export default function Details() {
    const [pokemon, setPokemon] = useState<Pokemon>({
        name: "",
        abilities: [],
        image: "",
        imageBack: "",
        stats: [],
    });
    const { name } = useLocalSearchParams();
    console.log(name);

    useEffect(() => {
        fetchPokemonByName(name as string);
    }, []);

    async function fetchPokemonByName(name: string) {
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
            const data = await response.json();
            const pokemonInfo = {
                name: data.name,
                image: data.sprites.front_default,
                imageBack: data.sprites.back_default,
                abilities: data.abilities,
                stats: data.stats,
            };
            setPokemon(pokemonInfo);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <ScrollView contentContainerStyle={{ backgroundColor: "#fec", padding: 16 }}>
            <Stack.Screen options={{
                title: (name as string).charAt(0).toUpperCase() + (name as string).slice(1),
                headerTitleStyle: {
                    fontWeight: "bold",
                }
            }} />
            <View style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <Image source={{ uri: pokemon?.image }} width={300} height={300}></Image>
            </View>
            <ScrollView></ScrollView>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
})
