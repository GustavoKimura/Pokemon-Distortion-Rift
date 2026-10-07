import { GAME_CONFIG } from '../config/gameConfig';
import { BiomeConfig, PokemonNature, BiomeId } from '../models/biome';
import { PokemonType } from '../models/combat';

export interface EnemyTemplate {
    pokedexId: number;
    name: string;
    type: PokemonType;
    maxHp: number;
    attack: number;
    defense: number;
    specialDefense: number;
    weight: number;
    height: number;
    spriteUrl: string;
}

const BIOME_DEFINITIONS: BiomeConfig[] = [
    {
        id: 'viridian_forest',
        name: 'VIRIDIAN FOREST',
        region: 'KANTO REGION',
        waveStart: 1,
        waveEnd: 2,
        floorColor: '#14281D',
        borderColor: '#2D6A4F',
        accentColor: '#52B788',
    },
    {
        id: 'mt_moon',
        name: 'MT. MOON CAVERN',
        region: 'KANTO REGION',
        waveStart: 3,
        waveEnd: 4,
        floorColor: '#242026',
        borderColor: '#5A4E63',
        accentColor: '#A390B5',
    },
    {
        id: 'lavender_tower',
        name: 'POKEMON TOWER',
        region: 'KANTO REGION',
        waveStart: 5,
        waveEnd: 6,
        floorColor: '#1A1426',
        borderColor: '#483569',
        accentColor: '#8E67D1',
    },
    {
        id: 'distortion_core',
        name: 'DISTORTION RIFT CORE',
        region: 'SINNOH ANOMALY',
        waveStart: 7,
        waveEnd: 99,
        floorColor: '#1F2833',
        borderColor: '#45A29E',
        accentColor: '#66FCF1',
    },
];

const BIOME_ROSTERS: Record<BiomeId, EnemyTemplate[]> = {
    viridian_forest: [
        { pokedexId: 10, name: 'CATERPIE', type: 'bug', maxHp: 65, attack: 35, defense: 35, specialDefense: 20, weight: 29, height: 3, spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/10.gif' },
        { pokedexId: 13, name: 'WEEDLE', type: 'bug', maxHp: 65, attack: 40, defense: 30, specialDefense: 20, weight: 32, height: 3, spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/13.gif' },
        { pokedexId: 16, name: 'PIDGEY', type: 'normal', maxHp: 75, attack: 45, defense: 40, specialDefense: 35, weight: 18, height: 3, spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/16.gif' },
        { pokedexId: 19, name: 'RATTATA', type: 'normal', maxHp: 80, attack: 56, defense: 35, specialDefense: 35, weight: 35, height: 3, spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/19.gif' },
    ],
    mt_moon: [
        { pokedexId: 74, name: 'GEODUDE', type: 'rock', maxHp: 110, attack: 70, defense: 90, specialDefense: 30, weight: 200, height: 4, spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/74.gif' },
        { pokedexId: 41, name: 'ZUBAT', type: 'poison', maxHp: 95, attack: 45, defense: 35, specialDefense: 40, weight: 75, height: 8, spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/41.gif' },
        { pokedexId: 46, name: 'PARAS', type: 'bug', maxHp: 85, attack: 65, defense: 55, specialDefense: 55, weight: 54, height: 3, spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/46.gif' },
        { pokedexId: 95, name: 'ONIX', type: 'rock', maxHp: 240, attack: 45, defense: 160, specialDefense: 45, weight: 2100, height: 88, spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/95.gif' },
    ],
    lavender_tower: [
        { pokedexId: 92, name: 'GASTLY', type: 'ghost', maxHp: 110, attack: 35, defense: 30, specialDefense: 35, weight: 1, height: 13, spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/92.gif' },
        { pokedexId: 93, name: 'HAUNTER', type: 'ghost', maxHp: 140, attack: 50, defense: 45, specialDefense: 55, weight: 1, height: 16, spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/93.gif' },
        { pokedexId: 96, name: 'DROWZEE', type: 'psychic', maxHp: 130, attack: 48, defense: 45, specialDefense: 85, weight: 324, height: 10, spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/96.gif' },
        { pokedexId: 94, name: 'GENGAR', type: 'ghost', maxHp: 220, attack: 65, defense: 60, specialDefense: 75, weight: 405, height: 15, spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/94.gif' },
    ],
    distortion_core: [
        { pokedexId: 92, name: 'VOID GASTLY', type: 'ghost', maxHp: 120, attack: 40, defense: 35, specialDefense: 40, weight: 1, height: 13, spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/92.gif' },
        { pokedexId: 95, name: 'VOID ONIX', type: 'rock', maxHp: 260, attack: 50, defense: 170, specialDefense: 50, weight: 2100, height: 88, spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/95.gif' },
        { pokedexId: 487, name: 'GIRATINA', type: 'ghost', maxHp: 450, attack: 110, defense: 100, specialDefense: 100, weight: 6500, height: 69, spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/487.gif' },
    ],
};

const NATURE_POOL: PokemonNature[] = [
    { name: 'ADAMANT', tag: '+ATK / -SP.ATK', attackMultiplier: GAME_CONFIG.NATURES.STAT_BOOST, specialAttackMultiplier: GAME_CONFIG.NATURES.STAT_NERF, speedMultiplier: 1, defenseMultiplier: 1 },
    { name: 'MODEST', tag: '+SP.ATK / -ATK', attackMultiplier: GAME_CONFIG.NATURES.STAT_NERF, specialAttackMultiplier: GAME_CONFIG.NATURES.STAT_BOOST, speedMultiplier: 1, defenseMultiplier: 1 },
    { name: 'JOLLY', tag: '+SPD / -SP.ATK', attackMultiplier: 1, specialAttackMultiplier: GAME_CONFIG.NATURES.STAT_NERF, speedMultiplier: GAME_CONFIG.NATURES.STAT_BOOST, defenseMultiplier: 1 },
    { name: 'TIMID', tag: '+SPD / -ATK', attackMultiplier: GAME_CONFIG.NATURES.STAT_NERF, specialAttackMultiplier: 1, speedMultiplier: GAME_CONFIG.NATURES.STAT_BOOST, defenseMultiplier: 1 },
    { name: 'HARDY', tag: 'BALANCED', attackMultiplier: 1, specialAttackMultiplier: 1, speedMultiplier: 1, defenseMultiplier: 1 },
];

export const biomeService = {
    getCurrentBiome(wave: number): BiomeConfig {
        return BIOME_DEFINITIONS.find(b => wave >= b.waveStart && wave <= b.waveEnd) ?? BIOME_DEFINITIONS[3];
    },
    getEnemiesForBiome(biomeId: BiomeId): EnemyTemplate[] {
        return BIOME_ROSTERS[biomeId] ?? BIOME_ROSTERS.viridian_forest;
    },
    getRandomNature(): PokemonNature {
        return NATURE_POOL[Math.floor(Math.random() * NATURE_POOL.length)];
    },
};