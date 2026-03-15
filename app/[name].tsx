import { Picker } from '@react-native-picker/picker';
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Pokemon, colorsByType } from "./index";

// interface Pokemon {
//     name: string;
//     abilities: PokemonAbility[];
//     image: string;
//     imageBack: string;
//     stats: PokemonStat[];
// }

export default function Details() {
    const [pokemon, setPokemon] = useState<Pokemon>({
        name: "",
        image: "",
        imageBack: "",
        abilities: [],
        stats: [],
        types: []
    });
    const [opponentName, setOpponentName] = useState<string>("bulbasaur");
    const { name, allPokemons } = useLocalSearchParams();
    const router = useRouter();

    const pokemonList = allPokemons ? JSON.parse(allPokemons as string) : [];

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
                types: data.types
            };
            setPokemon(pokemonInfo);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <ScrollView contentContainerStyle={{ padding: 16, height: "100%" }}>
            <Stack.Screen options={{
                title: (name as string).charAt(0).toUpperCase() + (name as string).slice(1),
            }} />
            <View style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: pokemon.types.length > 0 ? colorsByType[pokemon.types[0].type.name] + "80" : "#fff",
                borderRadius: 20,
                borderWidth: 1.5,
                borderColor: pokemon.types.length > 0 ? colorsByType[pokemon.types[0].type.name] + "ff" : "#fff",
                marginBottom: 16
            }}>
                <View style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center"
                }}>
                    {pokemon.image && <Image source={{ uri: pokemon.image }} width={200} height={200}></Image>}
                    {pokemon.imageBack && <Image source={{ uri: pokemon.imageBack }} width={200} height={200}></Image>}
                </View>
            </View>
            <View>
                <View style={{ ...styles.infoContainer, backgroundColor: pokemon.types.length > 0 ? colorsByType[pokemon.types[0].type.name] + "80" : "#fff" }}>
                    <Text style={styles.infoHeader}>Type</Text>
                    <Text style={styles.infoBody}>{pokemon.types.map((type) => type.type.name).join(", ")}</Text>
                </View>
                <View style={{ ...styles.infoContainer, backgroundColor: pokemon.types.length > 0 ? colorsByType[pokemon.types[0].type.name] + "80" : "#fff" }}>
                    <Text style={styles.infoHeader}>Abilities</Text>
                    <Text style={styles.infoBody}>{pokemon.abilities.map((ability) => ability.ability.name).join(", ")}</Text>
                </View>
                <View style={{ ...styles.statsContainer, backgroundColor: pokemon.types.length > 0 ? colorsByType[pokemon.types[0].type.name] + "80" : "#fff" }}>
                    <Text style={styles.infoHeader}>Stats</Text>
                    {pokemon.stats.map((stat) => (
                        <View key={stat.stat.name} style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                            <Text style={styles.statName}>{stat.stat.name}</Text>
                            <Text style={styles.statBody}>{stat.base_stat}</Text>
                        </View>
                    ))}
                </View>
            </View>
            <View style={{
                backgroundColor: pokemon.types.length > 0 ? colorsByType[pokemon.types[0].type.name] + "80" : "#fff",
                borderRadius: 20,
                borderWidth: 1.5,
                borderColor: pokemon.types.length > 0 ? colorsByType[pokemon.types[0].type.name] + "ff" : "#fff",
                overflow: 'hidden', // to ensure the picker respects the border radius on iOS
                marginBottom: 32,
            }}>
                <View>
                    <Text style={{ ...styles.infoHeader, padding: 16 }}>Versus</Text>
                </View>
                <Picker
                    selectedValue={opponentName}
                    onValueChange={(itemValue) => {
                        if (itemValue !== opponentName) {
                            setOpponentName(itemValue);
                            // router.replace({
                            //     pathname: "/[name]",
                            //     params: { name: itemValue, allPokemons: allPokemons }
                            // });
                        }
                    }}
                    style={{ color: "#000", marginLeft: 10 }} // Optional text color
                    dropdownIconColor="#000" // Optional icon color for Android
                >
                    {pokemonList.map((pName: string) => (
                        <Picker.Item
                            key={pName}
                            label={pName.charAt(0).toUpperCase() + pName.slice(1)}
                            value={pName}
                        />
                    ))}
                </Picker>
                <View style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 16,
                }}>
                    <Pressable style={styles.fightButton} onPress={() => {
                        router.push({
                            pathname: "/battle",
                            params: { name: name, opponentName: opponentName, allPokemons: allPokemons }
                        });
                    }}>
                        <Text style={styles.fightButtonText}>Fight</Text>
                    </Pressable>
                </View>
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    infoHeader: {
        fontSize: 20,
        fontWeight: "bold",
        textTransform: "capitalize",
    },
    infoBody: {
        fontSize: 16,
        textTransform: "capitalize",
    },
    statName: {
        fontSize: 16,
        textTransform: "capitalize",
        fontWeight: "bold",
        fontStyle: "italic",
    },
    statBody: {
        fontSize: 16,
        textTransform: "capitalize",
    },
    infoContainer: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        gap: 16,
        borderRadius: 20,
        marginBottom: 16
    },
    statsContainer: {
        display: "flex",
        flexDirection: "column",
        gap: 16,
        padding: 16,
        borderRadius: 20,
        marginBottom: 16
    },
    fightButton: {
        backgroundColor: "#ff000090",
        padding: 16,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: "#ff0000",
        width: "100%",
        height: 60,
        justifyContent: "center",
        alignItems: "center",
    },
    fightButtonText: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#fff",
    }
})
