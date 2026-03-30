import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";

export default function Battle() {
    const { name, allPokemons, opponentName } = useLocalSearchParams();
    const [explanation, setExplanation] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (!opponentName) return;

        // We use the IP address from the .env file (needs EXPO_PUBLIC_ prefix to be visible in the app)
        const ipAddress = process.env.EXPO_PUBLIC_IP_ADDRESS || "127.0.0.1";
        const apiUrl = `http://${ipAddress}:8000/analyze?pokemon=${opponentName}`;

        fetch(apiUrl)
            .then(res => res.json())
            .then(data => {
                if (data.explanation) {
                    setExplanation(data.explanation);
                } else if (data.detail) {
                    setExplanation(`Error: ${data.detail}`);
                }
            })
            .catch(err => {
                console.error(err);
                setExplanation("Failed to fetch analysis. Make sure the Python API is running and the URL is correct (use your computer's network IP if on a real device).");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [opponentName]);

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>{name} vs {opponentName}</Text>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>🥊 AI Strategy Analysis</Text>
                {loading ? (
                    <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 20 }} />
                ) : (
                    <Text style={styles.explanationText}>{explanation}</Text>
                )}
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        textTransform: 'capitalize',
    },
    card: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
    },
    explanationText: {
        fontSize: 16,
        lineHeight: 24,
        color: '#444',
    }
});