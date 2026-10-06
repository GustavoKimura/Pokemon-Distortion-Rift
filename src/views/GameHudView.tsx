import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { GAME_CONFIG } from '../config/gameConfig';
import { PlayerPokemon } from '../models/pokemon';
import { GameStatus } from '../viewmodels/useGameLoop';

interface GameHudViewProps {
    player: PlayerPokemon | null;
    currentWave: number;
    kills: number;
    status: GameStatus;
    onRestart: () => void;
    scale: number;
}

export function GameHudView({
    player,
    currentWave,
    kills,
    status,
    onRestart,
    scale,
}: GameHudViewProps) {
    const hpPercent = player ? Math.max(0, player.currentHp / player.stats.maxHp) : 0;
    const ultimatePercent = player
        ? Math.min(1, player.ultimateEnergy / GAME_CONFIG.COMBAT.MAX_ULTIMATE_ENERGY)
        : 0;

    return (
        <View style={styles.hudOverlay} pointerEvents="box-none">
            <View style={[styles.topBar, { paddingHorizontal: 16 * scale, paddingTop: 10 * scale }]} pointerEvents="box-none">
                {player && (
                    <View style={styles.playerStatsPanel}>
                        <Text style={[styles.pokemonName, { fontSize: Math.max(10, 12 * scale) }]}>
                            {player.name} ({player.primaryType.toUpperCase()})
                        </Text>
                        <View
                            style={[
                                styles.barBackground,
                                {
                                    width: GAME_CONFIG.UI.HP_BAR_WIDTH * scale,
                                    height: GAME_CONFIG.UI.HP_BAR_HEIGHT * scale,
                                },
                            ]}
                        >
                            <View
                                style={[
                                    styles.hpBarFill,
                                    { width: `${hpPercent * 100}%` },
                                ]}
                            />
                            <Text style={[styles.barText, { fontSize: Math.max(8, 9 * scale) }]}>
                                {player.currentHp} / {player.stats.maxHp}
                            </Text>
                        </View>

                        <View
                            style={[
                                styles.barBackground,
                                {
                                    width: GAME_CONFIG.UI.ENERGY_BAR_WIDTH * scale,
                                    height: GAME_CONFIG.UI.ENERGY_BAR_HEIGHT * scale,
                                    marginTop: 3 * scale,
                                },
                            ]}
                        >
                            <View
                                style={[
                                    styles.energyBarFill,
                                    { width: `${ultimatePercent * 100}%` },
                                ]}
                            />
                        </View>
                    </View>
                )}

                <View style={styles.wavePanel}>
                    <Text style={[styles.waveText, { fontSize: Math.max(12, 14 * scale) }]}>
                        WAVE {currentWave}
                    </Text>
                    <Text style={[styles.killsText, { fontSize: Math.max(9, 10 * scale) }]}>
                        VOID PURGED: {kills}
                    </Text>
                </View>
            </View>

            {status === 'game_over' && (
                <View style={styles.gameOverOverlay}>
                    <Text style={styles.gameOverTitle}>VOID CONSUMED</Text>
                    <Text style={styles.gameOverSubtitle}>WAVE REACHED: {currentWave}</Text>
                    <TouchableOpacity style={styles.restartButton} onPress={onRestart}>
                        <Text style={styles.restartButtonText}>ENTER RIFT AGAIN</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    hudOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    playerStatsPanel: {
        alignItems: 'flex-start',
    },
    pokemonName: {
        fontWeight: '900',
        color: GAME_CONFIG.COLORS.TEXT_PRIMARY,
        letterSpacing: 1.2,
        marginBottom: 4,
    },
    barBackground: {
        backgroundColor: 'rgba(31, 40, 51, 0.85)',
        borderRadius: GAME_CONFIG.UI.BORDER_RADIUS_SM,
        borderWidth: 1,
        borderColor: GAME_CONFIG.COLORS.ARENA_BORDER,
        overflow: 'hidden',
        justifyContent: 'center',
    },
    hpBarFill: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        backgroundColor: GAME_CONFIG.COLORS.HEALTH_BAR,
    },
    energyBarFill: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        backgroundColor: GAME_CONFIG.COLORS.ULTIMATE_GAUGE,
    },
    barText: {
        fontWeight: '800',
        color: GAME_CONFIG.COLORS.TEXT_PRIMARY,
        textAlign: 'center',
    },
    wavePanel: {
        alignItems: 'flex-end',
    },
    waveText: {
        fontWeight: '900',
        color: GAME_CONFIG.COLORS.CYAN_ACCENT,
        letterSpacing: 1.5,
    },
    killsText: {
        fontWeight: '700',
        color: GAME_CONFIG.COLORS.TEXT_SECONDARY,
        letterSpacing: 1,
        marginTop: 2,
    },
    gameOverOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(11, 12, 16, 0.92)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    gameOverTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: GAME_CONFIG.COLORS.HEALTH_BAR,
        letterSpacing: 2,
        marginBottom: 8,
    },
    gameOverSubtitle: {
        fontSize: 14,
        fontWeight: '700',
        color: GAME_CONFIG.COLORS.TEXT_SECONDARY,
        letterSpacing: 1.2,
        marginBottom: 20,
    },
    restartButton: {
        backgroundColor: GAME_CONFIG.COLORS.ARENA_FLOOR,
        borderWidth: 2,
        borderColor: GAME_CONFIG.COLORS.CYAN_ACCENT,
        borderRadius: GAME_CONFIG.UI.BORDER_RADIUS_MD,
        paddingVertical: 12,
        paddingHorizontal: 28,
    },
    restartButtonText: {
        fontSize: 13,
        fontWeight: '900',
        color: GAME_CONFIG.COLORS.CYAN_ACCENT,
        letterSpacing: 1.5,
    },
});