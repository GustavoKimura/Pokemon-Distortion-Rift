import React from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import { GAME_CONFIG } from '../config/gameConfig';
import { PlayerPokemon } from '../models/pokemon';
import { Enemy } from '../models/enemy';
import { Projectile } from '../models/combat';
import { ItemDrop } from '../models/item';
import { AilmentType } from '../models/ailment';
import { FloatingDamage } from '../viewmodels/useGameLoop';

interface ArenaViewProps {
    player: PlayerPokemon | null;
    enemies: Enemy[];
    projectiles: Projectile[];
    items: ItemDrop[];
    floatingDamages: FloatingDamage[];
    targetEnemyId: string | null;
    isBlazeActive: boolean;
    playerAilment: AilmentType;
    enemyAilments: Record<string, AilmentType>;
    scale: number;
}

export function ArenaView({
    player,
    enemies,
    projectiles,
    items,
    floatingDamages,
    targetEnemyId,
    isBlazeActive,
    playerAilment,
    enemyAilments,
    scale,
}: ArenaViewProps) {
    const isDashing = player?.state === 'dashing';

    const getAilmentColor = (type: AilmentType) => {
        if (type === 'burn') return GAME_CONFIG.COLORS.AILMENT_BURN;
        if (type === 'paralysis') return GAME_CONFIG.COLORS.AILMENT_PARALYSIS;
        if (type === 'poison') return GAME_CONFIG.COLORS.AILMENT_POISON;
        return 'transparent';
    };

    return (
        <View style={styles.arenaContainer}>
            <View style={styles.gridOverlay} />

            {items.map(item => {
                const size = GAME_CONFIG.ITEMS.SPRITE_SIZE * scale;
                return (
                    <View
                        key={item.id}
                        style={[
                            styles.itemContainer,
                            {
                                left: item.x * scale - size / 2,
                                top: item.y * scale - size / 2,
                                width: size,
                                height: size,
                            },
                        ]}
                    >
                        <Image
                            source={{ uri: item.spriteUrl }}
                            style={{ width: size, height: size }}
                            resizeMode="contain"
                        />
                    </View>
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
                const ailment = enemyAilments[enemy.id] ?? 'none';
                const hasAilment = ailment !== 'none';

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
                        <View
                            style={[
                                styles.hitboxRing,
                                {
                                    width: size,
                                    height: size,
                                    borderRadius: size / 2,
                                    borderColor: isTargeted
                                        ? GAME_CONFIG.COLORS.CRITICAL_TEXT
                                        : hasAilment
                                            ? getAilmentColor(ailment)
                                            : GAME_CONFIG.COLORS.HITBOX_ENEMY,
                                },
                            ]}
                        />
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

                        {enemy.spriteUrl ? (
                            <Image
                                source={{ uri: enemy.spriteUrl }}
                                style={{ width: size * 1.1, height: size * 1.1 }}
                                resizeMode="contain"
                            />
                        ) : (
                            <View
                                style={[
                                    styles.enemyFallback,
                                    { width: size * 0.8, height: size * 0.8, borderRadius: (size * 0.8) / 2 },
                                ]}
                            >
                                <Text style={[styles.enemyName, { fontSize: Math.max(7, 8 * scale) }]}>
                                    {enemy.name.slice(0, 4)}
                                </Text>
                            </View>
                        )}
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
                            styles.hitboxRing,
                            {
                                width: GAME_CONFIG.PHYSICS.PLAYER_RADIUS * 2 * scale,
                                height: GAME_CONFIG.PHYSICS.PLAYER_RADIUS * 2 * scale,
                                borderRadius: GAME_CONFIG.PHYSICS.PLAYER_RADIUS * scale,
                                borderColor: isDashing
                                    ? GAME_CONFIG.COLORS.CRITICAL_TEXT
                                    : isBlazeActive
                                        ? GAME_CONFIG.COLORS.BLAZE_AURA
                                        : playerAilment !== 'none'
                                            ? getAilmentColor(playerAilment)
                                            : GAME_CONFIG.COLORS.HITBOX_PLAYER,
                                borderStyle: isDashing ? 'solid' : 'dashed',
                            },
                        ]}
                    />
                    {player.spriteUrl ? (
                        <Image
                            source={{ uri: player.spriteUrl }}
                            style={{
                                width: GAME_CONFIG.PHYSICS.PLAYER_RADIUS * 2.2 * scale,
                                height: GAME_CONFIG.PHYSICS.PLAYER_RADIUS * 2.2 * scale,
                                opacity: isDashing ? 0.75 : 1,
                            }}
                            resizeMode="contain"
                        />
                    ) : (
                        <View
                            style={[
                                styles.playerFallback,
                                {
                                    width: GAME_CONFIG.PHYSICS.PLAYER_RADIUS * 1.6 * scale,
                                    height: GAME_CONFIG.PHYSICS.PLAYER_RADIUS * 1.6 * scale,
                                    borderRadius: GAME_CONFIG.PHYSICS.PLAYER_RADIUS * 0.8 * scale,
                                },
                            ]}
                        >
                            <Text style={[styles.playerName, { fontSize: Math.max(8, 9 * scale) }]}>
                                {player.name.slice(0, 5)}
                            </Text>
                        </View>
                    )}
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
    itemContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    hitboxRing: {
        position: 'absolute',
        borderWidth: 1.5,
    },
    projectile: {
        position: 'absolute',
        backgroundColor: GAME_CONFIG.COLORS.CYAN_ACCENT,
        borderWidth: 1,
        borderColor: GAME_CONFIG.COLORS.TEXT_PRIMARY,
    },
    enemyContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
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
    enemyFallback: {
        backgroundColor: GAME_CONFIG.COLORS.ARENA_FLOOR,
        borderWidth: 2,
        borderColor: GAME_CONFIG.COLORS.ARENA_BORDER,
        justifyContent: 'center',
        alignItems: 'center',
    },
    enemyName: {
        color: GAME_CONFIG.COLORS.TEXT_SECONDARY,
        fontWeight: '800',
    },
    playerContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    playerFallback: {
        backgroundColor: GAME_CONFIG.COLORS.BUTTON_BG,
        borderWidth: 2.5,
        borderColor: GAME_CONFIG.COLORS.CYAN_ACCENT,
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