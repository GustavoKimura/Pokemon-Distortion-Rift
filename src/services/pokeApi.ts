import { GAME_CONFIG } from '../config/gameConfig';
import { PlayerPokemon, PokemonStats } from '../models/pokemon';
import { PokemonType, SkillDefinition, SkillSlot } from '../models/combat';
import { PokeApiPokemonResponse, PokeApiMoveResponse } from '../models/api';
import { adaptPokeApiMove, getDefaultStarterSkills } from './moveAdapter';

const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';

class PokeApiService {
    private pokemonCache = new Map<string, PlayerPokemon>();
    private moveCache = new Map<string, PokeApiMoveResponse>();

    async fetchPokemon(identifier: string | number): Promise<PlayerPokemon> {
        const key = String(identifier).toLowerCase();
        const cached = this.pokemonCache.get(key);
        if (cached) {
            return cached;
        }

        try {
            const response = await fetch(`${POKEAPI_BASE_URL}/pokemon/${key}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch pokemon: ${response.status}`);
            }
            const data: PokeApiPokemonResponse = await response.json();
            const pokemon = await this.transformPokemon(data);
            this.pokemonCache.set(key, pokemon);
            this.pokemonCache.set(String(data.id), pokemon);
            return pokemon;
        } catch {
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
            attack: statsMap.attack ?? 50,
            defense: statsMap.defense ?? 50,
            speed: statsMap.speed ?? 50,
        };

        const skills = await this.resolveSkills(data.moves, primaryType);

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
            skills,
            invulnerableUntilMs: 0,
        };
    }

    private async resolveSkills(
        moves: PokeApiPokemonResponse['moves'],
        primaryType: PokemonType
    ): Promise<Record<SkillSlot, SkillDefinition>> {
        const defaultSkills = getDefaultStarterSkills(primaryType);
        if (!moves || moves.length === 0) {
            return defaultSkills;
        }

        const slots: SkillSlot[] = ['basic', 'skill1', 'skill2'];
        const resolvedSkills = { ...defaultSkills };

        const selectedMoves = moves.slice(0, slots.length);
        for (let i = 0; i < selectedMoves.length; i++) {
            const slot = slots[i];
            const moveName = selectedMoves[i].move.name;
            try {
                const moveData = await this.fetchMove(moveName);
                resolvedSkills[slot] = adaptPokeApiMove(moveData, slot);
            } catch {
                resolvedSkills[slot] = defaultSkills[slot];
            }
        }

        return resolvedSkills;
    }

    private async fetchMove(moveName: string): Promise<PokeApiMoveResponse> {
        const cached = this.moveCache.get(moveName);
        if (cached) {
            return cached;
        }

        const response = await fetch(`${POKEAPI_BASE_URL}/move/${moveName}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch move: ${response.status}`);
        }
        const data: PokeApiMoveResponse = await response.json();
        this.moveCache.set(moveName, data);
        return data;
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
        };
    }
}

export const pokeApiService = new PokeApiService();