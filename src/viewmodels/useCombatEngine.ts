import { useCallback } from 'react';
import { GAME_CONFIG } from '../config/gameConfig';
import { PokemonType, SkillDefinition, SkillSlot, Projectile, DamageResult, DamageEffectiveness, DamageClass } from '../models/combat';
import { Position } from '../models/pokemon';
import { AilmentType, ActiveAilment } from '../models/ailment';
import { logger } from '../utils/logger';

export function useCombatEngine() {
    const calculateDamage = useCallback((
        moveType: PokemonType,
        targetType: PokemonType,
        movePower: number,
        damageClass: DamageClass,
        attackerStats: { attack?: number; specialAttack?: number },
        targetStats: { defense?: number; specialDefense?: number }
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

        const offensiveStat = damageClass === 'physical'
            ? (attackerStats?.attack ?? 50)
            : (attackerStats?.specialAttack ?? 60);

        const defensiveStat = damageClass === 'physical'
            ? (targetStats?.defense ?? 40)
            : (targetStats?.specialDefense ?? 40);

        const baseCalculation = (offensiveStat / Math.max(1, defensiveStat)) * movePower * 0.4;
        const finalDamage = Math.max(1, Math.round(baseCalculation * multiplier));

        return {
            finalDamage,
            effectiveness,
            isCritical: multiplier >= GAME_CONFIG.COMBAT.EFFECTIVE_MULTIPLIER,
            multiplier,
        };
    }, []);

    const resolveAilmentProc = useCallback((moveType: PokemonType): ActiveAilment | null => {
        if (Math.random() > GAME_CONFIG.AILMENTS.PROC_CHANCE) return null;

        let type: AilmentType = 'none';
        let dps: number = 0;
        let interval: number = GAME_CONFIG.AILMENTS.BURN_TICK_INTERVAL_MS;

        if (moveType === 'fire') {
            type = 'burn';
            dps = GAME_CONFIG.AILMENTS.BURN_DAMAGE;
            interval = GAME_CONFIG.AILMENTS.BURN_TICK_INTERVAL_MS;
        } else if (moveType === 'electric') {
            type = 'paralysis';
            dps = 0;
        } else if (moveType === 'poison' || moveType === 'grass') {
            type = 'poison';
            dps = GAME_CONFIG.AILMENTS.POISON_DAMAGE;
            interval = GAME_CONFIG.AILMENTS.POISON_TICK_INTERVAL_MS;
        }

        if (type === 'none') return null;

        logger.info('COMBAT', `Ailment inflicted: ${type.toUpperCase()}`);

        return {
            type,
            durationMs: GAME_CONFIG.AILMENTS.DEFAULT_DURATION_MS,
            tickTimerMs: interval,
            damagePerTick: dps,
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
        resolveAilmentProc,
        createProjectile,
    };
}