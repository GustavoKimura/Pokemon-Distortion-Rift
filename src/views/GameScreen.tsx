import React, { useEffect } from 'react';
import { StyleSheet, View, useWindowDimensions, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GAME_CONFIG } from '../config/gameConfig';
import { calculateViewportMetrics } from '../utils/viewport';
import { useGameLoop } from '../viewmodels/useGameLoop';
import { ArenaView } from './ArenaView';
import { GameHudView } from './GameHudView';
import { TouchControlsOverlay } from '../components/controls/TouchControlsOverlay';

export function GameScreen() {
    const { width, height } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const metrics = calculateViewportMetrics(width, height, insets);

    const {
        player,
        enemies,
        projectiles,
        floatingDamages,
        cooldowns,
        currentWave,
        kills,
        status,
        setJoystickInput,
        handleAction,
        restartGame,
    } = useGameLoop();

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
                <ArenaView
                    player={player}
                    enemies={enemies}
                    projectiles={projectiles}
                    floatingDamages={floatingDamages}
                    scale={metrics.scale}
                />

                <GameHudView
                    player={player}
                    currentWave={currentWave}
                    kills={kills}
                    status={status}
                    onRestart={restartGame}
                    scale={metrics.scale}
                />

                {player && status === 'playing' && (
                    <TouchControlsOverlay
                        onJoystickMove={setJoystickInput}
                        onActionPress={handleAction}
                        cooldowns={cooldowns}
                        ultimateEnergy={player.ultimateEnergy}
                    />
                )}
            </View>
        </View>
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
        overflow: 'hidden',
    },
});