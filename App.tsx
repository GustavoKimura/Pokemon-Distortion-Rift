import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { GAME_CONFIG } from './src/config/gameConfig';
import { calculateViewportMetrics } from './src/utils/viewport';
import { pokeApiService } from './src/services/pokeApi';
import { PlayerPokemon } from './src/models/pokemon';

function GameScreen() {
    const { width, height } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const metrics = calculateViewportMetrics(width, height, insets);
    const [pokemon, setPokemon] = useState<PlayerPokemon | null>(null);

    useEffect(() => {
        if (Platform.OS === 'android') {
            NavigationBar.setVisibilityAsync('hidden');
            NavigationBar.setBehaviorAsync('overlay-swipe');
        }
        pokeApiService.fetchPokemon('charmander').then(setPokemon);
    }, []);

    return (
        <View style={styles.root}>
            <StatusBar style="light" hidden={true} />
            <View
                style={[
                    styles.viewport,
                    {
                        width: metrics.viewportWidth,
                        height: metrics.viewportHeight,
                        left: metrics.offsetX,
                        top: metrics.offsetY,
                    },
                ]}
            >
                <View style={styles.content}>
                    <Text style={styles.badge}>POKEAPI SERVICE VALIDATED</Text>
                    <Text style={styles.title}>
                        {pokemon ? `${pokemon.name} [#${pokemon.pokedexId}]` : 'CONNECTING TO POKEAPI...'}
                    </Text>
                    {pokemon && (
                        <View style={styles.statsCard}>
                            <Text style={styles.statLine}>
                                TYPE: {pokemon.primaryType.toUpperCase()} | HP: {pokemon.stats.hp} | ATK: {pokemon.stats.attack}
                            </Text>
                            <Text style={styles.skillLine}>
                                BASIC: {pokemon.skills.basic.name} ({pokemon.skills.basic.power} PWR)
                            </Text>
                            <Text style={styles.skillLine}>
                                SKILL 1: {pokemon.skills.skill1.name} ({pokemon.skills.skill1.power} PWR)
                            </Text>
                            <Text style={styles.skillLine}>
                                SKILL 2: {pokemon.skills.skill2.name} ({pokemon.skills.skill2.power} PWR)
                            </Text>
                            <Text style={styles.skillLine}>
                                ULTIMATE: {pokemon.skills.ultimate.name} ({pokemon.skills.ultimate.power} PWR)
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
}

export default function App() {
    return (
        <SafeAreaProvider>
            <GestureHandlerRootView style={styles.root}>
                <GameScreen />
            </GestureHandlerRootView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: GAME_CONFIG.COLORS.VOID_BG,
    },
    viewport: {
        position: 'absolute',
        backgroundColor: GAME_CONFIG.COLORS.ARENA_FLOOR,
        borderWidth: 2,
        borderColor: GAME_CONFIG.COLORS.ARENA_BORDER,
        borderRadius: GAME_CONFIG.UI.BORDER_RADIUS_MD,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    content: {
        alignItems: 'center',
        paddingHorizontal: GAME_CONFIG.PHYSICS.BOUNDARY_PADDING,
    },
    badge: {
        fontSize: 11,
        letterSpacing: 2,
        fontWeight: '700',
        color: GAME_CONFIG.COLORS.CYAN_ACCENT,
        marginBottom: 8,
    },
    title: {
        fontSize: 22,
        fontWeight: '900',
        color: GAME_CONFIG.COLORS.TEXT_PRIMARY,
        letterSpacing: 2,
        marginBottom: 12,
        textAlign: 'center',
    },
    statsCard: {
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: GAME_CONFIG.UI.BORDER_RADIUS_SM,
        backgroundColor: GAME_CONFIG.COLORS.BUTTON_BG,
        borderWidth: 1,
        borderColor: GAME_CONFIG.COLORS.ARENA_BORDER,
    },
    statLine: {
        fontSize: 12,
        fontWeight: '700',
        color: GAME_CONFIG.COLORS.CRITICAL_TEXT,
        letterSpacing: 1,
        marginBottom: 6,
    },
    skillLine: {
        fontSize: 10,
        fontWeight: '600',
        color: GAME_CONFIG.COLORS.TEXT_SECONDARY,
        letterSpacing: 0.8,
        marginVertical: 2,
    },
});