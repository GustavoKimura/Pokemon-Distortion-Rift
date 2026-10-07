import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { GAME_CONFIG } from '../config/gameConfig';
import { PlayerPokemon } from '../models/pokemon';
import { Enemy } from '../models/enemy';
import { Projectile } from '../models/combat';
import { ExpGem } from '../models/roguelike';
import { FloatingDamage } from '../viewmodels/useGameLoop';

interface ArenaViewProps {
    player: PlayerPokemon | null;
    enemies: Enemy[];
    projectiles: Projectile[];
    gems: ExpGem[];
    floatingDamages: FloatingDamage[];
    targetEnemyId: string | null;
    scale: number;
}

export function ArenaView({
    player,
    enemies,
    projectiles,
    gems,
    floatingDamages,
    targetEnemyId,
    scale,
}: ArenaViewProps) {
    return (
        <View style={styles.arenaContainer}>
            <View style={styles.gridOverlay} />

            {gems.map(gem => {
                const size = GAME_CONFIG.PHYSICS.GEM_RADIUS * 2 * scale;
                return (
                    <View
                        key={gem.id}
                        style={[
                            styles.gem,
                            {
                                left: gem.x * scale - size / 2,
                                top: gem.y * scale - size / 2,
                                width: size,
                                height: size,
                                borderRadius: size / 2,
                            },
                        ]}
                    />
                );
            })}

            {projectiles.map(proj => {
                const size = proj.radius * 2 * scale;
                return (
                    <View
                        key={proj.id}
                        style={[
                            styles.projectile,
                            {
                                left: proj.x * scale - size / 2,
                                top: proj.y * scale - size / 2,
                                width: size,
                                height: size,
                                borderRadius: size / 2,
                            },
                        ]}
                    />
                );
            })}

            {enemies.map(enemy => {
                const size = enemy.radius * 2 * scale;
                const hpPercent = Math.max(0, enemy.currentHp / enemy.maxHp);
                const hpBarWidth = size * 1.2;
                const isTargeted = enemy.id === targetEnemyId;
                return (
                    <View
                        key={enemy.id}
                        style={[
                            styles.enemyContainer,
                            {
                                left: enemy.position.x * scale - size / 2,
                                top: enemy.position.y * scale - size / 2,
                                width: size,
                                height: size,
                            },
                        ]}
                    >
                        {isTargeted && (
                            <View
                                style={[
                                    styles.targetReticle,
                                    {
                                        width: size * 1.4,
                                        height: size * 1.4,
                                        left: -size * 0.2,
                                        top: -size * 0.2,
                                        borderRadius: (size * 1.4) / 2,
                                    },
                                ]}
                            />
                        )}
                        <View
                            style={[
                                styles.enemyHpBarBg,
                                {
                                    width: hpBarWidth,
                                    height: 4 * scale,
                                    top: -8 * scale,
                                    left: (size - hpBarWidth) / 2,
                                },
                            ]}
                        >
                            <View
                                style={[
                                    styles.enemyHpBarFill,
                                    { width: `${hpPercent * 100}%` },
                                ]}
                            />
                        </View>
                        <View
                            style={[
                                styles.enemyBody,
                                {
                                    width: size,
                                    height: size,
                                    borderRadius: size / 2,
                                    borderColor: enemy.isBoss ? GAME_CONFIG.COLORS.CRITICAL_TEXT : GAME_CONFIG.COLORS.ARENA_BORDER,
                                },
                            ]}
                        >
                            <Text style={[styles.enemyName, { fontSize: Math.max(7, 8 * scale) }]}>
                                {enemy.name.slice(0, 4)}
                            </Text>
                        </View>
                    </View>
                );
            })}

            {player && (
                <View
                    style={[
                        styles.playerContainer,
                        {
                            left: player.position.x * scale - (GAME_CONFIG.PHYSICS.PLAYER_RADIUS * scale),
                            top: player.position.y * scale - (GAME_CONFIG.PHYSICS.PLAYER_RADIUS * scale),
                            width: GAME_CONFIG.PHYSICS.PLAYER_RADIUS * 2 * scale,
                            height: GAME_CONFIG.PHYSICS.PLAYER_RADIUS * 2 * scale,
                        },
                    ]}
                >
                    <View
                        style={[
                            styles.playerBody,
                            {
                                width: GAME_CONFIG.PHYSICS.PLAYER_RADIUS * 2 * scale,
                                height: GAME_CONFIG.PHYSICS.PLAYER_RADIUS * 2 * scale,
                                borderRadius: GAME_CONFIG.PHYSICS.PLAYER_RADIUS * scale,
                                borderColor: player.state === 'dashing' ? GAME_CONFIG.COLORS.CRITICAL_TEXT : GAME_CONFIG.COLORS.CYAN_ACCENT,
                            },
                        ]}
                    >
                        <Text style={[styles.playerName, { fontSize: Math.max(8, 9 * scale) }]}>
                            {player.name.slice(0, 5)}
                        </Text>
                    </View>
                </View>
            )}

            {floatingDamages.map(d => (
                <Text
                    key={d.id}
                    style={[
                        styles.damageText,
                        {
                            left: d.x * scale,
                            top: d.y * scale,
                            opacity: d.opacity,
                            fontSize: d.isCritical ? 14 * scale : 11 * scale,
                            color: d.isCritical ? GAME_CONFIG.COLORS.CRITICAL_TEXT : GAME_CONFIG.COLORS.TEXT_PRIMARY,
                        },
                    ]}
                >
                    {d.damage}
                </Text>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    arenaContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    gridOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderWidth: 1,
        borderColor: 'rgba(69, 162, 158, 0.12)',
    },
    gem: {
        position: 'absolute',
        backgroundColor: GAME_CONFIG.COLORS.GEM_COLOR,
        borderWidth: 1,
        borderColor: GAME_CONFIG.COLORS.TEXT_PRIMARY,
    },
    targetReticle: {
        position: 'absolute',
        borderWidth: 1.5,
        borderColor: GAME_CONFIG.COLORS.CRITICAL_TEXT,
        borderStyle: 'dashed',
    },
    projectile: {
        position: 'absolute',
        backgroundColor: GAME_CONFIG.COLORS.CYAN_ACCENT,
        borderWidth: 1,
        borderColor: GAME_CONFIG.COLORS.TEXT_PRIMARY,
    },
    enemyContainer: {
        position: 'absolute',
    },
    enemyHpBarBg: {
        position: 'absolute',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    enemyHpBarFill: {
        height: '100%',
        backgroundColor: GAME_CONFIG.COLORS.HEALTH_BAR,
    },
    enemyBody: {
        backgroundColor: GAME_CONFIG.COLORS.ARENA_FLOOR,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    enemyName: {
        color: GAME_CONFIG.COLORS.TEXT_SECONDARY,
        fontWeight: '800',
    },
    playerContainer: {
        position: 'absolute',
    },
    playerBody: {
        backgroundColor: GAME_CONFIG.COLORS.BUTTON_BG,
        borderWidth: 2.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    playerName: {
        color: GAME_CONFIG.COLORS.TEXT_PRIMARY,
        fontWeight: '900',
    },
    damageText: {
        position: 'absolute',
        fontWeight: '900',
        letterSpacing: 0.5,
    },
});