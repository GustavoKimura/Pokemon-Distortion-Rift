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

export default function App() {
    const pulseScale = useSharedValue(1);

    useEffect(() => {
        pulseScale.value = withRepeat(
            withTiming(1.08, {
                duration: 900,
                easing: Easing.inOut(Easing.ease),
            }),
            -1,
            true
        );
    }, [pulseScale]);

    const animatedLogoStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: pulseScale.value }],
        };
    });

    return (
        <SafeAreaProvider>
            <GestureHandlerRootView style={styles.root}>
                <StatusBar style="light" />
                <SafeAreaView style={styles.container}>
                    <Animated.View style={[styles.card, animatedLogoStyle]}>
                        <Text style={styles.badge}>POKEMON ROGUELIKE</Text>
                        <Text style={styles.title}>DISTORTION RIFT</Text>
                        <Text style={styles.status}>SYSTEM ONLINE - 60 FPS READY</Text>
                    </Animated.View>
                    <View style={styles.footer}>
                        <Text style={styles.deviceInfo}>HARDWARE: XIAOMI REDMI CONNECTED</Text>
                    </View>
                </SafeAreaView>
            </GestureHandlerRootView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#0B0C10',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    card: {
        width: '100%',
        paddingVertical: 32,
        paddingHorizontal: 24,
        borderRadius: 16,
        backgroundColor: '#1F2833',
        borderWidth: 2,
        borderColor: '#45A29E',
        alignItems: 'center',
    },
    badge: {
        fontSize: 12,
        letterSpacing: 2,
        fontWeight: '700',
        color: '#66FCF1',
        marginBottom: 8,
    },
    title: {
        fontSize: 26,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: 1.5,
        marginBottom: 12,
        textAlign: 'center',
    },
    status: {
        fontSize: 13,
        fontWeight: '600',
        color: '#66FCF1',
        letterSpacing: 1,
        textAlign: 'center',
    },
    footer: {
        position: 'absolute',
        bottom: 32,
        alignItems: 'center',
    },
    deviceInfo: {
        fontSize: 11,
        color: '#C5C6C7',
        letterSpacing: 1,
    },
});