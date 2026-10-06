import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    runOnJS,
} from 'react-native-reanimated';
import { GAME_CONFIG } from '../../config/gameConfig';

interface VirtualJoystickProps {
    onMove: (vector: { x: number; y: number }) => void;
}

export function VirtualJoystick({ onMove }: VirtualJoystickProps) {
    const knobX = useSharedValue(0);
    const knobY = useSharedValue(0);
    const maxRadius = GAME_CONFIG.CONTROLS.JOYSTICK_BASE_RADIUS - GAME_CONFIG.CONTROLS.JOYSTICK_KNOB_RADIUS;

    const panGesture = Gesture.Pan()
        .onUpdate(event => {
            const distance = Math.hypot(event.translationX, event.translationY);
            const angle = Math.atan2(event.translationY, event.translationX);
            const clampedDistance = Math.min(distance, maxRadius);

            const targetX = Math.cos(angle) * clampedDistance;
            const targetY = Math.sin(angle) * clampedDistance;

            knobX.value = targetX;
            knobY.value = targetY;

            const normalizedMagnitude = clampedDistance / maxRadius;
            if (normalizedMagnitude < GAME_CONFIG.CONTROLS.JOYSTICK_DEADZONE) {
                runOnJS(onMove)({ x: 0, y: 0 });
            } else {
                runOnJS(onMove)({
                    x: targetX / maxRadius,
                    y: targetY / maxRadius,
                });
            }
        })
        .onEnd(() => {
            knobX.value = withSpring(0, { damping: 15, stiffness: 200 });
            knobY.value = withSpring(0, { damping: 15, stiffness: 200 });
            runOnJS(onMove)({ x: 0, y: 0 });
        });

    const animatedKnobStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: knobX.value },
            { translateY: knobY.value },
        ],
    }));

    const baseSize = GAME_CONFIG.CONTROLS.JOYSTICK_BASE_RADIUS * 2;
    const knobSize = GAME_CONFIG.CONTROLS.JOYSTICK_KNOB_RADIUS * 2;

    return (
        <GestureDetector gesture={panGesture}>
            <View
                style={[
                    styles.base,
                    {
                        width: baseSize,
                        height: baseSize,
                        borderRadius: GAME_CONFIG.CONTROLS.JOYSTICK_BASE_RADIUS,
                    },
                ]}
            >
                <Animated.View
                    style={[
                        styles.knob,
                        {
                            width: knobSize,
                            height: knobSize,
                            borderRadius: GAME_CONFIG.CONTROLS.JOYSTICK_KNOB_RADIUS,
                        },
                        animatedKnobStyle,
                    ]}
                />
            </View>
        </GestureDetector>
    );
}

const styles = StyleSheet.create({
    base: {
        backgroundColor: GAME_CONFIG.COLORS.JOYSTICK_BASE,
        borderWidth: 2,
        borderColor: GAME_CONFIG.COLORS.ARENA_BORDER,
        justifyContent: 'center',
        alignItems: 'center',
    },
    knob: {
        backgroundColor: GAME_CONFIG.COLORS.JOYSTICK_KNOB,
        borderWidth: 2,
        borderColor: GAME_CONFIG.COLORS.TEXT_PRIMARY,
    },
});