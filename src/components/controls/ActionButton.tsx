import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
} from 'react-native-reanimated';
import { GAME_CONFIG } from '../../config/gameConfig';
import { SkillSlot } from '../../models/combat';

interface ActionButtonProps {
    slot: SkillSlot;
    label: string;
    size: number;
    cooldownRemainingMs: number;
    onPress: () => void;
    accentColor?: string;
    isDisabled?: boolean;
}

export function ActionButton({
    label,
    size,
    cooldownRemainingMs,
    onPress,
    accentColor,
    isDisabled = false,
}: ActionButtonProps) {
    const isCooldownActive = cooldownRemainingMs > 0;
    const borderColor = accentColor ?? GAME_CONFIG.COLORS.BUTTON_BORDER;
    const isPressed = useSharedValue(false);

    const tapGesture = Gesture.Tap()
        .maxDuration(10000)
        .runOnJS(true)
        .onBegin(() => {
            if (!isCooldownActive && !isDisabled) {
                isPressed.value = true;
                onPress();
            }
        })
        .onFinalize(() => {
            isPressed.value = false;
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: isPressed.value ? 0.92 : 1 }],
    }));

    return (
        <GestureDetector gesture={tapGesture}>
            <Animated.View
                style={[
                    styles.button,
                    {
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        borderColor,
                        opacity: isDisabled ? 0.4 : isCooldownActive ? 0.6 : 1,
                    },
                    animatedStyle,
                ]}
            >
                <Text style={[styles.label, { color: accentColor ?? GAME_CONFIG.COLORS.TEXT_PRIMARY }]}>
                    {label}
                </Text>
                {isCooldownActive && (
                    <View style={styles.cooldownOverlay}>
                        <Text style={styles.cooldownText}>
                            {(cooldownRemainingMs / 1000).toFixed(1)}s
                        </Text>
                    </View>
                )}
            </Animated.View>
        </GestureDetector>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: GAME_CONFIG.COLORS.BUTTON_BG,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    label: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 0.8,
        textAlign: 'center',
    },
    cooldownOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(11, 12, 16, 0.75)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cooldownText: {
        fontSize: 11,
        fontWeight: '800',
        color: GAME_CONFIG.COLORS.CRITICAL_TEXT,
        letterSpacing: 0.5,
    },
});