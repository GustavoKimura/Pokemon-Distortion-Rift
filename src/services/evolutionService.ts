import { GAME_CONFIG } from '../config/gameConfig';
import { EvolutionStage } from '../models/item';

const CHARMANDER_LINE: EvolutionStage[] = [
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
];

export const evolutionService = {
    checkEvolution(currentPokedexId: number, currentWave: number): EvolutionStage | null {
        if (currentPokedexId === 4 && currentWave >= GAME_CONFIG.EVOLUTION.STAGE_2_WAVE) {
            return CHARMANDER_LINE[0];
        }
        if (currentPokedexId === 5 && currentWave >= GAME_CONFIG.EVOLUTION.STAGE_3_WAVE) {
            return CHARMANDER_LINE[1];
        }
        return null;
    },
};