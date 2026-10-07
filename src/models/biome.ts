export type BiomeId = 'viridian_forest' | 'mt_moon' | 'lavender_tower' | 'distortion_core';

export interface BiomeConfig {
    id: BiomeId;
    name: string;
    region: string;
    waveStart: number;
    waveEnd: number;
    floorColor: string;
    borderColor: string;
    accentColor: string;
}

export interface PokemonNature {
    name: string;
    tag: string;
    attackMultiplier: number;
    specialAttackMultiplier: number;
    speedMultiplier: number;
    defenseMultiplier: number;
}