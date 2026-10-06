import { useState, useCallback } from 'react';
import { GAME_CONFIG } from '../config/gameConfig';
import { Enemy } from '../models/enemy';
import { Position } from '../models/pokemon';
import { PokemonType } from '../models/combat';

const ENEMY_CATALOG: Array<{ pokedexId: number; name: string; type: PokemonType; maxHp: number; damage: number }> = [
    { pokedexId: 19, name: 'RATTATA', type: 'normal', maxHp: 80, damage: 12 },
    { pokedexId: 41, name: 'ZUBAT', type: 'poison', maxHp: 95, damage: 15 },
    { pokedexId: 92, name: 'GASTLY', type: 'ghost', maxHp: 110, damage: 18 },
    { pokedexId: 95, name: 'ONIX', type: 'rock', maxHp: 240, damage: 24 },
];

export function useEnemySpawner() {
    const [enemies, setEnemies] = useState<Enemy[]>([]);
    const [currentWave, setCurrentWave] = useState(1);
    const [spawnTimer, setSpawnTimer] = useState(0);

    const spawnRandomEnemy = useCallback((waveIndex: number): Enemy => {
        const templateIndex = Math.min(
            Math.floor(Math.random() * ENEMY_CATALOG.length),
            ENEMY_CATALOG.length - 1
        );
        const template = ENEMY_CATALOG[templateIndex];
        const isBoss = waveIndex % 5 === 0 && Math.random() < 0.25;

        const side = Math.floor(Math.random() * 4);
        let x = GAME_CONFIG.PHYSICS.BOUNDARY_PADDING;
        let y = GAME_CONFIG.PHYSICS.BOUNDARY_PADDING;

        if (side === 0) {
            x = Math.random() * GAME_CONFIG.VIEWPORT.LOGICAL_WIDTH;
            y = GAME_CONFIG.PHYSICS.BOUNDARY_PADDING;
        } else if (side === 1) {
            x = GAME_CONFIG.VIEWPORT.LOGICAL_WIDTH - GAME_CONFIG.PHYSICS.BOUNDARY_PADDING;
            y = Math.random() * GAME_CONFIG.VIEWPORT.LOGICAL_HEIGHT;
        } else if (side === 2) {
            x = Math.random() * GAME_CONFIG.VIEWPORT.LOGICAL_WIDTH;
            y = GAME_CONFIG.PHYSICS.BOUNDARY_HEIGHT;
        } else {
            x = GAME_CONFIG.PHYSICS.BOUNDARY_PADDING;
            y = Math.random() * GAME_CONFIG.VIEWPORT.LOGICAL_HEIGHT;
        }

        const hpMultiplier = 1 + (waveIndex - 1) * 0.15;
        const maxHp = Math.round(template.maxHp * hpMultiplier * (isBoss ? 2.5 : 1.0));

        return {
            id: `enemy-${Date.now()}-${Math.random()}`,
            pokedexId: template.pokedexId,
            name: isBoss ? `ALPHA ${template.name}` : template.name,
            type: template.type,
            maxHp,
            currentHp: maxHp,
            position: { x, y },
            velocity: { vx: 0, vy: 0 },
            speed: isBoss ? GAME_CONFIG.PHYSICS.ENEMY_BASE_SPEED * 0.8 : GAME_CONFIG.PHYSICS.ENEMY_BASE_SPEED,
            radius: isBoss ? GAME_CONFIG.PHYSICS.ENEMY_RADIUS * 1.6 : GAME_CONFIG.PHYSICS.ENEMY_RADIUS,
            attackDamage: Math.round(template.damage * hpMultiplier),
            isBoss,
            state: 'chasing',
        };
    }, []);

    const updateEnemies = useCallback((
        playerPosition: Position,
        deltaTimeMs: number
    ) => {
        const deltaSeconds = deltaTimeMs / 1000;

        setSpawnTimer(prev => {
            const nextTimer = prev + deltaTimeMs;
            if (nextTimer >= 2200 && enemies.length < 10) {
                setEnemies(current => [...current, spawnRandomEnemy(currentWave)]);
                return 0;
            }
            return nextTimer;
        });

        setEnemies(prevEnemies =>
            prevEnemies.map(enemy => {
                const dx = playerPosition.x - enemy.position.x;
                const dy = playerPosition.y - enemy.position.y;
                const distance = Math.hypot(dx, dy);

                if (distance <= 1) {
                    return enemy;
                }

                const vx = (dx / distance) * enemy.speed;
                const vy = (dy / distance) * enemy.speed;

                const nextX = Math.min(
                    GAME_CONFIG.VIEWPORT.LOGICAL_WIDTH - GAME_CONFIG.PHYSICS.BOUNDARY_PADDING,
                    Math.max(GAME_CONFIG.PHYSICS.BOUNDARY_PADDING, enemy.position.x + vx * deltaSeconds)
                );
                const nextY = Math.min(
                    GAME_CONFIG.VIEWPORT.LOGICAL_HEIGHT - GAME_CONFIG.PHYSICS.BOUNDARY_PADDING,
                    Math.max(GAME_CONFIG.PHYSICS.BOUNDARY_PADDING, enemy.position.y + vy * deltaSeconds)
                );

                return {
                    ...enemy,
                    position: { x: nextX, y: nextY },
                    velocity: { vx, vy },
                };
            })
        );
    }, [enemies.length, currentWave, spawnRandomEnemy]);

    const damageEnemy = useCallback((enemyId: string, damage: number) => {
        let killed = false;
        let targetEnemy: Enemy | null = null;

        setEnemies(prev =>
            prev.flatMap(enemy => {
                if (enemy.id !== enemyId) {
                    return [enemy];
                }
                targetEnemy = enemy;
                const remainingHp = enemy.currentHp - damage;
                if (remainingHp <= 0) {
                    killed = true;
                    return [];
                }
                return [{ ...enemy, currentHp: remainingHp, state: 'hit' }];
            })
        );

        return { killed, enemy: targetEnemy };
    }, []);

    const advanceWave = useCallback(() => {
        setCurrentWave(prev => prev + 1);
    }, []);

    const resetEnemies = useCallback(() => {
        setEnemies([]);
        setCurrentWave(1);
        setSpawnTimer(0);
    }, []);

    return {
        enemies,
        currentWave,
        updateEnemies,
        damageEnemy,
        advanceWave,
        resetEnemies,
    };
}