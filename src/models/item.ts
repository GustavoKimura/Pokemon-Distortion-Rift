export type ItemCategory = 'healing' | 'stat_boost';

export interface ItemDrop {
    id: string;
    name: string;
    category: ItemCategory;
    spriteUrl: string;
    x: number;
    y: number;
    healAmount?: number;
    damageMultiplier?: number;
}

export interface EvolutionStage {
    pokedexId: number;
    name: string;
    targetWave: number;
    primaryType: string;
    secondaryType?: string;
    height: number;
    weight: number;
    spriteUrl: string;
    hpBonus: number;
    attackBonus: number;
    specialAttackBonus: number;
}