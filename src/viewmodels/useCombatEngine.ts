import { useCallback } from 'react';
import { GAME_CONFIG } from '../config/gameConfig';
import { PokemonType, SkillDefinition, SkillSlot, Projectile, DamageResult, DamageEffectiveness } from '../models/combat';
import { Position } from '../models/pokemon';

export function useCombatEngine() {
    const calculateDamage = useCallback((
        moveType: PokemonType,
        targetType: PokemonType,
        movePower: number,
        attackStat: number,
        defenseStat: number
    ): DamageResult => {
        const typeTable = GAME_CONFIG.TYPE_ADVANTAGE as Record<string, Record<string, number>>;
        const multiplier = typeTable[moveType]?.[targetType] ?? GAME_CONFIG.COMBAT.NEUTRAL_MULTIPLIER;

        let effectiveness: DamageEffectiveness = 'neutral';
        if (multiplier >= GAME_CONFIG.COMBAT.EFFECTIVE_MULTIPLIER) {
            effectiveness = 'super_effective';
        } else if (multiplier <= GAME_CONFIG.COMBAT.IMMUNE_MULTIPLIER) {
            effectiveness = 'immune';
        } else if (multiplier <= GAME_CONFIG.COMBAT.RESISTED_MULTIPLIER) {
            effectiveness = 'resisted';
        }

        const baseCalculation = (attackStat / Math.max(1, defenseStat)) * movePower * 0.4;
        const finalDamage = Math.max(1, Math.round(baseCalculation * multiplier));

        return {
            finalDamage,
            effectiveness,
            isCritical: multiplier >= GAME_CONFIG.COMBAT.EFFECTIVE_MULTIPLIER,
            multiplier,
        };
    }, []);

    const createProjectile = useCallback((
        slot: SkillSlot,
        skill: SkillDefinition,
        position: Position,
        targetAngle: number
    ): Projectile => {
        const vx = Math.cos(targetAngle) * skill.projectileSpeed;
        const vy = Math.sin(targetAngle) * skill.projectileSpeed;

        return {
            id: `${slot}-${Date.now()}-${Math.random()}`,
            ownerId: 'player',
            x: position.x,
            y: position.y,
            vx,
            vy,
            radius: skill.radius,
            damage: skill.power,
            type: skill.type,
            maxDistance: skill.range,
            distanceTraveled: 0,
        };
    }, []);

    return {
        calculateDamage,
        createProjectile,
    };
}