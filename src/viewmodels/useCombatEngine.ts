import { useCallback } from 'react';
import { GAME_CONFIG } from '../config/gameConfig';
import { PokemonType, SkillDefinition, SkillSlot, Projectile, DamageResult, DamageEffectiveness, DamageClass } from '../models/combat';
import { Position } from '../models/pokemon';
import { logger } from '../utils/logger';

export function useCombatEngine() {
    const calculateDamage = useCallback((
        moveType: PokemonType,
        targetType: PokemonType,
        movePower: number,
        damageClass: DamageClass,
        attackerStats: { attack: number; specialAttack: number },
        targetStats: { defense: number; specialDefense: number }
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

        const offensiveStat = damageClass === 'physical' ? attackerStats.attack : attackerStats.specialAttack;
        const defensiveStat = damageClass === 'physical' ? targetStats.defense : targetStats.specialDefense;

        const baseCalculation = (offensiveStat / Math.max(1, defensiveStat)) * movePower * 0.4;
        const finalDamage = Math.max(1, Math.round(baseCalculation * multiplier));

        logger.debug('COMBAT', `${damageClass.toUpperCase()} Hit: ${moveType} vs ${targetType} = ${finalDamage}`);

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
            damageClass: skill.damageClass,
            maxDistance: skill.range,
            distanceTraveled: 0,
        };
    }, []);

    return {
        calculateDamage,
        createProjectile,
    };
}