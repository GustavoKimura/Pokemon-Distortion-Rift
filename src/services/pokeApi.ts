import { GAME_CONFIG } from '../config/gameConfig';
import { PlayerPokemon, PokemonStats } from '../models/pokemon';
import { PokemonType, SkillDefinition, SkillSlot } from '../models/combat';
import { PokeApiPokemonResponse, PokeApiMoveResponse } from '../models/api';
import { adaptPokeApiMove, getDefaultStarterSkills } from './moveAdapter';
import { logger } from '../utils/logger';

const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';

class PokeApiService {
    private pokemonCache = new Map<string, PlayerPokemon>();
    private moveCache = new Map<string, PokeApiMoveResponse>();

    async fetchPokemon(identifier: string | number): Promise<PlayerPokemon> {
        const key = String(identifier).toLowerCase();
        const cached = this.pokemonCache.get(key);
        if (cached) return cached;

        try {
            const response = await fetch(`${POKEAPI_BASE_URL}/pokemon/${key}`);
            if (!response.ok) throw new Error(`HTTP error ${response.status}`);
            const data: PokeApiPokemonResponse = await response.json();
            const pokemon = await this.transformPokemon(data);
            this.pokemonCache.set(key, pokemon);
            this.pokemonCache.set(String(data.id), pokemon);
            return pokemon;
        } catch {
            logger.warn('POKEAPI', `Offline fallback for ${key}`);
            return this.createFallbackPokemon(key);
        }
    }

    private async transformPokemon(data: PokeApiPokemonResponse): Promise<PlayerPokemon> {
        const primaryType = data.types[0].type.name as PokemonType;
        const secondaryType = data.types[1]
            ? (data.types[1].type.name as PokemonType)
            : undefined;

        const statsMap: Record<string, number> = {};
        for (const statSlot of data.stats) {
            statsMap[statSlot.stat.name] = statSlot.base_stat;
        }

        const maxHp = (statsMap.hp ?? 60) * 4;
        const stats: PokemonStats = {
            hp: maxHp,
            maxHp,
            attack: statsMap.attack ?? 52,
            defense: statsMap.defense ?? 43,
            specialAttack: statsMap['special-attack'] ?? 60,
            specialDefense: statsMap['special-defense'] ?? 50,
            speed: statsMap.speed ?? 65,
        };

        const spriteUrl =
            data.sprites.other?.showdown?.front_default ??
            data.sprites.other?.['official-artwork']?.front_default ??
            data.sprites.front_default ??
            '';

        const abilityName = data.abilities?.[0]?.ability?.name.toUpperCase();
        const cryUrl = data.cries?.latest;

        return {
            id: String(data.id),
            pokedexId: data.id,
            name: data.name.toUpperCase(),
            primaryType,
            secondaryType,
            stats,
            currentHp: maxHp,
            ultimateEnergy: 0,
            position: {
                x: GAME_CONFIG.VIEWPORT.LOGICAL_WIDTH / 2,
                y: GAME_CONFIG.VIEWPORT.LOGICAL_HEIGHT / 2,
            },
            velocity: { vx: 0, vy: 0 },
            facingAngle: 0,
            state: 'idle',
            skills: getDefaultStarterSkills(primaryType),
            invulnerableUntilMs: 0,
            height: data.height,
            weight: data.weight,
            spriteUrl,
            cryUrl,
            abilityName,
        };
    }

    private createFallbackPokemon(identifier: string): PlayerPokemon {
        const primaryType: PokemonType = 'fire';
        const maxHp = 300;
        return {
            id: identifier,
            pokedexId: 4,
            name: identifier.toUpperCase(),
            primaryType,
            stats: {
                hp: maxHp,
                maxHp,
                attack: 52,
                defense: 43,
                specialAttack: 60,
                specialDefense: 50,
                speed: 65,
            },
            currentHp: maxHp,
            ultimateEnergy: 0,
            position: {
                x: GAME_CONFIG.VIEWPORT.LOGICAL_WIDTH / 2,
                y: GAME_CONFIG.VIEWPORT.LOGICAL_HEIGHT / 2,
            },
            velocity: { vx: 0, vy: 0 },
            facingAngle: 0,
            state: 'idle',
            skills: getDefaultStarterSkills(primaryType),
            invulnerableUntilMs: 0,
            height: 6,
            weight: 85,
            spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/4.gif',
        };
    }
}

export const pokeApiService = new PokeApiService();