import React, { useEffect } from 'react';
import { StyleSheet, Text, View, useWindowDimensions, Platform, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { GAME_CONFIG } from './src/config/gameConfig';
import { calculateViewportMetrics } from './src/utils/viewport';
import { useGameLoop } from './src/viewmodels/useGameLoop';

function GameScreen() {
    const { width, height } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const metrics = calculateViewportMetrics(width, height, insets);
    const { player, enemies, projectiles, cooldowns, currentWave, status, handleAction, restartGame } = useGameLoop();

    useEffect(() => {
        if (Platform.OS === 'android') {
            NavigationBar.setVisibilityAsync('hidden').catch(() => { });
        }
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
                    <Text style={styles.badge}>VIEWMODEL ENGINE 60 FPS ONLINE</Text>
                    <Text style={styles.title}>
                        {player ? `${player.name} | HP: ${player.currentHp}/${player.stats.maxHp}` : 'INITIALIZING ENGINE...'}
                    </Text>
                    {player && (
                        <View style={styles.statsCard}>
                            <Text style={styles.statLine}>
                                WAVE: {currentWave} | ENEMIES: {enemies.length} | PROJECTILES: {projectiles.length} | STATUS: {status.toUpperCase()}
                            </Text>
                            <Text style={styles.statLine}>
                                COOLDOWNS - ATK: {(cooldowns.basic / 1000).toFixed(1)}s | S1: {(cooldowns.skill1 / 1000).toFixed(1)}s | S2: {(cooldowns.skill2 / 1000).toFixed(1)}s | DASH: {(cooldowns.dash / 1000).toFixed(1)}s
                            </Text>
                            <Text style={styles.statLine}>
                                ULTIMATE GAUGE: {player.ultimateEnergy}/{GAME_CONFIG.COMBAT.MAX_ULTIMATE_ENERGY}
                            </Text>
                            <View style={styles.buttonRow}>
                                <TouchableOpacity style={styles.actionButton} onPress={() => handleAction('basic')}>
                                    <Text style={styles.buttonText}>BASIC ATK</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.actionButton} onPress={() => handleAction('skill1')}>
                                    <Text style={styles.buttonText}>SKILL 1</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.actionButton} onPress={() => handleAction('skill2')}>
                                    <Text style={styles.buttonText}>SKILL 2</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.actionButton} onPress={() => handleAction('dash')}>
                                    <Text style={styles.buttonText}>DASH</Text>
                                </TouchableOpacity>
                                {status === 'game_over' && (
                                    <TouchableOpacity style={styles.actionButton} onPress={restartGame}>
                                        <Text style={styles.buttonText}>RESTART</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
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
        fontSize: 20,
        fontWeight: '900',
        color: GAME_CONFIG.COLORS.TEXT_PRIMARY,
        letterSpacing: 2,
        marginBottom: 10,
        textAlign: 'center',
    },
    statsCard: {
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: GAME_CONFIG.UI.BORDER_RADIUS_SM,
        backgroundColor: GAME_CONFIG.COLORS.BUTTON_BG,
        borderWidth: 1,
        borderColor: GAME_CONFIG.COLORS.ARENA_BORDER,
    },
    statLine: {
        fontSize: 11,
        fontWeight: '700',
        color: GAME_CONFIG.COLORS.CRITICAL_TEXT,
        letterSpacing: 1,
        marginBottom: 4,
    },
    buttonRow: {
        flexDirection: 'row',
        marginTop: 10,
        gap: 8,
    },
    actionButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: GAME_CONFIG.COLORS.ARENA_FLOOR,
        borderWidth: 1,
        borderColor: GAME_CONFIG.COLORS.CYAN_ACCENT,
        borderRadius: GAME_CONFIG.UI.BORDER_RADIUS_SM,
    },
    buttonText: {
        fontSize: 10,
        fontWeight: '800',
        color: GAME_CONFIG.COLORS.TEXT_PRIMARY,
        letterSpacing: 1,
    },
});