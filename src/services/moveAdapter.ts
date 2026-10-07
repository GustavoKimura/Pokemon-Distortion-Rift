import { GAME_CONFIG } from '../config/gameConfig';
import { PokemonType, SkillDefinition, SkillSlot, DamageClass } from '../models/combat';
import { PokeApiMoveResponse } from '../models/api';

const SLOT_COOLDOWNS: Record<SkillSlot, number> = {
    basic: GAME_CONFIG.COMBAT.ATTACK_COOLDOWN_MS,
    skill1: GAME_CONFIG.COMBAT.SKILL_1_COOLDOWN_MS,
    skill2: GAME_CONFIG.COMBAT.SKILL_2_COOLDOWN_MS,
    dash: GAME_CONFIG.PHYSICS.DASH_COOLDOWN_MS,
    ultimate: GAME_CONFIG.COMBAT.SKILL_2_COOLDOWN_MS,
};

export function adaptPokeApiMove(
    dto: PokeApiMoveResponse,
    slot: SkillSlot
): SkillDefinition {
    const basePower = dto.power ?? 45;
    const cooldownMs = SLOT_COOLDOWNS[slot];
    const type = dto.type.name as PokemonType;
    const damageClass = (dto.damage_class?.name as DamageClass) ?? 'special';
    const accuracy = dto.accuracy ?? 100;

    return {
        id: String(dto.id),
        name: dto.name.toUpperCase().replace('-', ' '),
        slot,
        type,
        power: basePower,
        cooldownMs,
        range: GAME_CONFIG.PHYSICS.PROJECTILE_BASE_SPEED * (cooldownMs / 1000),
        radius: GAME_CONFIG.PHYSICS.PROJECTILE_RADIUS,
        projectileSpeed: GAME_CONFIG.PHYSICS.PROJECTILE_BASE_SPEED,
        damageClass,
        accuracy,
    };
}

export function createDefaultSkill(
    slot: SkillSlot,
    type: PokemonType,
    name: string,
    power: number,
    damageClass: DamageClass = 'special'
): SkillDefinition {
    const cooldownMs = SLOT_COOLDOWNS[slot];

    return {
        id: `${slot}-${name.toLowerCase()}`,
        name,
        slot,
        type,
        power,
        cooldownMs,
        range: GAME_CONFIG.PHYSICS.PROJECTILE_BASE_SPEED * (cooldownMs / 1000),
        radius: GAME_CONFIG.PHYSICS.PROJECTILE_RADIUS,
        projectileSpeed: GAME_CONFIG.PHYSICS.PROJECTILE_BASE_SPEED,
        damageClass,
        accuracy: 100,
    };
}

export function getDefaultStarterSkills(type: PokemonType): Record<SkillSlot, SkillDefinition> {
    if (type === 'water') {
        return {
            basic: createDefaultSkill('basic', 'water', 'WATER GUN', 40, 'special'),
            skill1: createDefaultSkill('skill1', 'water', 'BUBBLE BEAM', 70, 'special'),
            skill2: createDefaultSkill('skill2', 'water', 'AQUA JET', 60, 'physical'),
            dash: createDefaultSkill('dash', 'water', 'RAPID SPIN', 0, 'physical'),
            ultimate: createDefaultSkill('ultimate', 'water', 'HYDRO PUMP', 135, 'special'),
        };
    }

    if (type === 'grass') {
        return {
            basic: createDefaultSkill('basic', 'grass', 'VINE WHIP', 45, 'physical'),
            skill1: createDefaultSkill('skill1', 'grass', 'RAZOR LEAF', 65, 'physical'),
            skill2: createDefaultSkill('skill2', 'grass', 'SLUDGE BOMB', 80, 'special'),
            dash: createDefaultSkill('dash', 'grass', 'TAKE DOWN', 0, 'physical'),
            ultimate: createDefaultSkill('ultimate', 'grass', 'SOLAR BEAM', 150, 'special'),
        };
    }

    if (type === 'electric') {
        return {
            basic: createDefaultSkill('basic', 'electric', 'THUNDER SHOCK', 40, 'special'),
            skill1: createDefaultSkill('skill1', 'electric', 'SPARK', 65, 'physical'),
            skill2: createDefaultSkill('skill2', 'electric', 'DISCHARGE', 80, 'special'),
            dash: createDefaultSkill('dash', 'electric', 'QUICK ATTACK', 0, 'physical'),
            ultimate: createDefaultSkill('ultimate', 'electric', 'THUNDER', 140, 'special'),
        };
    }

    return {
        basic: createDefaultSkill('basic', 'fire', 'EMBER', 45, 'special'),
        skill1: createDefaultSkill('skill1', 'fire', 'FLAMETHROWER', 85, 'special'),
        skill2: createDefaultSkill('skill2', 'fire', 'FIRE SPIN', 60, 'special'),
        dash: createDefaultSkill('dash', 'fire', 'FLAME CHARGE', 0, 'physical'),
        ultimate: createDefaultSkill('ultimate', 'fire', 'FIRE BLAST', 140, 'special'),
    };
}