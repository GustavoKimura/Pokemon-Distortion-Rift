import React from 'react';
import { StyleSheet, View } from 'react-native';
import { GAME_CONFIG } from '../../config/gameConfig';
import { SkillSlot } from '../../models/combat';
import { VirtualJoystick } from './VirtualJoystick';
import { ActionButton } from './ActionButton';

interface TouchControlsOverlayProps {
    onJoystickMove: (vector: { x: number; y: number }) => void;
    onActionPress: (slot: SkillSlot) => void;
    cooldowns: Record<SkillSlot, number>;
    ultimateEnergy: number;
}

export function TouchControlsOverlay({
    onJoystickMove,
    onActionPress,
    cooldowns,
    ultimateEnergy,
}: TouchControlsOverlayProps) {
    const isUltimateReady = ultimateEnergy >= GAME_CONFIG.COMBAT.MAX_ULTIMATE_ENERGY;

    return (
        <View style={styles.overlay} pointerEvents="box-none">
            <View style={styles.joystickContainer} pointerEvents="auto">
                <VirtualJoystick onMove={onJoystickMove} />
            </View>

            <View style={styles.actionsContainer} pointerEvents="auto">
                <View style={styles.ultimateWrapper}>
                    <ActionButton
                        slot="ultimate"
                        label="ULT"
                        size={GAME_CONFIG.CONTROLS.ULTIMATE_BUTTON_SIZE}
                        cooldownRemainingMs={cooldowns.ultimate}
                        onPress={() => onActionPress('ultimate')}
                        accentColor={isUltimateReady ? GAME_CONFIG.COLORS.ULTIMATE_GAUGE : GAME_CONFIG.COLORS.TEXT_SECONDARY}
                        isDisabled={!isUltimateReady}
                    />
                </View>

                <View style={styles.skillsRow}>
                    <ActionButton
                        slot="skill2"
                        label="S2"
                        size={GAME_CONFIG.CONTROLS.SKILL_BUTTON_SIZE}
                        cooldownRemainingMs={cooldowns.skill2}
                        onPress={() => onActionPress('skill2')}
                        accentColor={GAME_CONFIG.COLORS.SHIELD_DASH}
                    />
                    <ActionButton
                        slot="skill1"
                        label="S1"
                        size={GAME_CONFIG.CONTROLS.SKILL_BUTTON_SIZE}
                        cooldownRemainingMs={cooldowns.skill1}
                        onPress={() => onActionPress('skill1')}
                        accentColor={GAME_CONFIG.COLORS.CYAN_ACCENT}
                    />
                </View>

                <View style={styles.primaryRow}>
                    <ActionButton
                        slot="dash"
                        label="DASH"
                        size={GAME_CONFIG.CONTROLS.DASH_BUTTON_SIZE}
                        cooldownRemainingMs={cooldowns.dash}
                        onPress={() => onActionPress('dash')}
                        accentColor={GAME_CONFIG.COLORS.CRITICAL_TEXT}
                    />
                    <ActionButton
                        slot="basic"
                        label="ATK"
                        size={GAME_CONFIG.CONTROLS.ATTACK_BUTTON_SIZE}
                        cooldownRemainingMs={cooldowns.basic}
                        onPress={() => onActionPress('basic')}
                        accentColor={GAME_CONFIG.COLORS.HEALTH_BAR}
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'space-between',
    },
    joystickContainer: {
        position: 'absolute',
        left: GAME_CONFIG.CONTROLS.JOYSTICK_LEFT_OFFSET,
        bottom: GAME_CONFIG.CONTROLS.JOYSTICK_BOTTOM_OFFSET,
    },
    actionsContainer: {
        position: 'absolute',
        right: GAME_CONFIG.CONTROLS.ACTIONS_RIGHT_OFFSET,
        bottom: GAME_CONFIG.CONTROLS.ACTIONS_BOTTOM_OFFSET,
        alignItems: 'flex-end',
        gap: 8,
    },
    ultimateWrapper: {
        marginBottom: 4,
        alignSelf: 'center',
    },
    skillsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 4,
    },
    primaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
});