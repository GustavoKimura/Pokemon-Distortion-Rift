import { GAME_CONFIG } from '../config/gameConfig';
import { PokemonType, SkillDefinition, SkillSlot } from '../models/combat';
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
    const basePower = dto.power ?? 40;
    const cooldownMs = SLOT_COOLDOWNS[slot];
    const type = dto.type.name as PokemonType;

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
    };
}

export function createDefaultSkill(
    slot: SkillSlot,
    type: PokemonType,
    name: string,
    power: number
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
    };
}

export function getDefaultStarterSkills(type: PokemonType): Record<SkillSlot, SkillDefinition> {
    return {
        basic: createDefaultSkill('basic', 'normal', 'TACKLE', 35),
        skill1: createDefaultSkill('skill1', type, 'ELEMENTAL BURST', 65),
        skill2: createDefaultSkill('skill2', type, 'DISTORTION WAVE', 90),
        dash: createDefaultSkill('dash', 'normal', 'AGILITY DASH', 0),
        ultimate: createDefaultSkill('ultimate', type, 'DIMENSIONAL CATACLYSM', 180),
    };
}