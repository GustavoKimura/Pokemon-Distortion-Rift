import React from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { GAME_CONFIG } from './src/config/gameConfig';
import { calculateViewportMetrics } from './src/utils/viewport';

function GameScreen() {
    const { width, height } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const metrics = calculateViewportMetrics(width, height, insets);

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
                    <Text style={styles.badge}>VIEWPORT SCALER ONLINE</Text>
                    <Text style={styles.title}>IMMERSIVE LANDSCAPE ACTIVE</Text>
                    <Text style={styles.metricsText}>
                        LOGICAL: {metrics.logicalWidth}x{metrics.logicalHeight} | SCALE: {metrics.scale.toFixed(2)}x
                    </Text>
                    <Text style={styles.metricsDetail}>
                        CANVAS: {Math.round(metrics.viewportWidth)}x{Math.round(metrics.viewportHeight)} | OFFSET: ({Math.round(metrics.offsetX)}, {Math.round(metrics.offsetY)})
                    </Text>
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
        marginBottom: 10,
        textAlign: 'center',
    },
    metricsText: {
        fontSize: 13,
        fontWeight: '700',
        color: GAME_CONFIG.COLORS.CRITICAL_TEXT,
        letterSpacing: 1.2,
        marginBottom: 4,
    },
    metricsDetail: {
        fontSize: 11,
        color: GAME_CONFIG.COLORS.TEXT_SECONDARY,
        letterSpacing: 1,
    },
});