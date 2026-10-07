import { PokemonType, SkillDefinition, SkillSlot } from './combat';
import { PokemonNature } from './biome';

export interface PokemonStats {
    hp: number;
    maxHp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
}

export type PokemonActionState =
    | 'idle'
    | 'walking'
    | 'dashing'
    | 'attacking'
    | 'stunned'
    | 'fainted';

export interface Position {
    x: number;
    y: number;
}

export interface Velocity {
    vx: number;
    vy: number;
}

export interface PlayerPokemon {
    id: string;
    pokedexId: number;
    name: string;
    primaryType: PokemonType;
    secondaryType?: PokemonType;
    stats: PokemonStats;
    currentHp: number;
    ultimateEnergy: number;
    position: Position;
    velocity: Velocity;
    facingAngle: number;
    state: PokemonActionState;
    skills: Record<SkillSlot, SkillDefinition>;
    invulnerableUntilMs: number;
    height: number;
    weight: number;
    spriteUrl: string;
    nature: PokemonNature;
    cryUrl?: string;
    abilityName?: string;
}