import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

export default function Battle() {
    const { name, allPokemons, opponentName } = useLocalSearchParams();

    return (
        <View>
            <Text>{name} vs {opponentName}</Text>
        </View>
    )
}