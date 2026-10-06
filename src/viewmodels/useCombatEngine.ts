import { useState, useCallback } from 'react';
import { GAME_CONFIG } from '../config/gameConfig';
import { PokemonType, SkillDefinition, SkillSlot, Projectile, DamageResult, DamageEffectiveness } from '../models/combat';
import { Position } from '../models/pokemon';

export function useCombatEngine() {
    const [cooldowns, setCooldowns] = useState<Record<SkillSlot, number>>({
        basic: 0,
        skill1: 0,
        skill2: 0,
        dash: 0,
        ultimate: 0,
    });

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

    const updateCooldowns = useCallback((deltaTimeMs: number) => {
        setCooldowns(prev => ({
            basic: Math.max(0, prev.basic - deltaTimeMs),
            skill1: Math.max(0, prev.skill1 - deltaTimeMs),
            skill2: Math.max(0, prev.skill2 - deltaTimeMs),
            dash: Math.max(0, prev.dash - deltaTimeMs),
            ultimate: Math.max(0, prev.ultimate - deltaTimeMs),
        }));
    }, []);

    const triggerSkill = useCallback((
        slot: SkillSlot,
        skill: SkillDefinition,
        position: Position,
        facingAngle: number
    ): Projectile | null => {
        if (cooldowns[slot] > 0) {
            return null;
        }

        setCooldowns(prev => ({
            ...prev,
            [slot]: skill.cooldownMs,
        }));

        if (slot === 'dash') {
            return null;
        }

        const vx = Math.cos(facingAngle) * skill.projectileSpeed;
        const vy = Math.sin(facingAngle) * skill.projectileSpeed;

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
    }, [cooldowns]);

    return {
        cooldowns,
        calculateDamage,
        updateCooldowns,
        triggerSkill,
    };
}