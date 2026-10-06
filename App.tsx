import React, { useEffect } from 'react';
import { StyleSheet, Text, View, useWindowDimensions, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { GAME_CONFIG } from './src/config/gameConfig';
import { calculateViewportMetrics } from './src/utils/viewport';
import { useGameLoop } from './src/viewmodels/useGameLoop';
import { TouchControlsOverlay } from './src/components/controls/TouchControlsOverlay';

function GameScreen() {
    const { width, height } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const metrics = calculateViewportMetrics(width, height, insets);
    const {
        player,
        enemies,
        projectiles,
        cooldowns,
        currentWave,
        setJoystickInput,
        handleAction,
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
                <View style={styles.hudContainer}>
                    <Text style={styles.badge}>TOUCH CONTROLS ACTIVE</Text>
                    <Text style={styles.title}>
                        {player ? `${player.name} | HP: ${player.currentHp}/${player.stats.maxHp}` : 'INITIALIZING...'}
                    </Text>
                    {player && (
                        <Text style={styles.metricsDetail}>
                            POS: ({Math.round(player.position.x)}, {Math.round(player.position.y)}) | WAVE: {currentWave} | ENEMIES: {enemies.length} | PROJ: {projectiles.length}
                        </Text>
                    )}
                </View>

                {player && (
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
        overflow: 'hidden',
    },
    hudContainer: {
        alignItems: 'center',
        paddingTop: 16,
        paddingHorizontal: GAME_CONFIG.PHYSICS.BOUNDARY_PADDING,
    },
    badge: {
        fontSize: 11,
        letterSpacing: 2,
        fontWeight: '700',
        color: GAME_CONFIG.COLORS.CYAN_ACCENT,
        marginBottom: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: '900',
        color: GAME_CONFIG.COLORS.TEXT_PRIMARY,
        letterSpacing: 1.5,
        marginBottom: 4,
        textAlign: 'center',
    },
    metricsDetail: {
        fontSize: 11,
        fontWeight: '600',
        color: GAME_CONFIG.COLORS.CRITICAL_TEXT,
        letterSpacing: 1,
    },
});