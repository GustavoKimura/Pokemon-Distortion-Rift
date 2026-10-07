import { GAME_CONFIG } from '../config/gameConfig';
import { EvolutionStage } from '../models/item';

const EVOLUTION_REGISTRY: Record<number, EvolutionStage[]> = {
    1: [
        {
            pokedexId: 2,
            name: 'IVYSAUR',
            targetWave: GAME_CONFIG.EVOLUTION.STAGE_2_WAVE,
            primaryType: 'grass',
            secondaryType: 'poison',
            height: 10,
            weight: 130,
            spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/2.gif',
            hpBonus: 75,
            attackBonus: 16,
            specialAttackBonus: 18,
        },
        {
            pokedexId: 3,
            name: 'VENUSAUR',
            targetWave: GAME_CONFIG.EVOLUTION.STAGE_3_WAVE,
            primaryType: 'grass',
            secondaryType: 'poison',
            height: 20,
            weight: 1000,
            spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/3.gif',
            hpBonus: 130,
            attackBonus: 24,
            specialAttackBonus: 32,
        },
    ],
    4: [
        {
            pokedexId: 5,
            name: 'CHARMELEON',
            targetWave: GAME_CONFIG.EVOLUTION.STAGE_2_WAVE,
            primaryType: 'fire',
            height: 11,
            weight: 190,
            spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/5.gif',
            hpBonus: 80,
            attackBonus: 18,
            specialAttackBonus: 20,
        },
        {
            pokedexId: 6,
            name: 'CHARIZARD',
            targetWave: GAME_CONFIG.EVOLUTION.STAGE_3_WAVE,
            primaryType: 'fire',
            secondaryType: 'flying',
            height: 17,
            weight: 905,
            spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/6.gif',
            hpBonus: 140,
            attackBonus: 26,
            specialAttackBonus: 35,
        },
    ],
    7: [
        {
            pokedexId: 8,
            name: 'WARTORTLE',
            targetWave: GAME_CONFIG.EVOLUTION.STAGE_2_WAVE,
            primaryType: 'water',
            height: 10,
            weight: 225,
            spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/8.gif',
            hpBonus: 85,
            attackBonus: 15,
            specialAttackBonus: 17,
        },
        {
            pokedexId: 9,
            name: 'BLASTOISE',
            targetWave: GAME_CONFIG.EVOLUTION.STAGE_3_WAVE,
            primaryType: 'water',
            height: 16,
            weight: 855,
            spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/9.gif',
            hpBonus: 150,
            attackBonus: 23,
            specialAttackBonus: 28,
        },
    ],
    25: [
        {
            pokedexId: 26,
            name: 'RAICHU',
            targetWave: GAME_CONFIG.EVOLUTION.STAGE_3_WAVE,
            primaryType: 'electric',
            height: 8,
            weight: 300,
            spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/26.gif',
            hpBonus: 110,
            attackBonus: 30,
            specialAttackBonus: 30,
        },
    ],
};

export const evolutionService = {
    checkEvolution(currentPokedexId: number, currentWave: number): EvolutionStage | null {
        const chain = EVOLUTION_REGISTRY[currentPokedexId];
        if (!chain) return null;

        for (const stage of chain) {
            if (currentWave >= stage.targetWave) {
                return stage;
            }
        }
        return null;
    },
};