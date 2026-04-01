import { useLocalSearchParams } from "expo-router";
import { useEffect, useState, useRef } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View, Animated } from "react-native";

interface Turn {
    turn_number: number;
    attacker: string;
    defender: string;
    move_used: string;
    damage_dealt: string;
    narrative_description: string;
    health_remaining: string;
}

interface BattleSimulation {
    pre_battle_analysis: string;
    player_starting_hp: string;
    opponent_starting_hp: string;
    winner: string;
    turns: Turn[];
}

const TurnCard = ({ turn, index, isPlayerTurn }: { turn: Turn, index: number, isPlayerTurn: boolean }) => {
    const slideAnim = useRef(new Animated.Value(50)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                delay: index * 600,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 500,
                delay: index * 600,
                useNativeDriver: true,
            })
        ]).start();
    }, [index]);

    const cardStyle = [
        styles.turnCard,
        isPlayerTurn ? styles.playerTurnCard : styles.opponentTurnCard
    ];

    return (
        <Animated.View style={[cardStyle, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.turnHeader}>
                <Text style={styles.turnNumber}>Turn {turn.turn_number}</Text>
                <Text style={styles.attackText}>⚔️ {turn.attacker} uses {turn.move_used}!</Text>
            </View>
            <Text style={styles.narrative}>{turn.narrative_description}</Text>
            <View style={styles.resultsBadge}>
                <Text style={styles.damageText}>💥 Damage: {turn.damage_dealt}</Text>
                <Text style={styles.healthText}>❤️ {turn.defender} HP: {turn.health_remaining}</Text>
            </View>
        </Animated.View>
    );
};

export default function Battle() {
    const { name, opponentName } = useLocalSearchParams();
    const [simulation, setSimulation] = useState<BattleSimulation | null>(null);
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (!opponentName) return;

        const ipAddress = process.env.EXPO_PUBLIC_IP_ADDRESS || "127.0.0.1";
        const apiUrl = `http://${ipAddress}:8000/analyze?player=${name}&opponent=${opponentName}`;

        fetch(apiUrl)
            .then(res => res.json())
            .then(data => {
                if (data.simulation) {
                    setSimulation(data.simulation);
                } else if (data.detail) {
                    setError(`Error: ${data.detail}`);
                }
            })
            .catch(err => {
                console.error(err);
                setError("Failed to fetch analysis.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [name, opponentName]);

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>{name} <Text style={{color: '#888'}}>vs</Text> {opponentName}</Text>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#e3350d" />
                    <Text style={styles.loadingText}>Simulating Battle...</Text>
                </View>
            ) : error ? (
                <View style={styles.card}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            ) : simulation ? (
                <View style={styles.simulationContainer}>
                    <View style={styles.winnerCard}>
                        <Text style={styles.winnerText}>🏆 Predicted Winner: {simulation.winner}</Text>
                    </View>

                    <View style={styles.analysisCard}>
                        <Text style={styles.analysisTitle}>📊 Pre-Battle Analysis</Text>
                        <Text style={styles.analysisText}>{simulation.pre_battle_analysis}</Text>
                        
                        <View style={styles.hpContainer}>
                            <View style={styles.hpBox}>
                                <Text style={styles.hpLabel}>{name}</Text>
                                <Text style={styles.hpValue}>❤️ {simulation.player_starting_hp}</Text>
                            </View>
                            <Text style={styles.vsText}>VS</Text>
                            <View style={styles.hpBox}>
                                <Text style={styles.hpLabel}>{opponentName}</Text>
                                <Text style={styles.hpValue}>❤️ {simulation.opponent_starting_hp}</Text>
                            </View>
                        </View>
                    </View>
                    
                    {simulation.turns.map((turn, index) => (
                        <TurnCard 
                            key={index} 
                            turn={turn} 
                            index={index} 
                            isPlayerTurn={turn.attacker.toLowerCase() === (name as string)?.toLowerCase()} 
                        />
                    ))}
                </View>
            ) : null}
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#f0f4f8',
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        textAlign: 'center',
        marginBottom: 20,
        textTransform: 'capitalize',
        color: '#1a202c',
    },
    loadingContainer: {
        marginTop: 50,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 15,
        fontSize: 18,
        color: '#4a5568',
        fontWeight: '600'
    },
    errorText: {
        fontSize: 16,
        color: 'red',
        textAlign: 'center',
    },
    card: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 16,
        elevation: 3,
    },
    simulationContainer: {
        paddingBottom: 40,
    },
    winnerCard: {
        backgroundColor: '#ffd700',
        padding: 20,
        borderRadius: 16,
        marginBottom: 25,
        alignItems: 'center',
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    winnerText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#8b6508',
        textTransform: 'capitalize',
    },
    analysisCard: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 16,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    analysisTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2d3748',
        marginBottom: 10,
    },
    analysisText: {
        fontSize: 15,
        lineHeight: 22,
        color: '#4a5568',
        marginBottom: 20,
    },
    hpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f7fafc',
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    hpBox: {
        alignItems: 'center',
        flex: 1,
    },
    hpLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#718096',
        textTransform: 'capitalize',
        marginBottom: 5,
    },
    hpValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#38a169',
    },
    vsText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#a0aec0',
        paddingHorizontal: 15,
    },
    turnCard: {
        backgroundColor: 'white',
        padding: 18,
        borderRadius: 16,
        marginBottom: 16,
        borderLeftWidth: 6,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    playerTurnCard: {
        borderLeftColor: '#3182ce',
    },
    opponentTurnCard: {
        borderLeftColor: '#e53e3e',
    },
    turnHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    turnNumber: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#718096',
        backgroundColor: '#edf2f7',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        overflow: 'hidden'
    },
    attackText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2d3748',
        flex: 1,
        marginLeft: 10,
        textTransform: 'capitalize'
    },
    narrative: {
        fontSize: 15,
        lineHeight: 22,
        color: '#4a5568',
        marginBottom: 15,
        fontStyle: 'italic',
    },
    resultsBadge: {
        backgroundColor: '#f7fafc',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0'
    },
    damageText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#e53e3e',
        marginBottom: 4,
    },
    healthText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#38a169',
    }
});