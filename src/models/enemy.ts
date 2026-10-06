import { PokemonType } from './combat';
import { Position, Velocity } from './pokemon';

export type EnemyState = 'chasing' | 'attacking' | 'hit' | 'defeated';

export interface Enemy {
    id: string;
    pokedexId: number;
    name: string;
    type: PokemonType;
    maxHp: number;
    currentHp: number;
    position: Position;
    velocity: Velocity;
    speed: number;
    radius: number;
    attackDamage: number;
    isBoss: boolean;
    state: EnemyState;
}

export interface WaveConfiguration {
    waveIndex: number;
    enemyPokedexIds: number[];
    totalEnemies: number;
    spawnIntervalMs: number;
    bossPokedexId?: number;
}