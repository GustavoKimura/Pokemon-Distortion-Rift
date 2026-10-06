import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            disabled={isCooldownActive || isDisabled}
            onPress={onPress}
            style={[
                styles.button,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    borderColor,
                    opacity: isDisabled ? 0.4 : isCooldownActive ? 0.6 : 1,
                },
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
        </TouchableOpacity>
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