export type PokemonType =
    | 'normal'
    | 'fire'
    | 'water'
    | 'grass'
    | 'electric'
    | 'ice'
    | 'fighting'
    | 'poison'
    | 'ground'
    | 'flying'
    | 'psychic'
    | 'bug'
    | 'rock'
    | 'ghost'
    | 'dragon'
    | 'steel'
    | 'fairy';

export type SkillSlot = 'basic' | 'skill1' | 'skill2' | 'dash' | 'ultimate';

export type DamageClass = 'physical' | 'special' | 'status';

export interface SkillDefinition {
    id: string;
    name: string;
    slot: SkillSlot;
    type: PokemonType;
    power: number;
    cooldownMs: number;
    range: number;
    radius: number;
    projectileSpeed: number;
    damageClass: DamageClass;
    accuracy: number;
}

export interface Projectile {
    id: string;
    ownerId: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    damage: number;
    type: PokemonType;
    damageClass: DamageClass;
    maxDistance: number;
    distanceTraveled: number;
}

export type DamageEffectiveness =
    | 'super_effective'
    | 'neutral'
    | 'resisted'
    | 'immune';

export interface DamageResult {
    finalDamage: number;
    effectiveness: DamageEffectiveness;
    isCritical: boolean;
    multiplier: number;
}