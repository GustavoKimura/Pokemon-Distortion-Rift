import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { GAME_CONFIG } from './src/config/gameConfig';

export default function App() {
    const pulseScale = useSharedValue(1);

    useEffect(() => {
        pulseScale.value = withRepeat(
            withTiming(1.05, {
                duration: 900,
                easing: Easing.inOut(Easing.ease),
            }),
            -1,
            true
        );
    }, [pulseScale]);

    const animatedBannerStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: pulseScale.value }],
        };
    });

    return (
        <SafeAreaProvider>
            <GestureHandlerRootView style={styles.root}>
                <StatusBar style="light" hidden={true} />
                <SafeAreaView style={styles.container}>
                    <Animated.View style={[styles.card, animatedBannerStyle]}>
                        <Text style={styles.badge}>LANDSCAPE VIEWPORT INITIALIZED</Text>
                        <Text style={styles.title}>POKEMON DISTORTION RIFT</Text>
                        <Text style={styles.resolution}>
                            {GAME_CONFIG.VIEWPORT.LOGICAL_WIDTH} x {GAME_CONFIG.VIEWPORT.LOGICAL_HEIGHT} LOGICAL VIEWPORT
                        </Text>
                    </Animated.View>
                    <View style={styles.statusBarContainer}>
                        <Text style={styles.statusText}>
                            MVVM ARCHITECTURE LOADED - {GAME_CONFIG.VIEWPORT.TARGET_FPS} FPS TARGET
                        </Text>
                    </View>
                </SafeAreaView>
            </GestureHandlerRootView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: GAME_CONFIG.COLORS.VOID_BG,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: GAME_CONFIG.PHYSICS.BOUNDARY_PADDING,
    },
    card: {
        width: '75%',
        paddingVertical: 24,
        paddingHorizontal: 32,
        borderRadius: GAME_CONFIG.UI.BORDER_RADIUS_MD,
        backgroundColor: GAME_CONFIG.COLORS.ARENA_FLOOR,
        borderWidth: 2,
        borderColor: GAME_CONFIG.COLORS.ARENA_BORDER,
        alignItems: 'center',
    },
    badge: {
        fontSize: 11,
        letterSpacing: 2,
        fontWeight: '700',
        color: GAME_CONFIG.COLORS.CYAN_ACCENT,
        marginBottom: 6,
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        color: GAME_CONFIG.COLORS.TEXT_PRIMARY,
        letterSpacing: 2,
        marginBottom: 8,
        textAlign: 'center',
    },
    resolution: {
        fontSize: 13,
        fontWeight: '700',
        color: GAME_CONFIG.COLORS.CRITICAL_TEXT,
        letterSpacing: 1.5,
    },
    statusBarContainer: {
        marginTop: 18,
        alignItems: 'center',
    },
    statusText: {
        fontSize: 11,
        color: GAME_CONFIG.COLORS.TEXT_SECONDARY,
        letterSpacing: 1.2,
        fontWeight: '600',
    },
});