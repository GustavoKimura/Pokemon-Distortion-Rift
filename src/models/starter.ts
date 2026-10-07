import { PokemonType } from './combat';

export interface StarterOption {
    pokedexId: number;
    name: string;
    type: PokemonType;
    secondaryType?: PokemonType;
    spriteUrl: string;
    abilityName: string;
    description: string;
}

export interface MetaTalents {
    vigor: number;
    fury: number;
    agility: number;
    mastery: number;
}