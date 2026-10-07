import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { GAME_CONFIG } from '../config/gameConfig';
import { MetaTalents } from '../models/starter';

interface MetaProgressionModalProps {
    voidDust: number;
    talents: MetaTalents;
    onUpgrade: (key: keyof MetaTalents) => void;
    onClose: () => void;
    scale: number;
}

const TALENT_CONFIGS: Array<{ key: keyof MetaTalents; label: string; desc: string }> = [
    { key: 'vigor', label: 'PRIMORDIAL VIGOR', desc: '+5% Max HP per node' },
    { key: 'fury', label: 'ELEMENTAL FURY', desc: '+4% Atk & Sp.Atk damage' },
    { key: 'agility', label: 'DIMENSIONAL AGILITY', desc: '+3% Movement speed' },
    { key: 'mastery', label: 'ARCANE MASTERY', desc: '-3% Skill cooldowns' },
];

export function MetaProgressionModal({
    voidDust,
    talents,
    onUpgrade,
    onClose,
    scale,
}: MetaProgressionModalProps) {
    return (
        <View style={styles.backdrop}>
            <View style={[styles.container, { padding: 16 * scale }]}>
                <View style={styles.headerRow}>
                    <Text style={[styles.headerTitle, { fontSize: 16 * scale }]}>
                        GIRATINA CORE - PERMANENT UPGRADES
                    </Text>
                    <Text style={[styles.dustCounter, { fontSize: 12 * scale }]}>
                        {voidDust} VOID DUST
                    </Text>
                </View>

                <View style={styles.grid}>
                    {TALENT_CONFIGS.map(node => {
                        const level = talents[node.key];
                        const maxed = level >= GAME_CONFIG.META.TALENT_MAX_LEVEL;
                        const cost = (level + 1) * GAME_CONFIG.META.TALENT_BASE_COST;
                        const canAfford = voidDust >= cost && !maxed;

                        return (
                            <View key={node.key} style={[styles.nodeCard, { padding: 10 * scale }]}>
                                <View style={styles.nodeInfo}>
                                    <Text style={[styles.nodeTitle, { fontSize: 11 * scale }]}>
                                        {node.label}
                                    </Text>
                                    <Text style={[styles.nodeDesc, { fontSize: 9 * scale }]}>
                                        {node.desc}
                                    </Text>
                                    <Text style={[styles.nodeLevel, { fontSize: 9 * scale }]}>
                                        LEVEL: {level}/{GAME_CONFIG.META.TALENT_MAX_LEVEL}
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    disabled={!canAfford}
                                    style={[
                                        styles.upgradeBtn,
                                        {
                                            opacity: maxed ? 0.3 : canAfford ? 1 : 0.5,
                                            paddingHorizontal: 12 * scale,
                                            paddingVertical: 6 * scale,
                                        },
                                    ]}
                                    onPress={() => onUpgrade(node.key)}
                                >
                                    <Text style={[styles.btnText, { fontSize: 10 * scale }]}>
                                        {maxed ? 'MAXED' : `${cost} DUST`}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        );
                    })}
                </View>

                <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                    <Text style={[styles.closeText, { fontSize: 11 * scale }]}>
                        RETURN TO VESSEL SELECTION
                    </Text>
                </TouchableOpacity>
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
        backgroundColor: 'rgba(11, 12, 16, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
    },
    container: {
        width: '92%',
        height: '90%',
        backgroundColor: GAME_CONFIG.COLORS.ARENA_FLOOR,
        borderWidth: 2,
        borderColor: GAME_CONFIG.COLORS.VOID_DUST_GOLD,
        borderRadius: GAME_CONFIG.UI.BORDER_RADIUS_MD,
        justifyContent: 'space-between',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontWeight: '900',
        color: GAME_CONFIG.COLORS.TEXT_PRIMARY,
        letterSpacing: 1.5,
    },
    dustCounter: {
        fontWeight: '900',
        color: GAME_CONFIG.COLORS.VOID_DUST_GOLD,
        letterSpacing: 1,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        justifyContent: 'space-between',
    },
    nodeCard: {
        width: '48%',
        backgroundColor: GAME_CONFIG.COLORS.BUTTON_BG,
        borderWidth: 1.5,
        borderColor: GAME_CONFIG.COLORS.ARENA_BORDER,
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    nodeInfo: {
        flex: 1,
        gap: 2,
    },
    nodeTitle: {
        fontWeight: '900',
        color: GAME_CONFIG.COLORS.CYAN_ACCENT,
        letterSpacing: 0.8,
    },
    nodeDesc: {
        color: GAME_CONFIG.COLORS.TEXT_SECONDARY,
        fontWeight: '600',
    },
    nodeLevel: {
        color: GAME_CONFIG.COLORS.VOID_DUST_GOLD,
        fontWeight: '800',
        marginTop: 2,
    },
    upgradeBtn: {
        backgroundColor: GAME_CONFIG.COLORS.ARENA_FLOOR,
        borderWidth: 1.5,
        borderColor: GAME_CONFIG.COLORS.VOID_DUST_GOLD,
        borderRadius: 6,
    },
    btnText: {
        fontWeight: '900',
        color: GAME_CONFIG.COLORS.VOID_DUST_GOLD,
        letterSpacing: 0.5,
    },
    closeBtn: {
        alignSelf: 'center',
        paddingVertical: 8,
        paddingHorizontal: 24,
        borderWidth: 1.5,
        borderColor: GAME_CONFIG.COLORS.CYAN_ACCENT,
        borderRadius: 8,
        backgroundColor: GAME_CONFIG.COLORS.BUTTON_BG,
    },
    closeText: {
        fontWeight: '900',
        color: GAME_CONFIG.COLORS.CYAN_ACCENT,
        letterSpacing: 1.5,
    },
});