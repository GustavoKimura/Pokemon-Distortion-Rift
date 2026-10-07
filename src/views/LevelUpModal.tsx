import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { GAME_CONFIG } from '../config/gameConfig';
import { UpgradeOption } from '../models/roguelike';

interface LevelUpModalProps {
    upgrades: UpgradeOption[];
    onSelect: (upgrade: UpgradeOption) => void;
    scale: number;
}

export function LevelUpModal({ upgrades, onSelect, scale }: LevelUpModalProps) {
    return (
        <View style={styles.backdrop}>
            <Text style={[styles.header, { fontSize: Math.max(16, 20 * scale) }]}>
                DIMENSIONAL POWER SURGE
            </Text>
            <Text style={[styles.subHeader, { fontSize: Math.max(10, 11 * scale) }]}>
                CHOOSE A POKEMON MATRIX ENHANCEMENT
            </Text>

            <View style={[styles.cardsContainer, { gap: 12 * scale }]}>
                {upgrades.map(option => (
                    <TouchableOpacity
                        key={option.id}
                        activeOpacity={0.8}
                        style={[styles.card, { padding: 12 * scale, minWidth: 180 * scale }]}
                        onPress={() => onSelect(option)}
                    >
                        <View style={styles.iconBadge}>
                            <Text style={styles.iconText}>{option.iconText}</Text>
                        </View>
                        <Text style={[styles.cardTitle, { fontSize: Math.max(11, 12 * scale) }]}>
                            {option.name}
                        </Text>
                        <Text style={[styles.cardDesc, { fontSize: Math.max(9, 10 * scale) }]}>
                            {option.description}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(11, 12, 16, 0.94)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
    },
    header: {
        fontWeight: '900',
        color: GAME_CONFIG.COLORS.CYAN_ACCENT,
        letterSpacing: 2,
        marginBottom: 4,
    },
    subHeader: {
        fontWeight: '700',
        color: GAME_CONFIG.COLORS.TEXT_SECONDARY,
        letterSpacing: 1,
        marginBottom: 16,
    },
    cardsContainer: {
        flexDirection: 'row',
    },
    card: {
        backgroundColor: GAME_CONFIG.COLORS.ARENA_FLOOR,
        borderWidth: 2,
        borderColor: GAME_CONFIG.COLORS.ARENA_BORDER,
        borderRadius: GAME_CONFIG.UI.BORDER_RADIUS_MD,
        alignItems: 'center',
    },
    iconBadge: {
        backgroundColor: GAME_CONFIG.COLORS.BUTTON_BG,
        borderWidth: 1,
        borderColor: GAME_CONFIG.COLORS.CYAN_ACCENT,
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginBottom: 8,
    },
    iconText: {
        fontSize: 10,
        fontWeight: '900',
        color: GAME_CONFIG.COLORS.CYAN_ACCENT,
    },
    cardTitle: {
        fontWeight: '900',
        color: GAME_CONFIG.COLORS.TEXT_PRIMARY,
        letterSpacing: 1,
        marginBottom: 4,
        textAlign: 'center',
    },
    cardDesc: {
        fontWeight: '600',
        color: GAME_CONFIG.COLORS.TEXT_SECONDARY,
        textAlign: 'center',
    },
});