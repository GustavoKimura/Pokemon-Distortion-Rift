import { useState, useEffect, useRef, useCallback } from 'react';
import { GAME_CONFIG } from '../config/gameConfig';
import { PlayerPokemon } from '../models/pokemon';
import { Projectile, SkillSlot } from '../models/combat';
import { pokeApiService } from '../services/pokeApi';
import { useCombatEngine } from './useCombatEngine';
import { useEnemySpawner } from './useEnemySpawner';

export interface FloatingDamage {
    id: string;
    x: number;
    y: number;
    damage: number;
    isCritical: boolean;
    opacity: number;
}

export type GameStatus = 'loading' | 'playing' | 'game_over';

export function useGameLoop() {
    const [player, setPlayer] = useState<PlayerPokemon | null>(null);
    const [projectiles, setProjectiles] = useState<Projectile[]>([]);
    const [floatingDamages, setFloatingDamages] = useState<FloatingDamage[]>([]);
    const [status, setStatus] = useState<GameStatus>('loading');
    const [kills, setKills] = useState(0);

    const inputVectorRef = useRef({ x: 0, y: 0 });
    const dashTimerRef = useRef(0);
    const lastTimeRef = useRef(Date.now());

    const { cooldowns, calculateDamage, updateCooldowns, triggerSkill } = useCombatEngine();
    const { enemies, currentWave, updateEnemies, damageEnemy, resetEnemies } = useEnemySpawner();

    useEffect(() => {
        pokeApiService.fetchPokemon('charmander').then(starter => {
            setPlayer(starter);
            setStatus('playing');
        });
    }, []);

    const setJoystickInput = useCallback((vector: { x: number; y: number }) => {
        inputVectorRef.current = vector;
    }, []);

    const handleAction = useCallback((slot: SkillSlot) => {
        if (!player || status !== 'playing') {
            return;
        }

        if (slot === 'dash') {
            if (cooldowns.dash <= 0 && dashTimerRef.current <= 0) {
                dashTimerRef.current = GAME_CONFIG.PHYSICS.DASH_DURATION_MS;
                triggerSkill(slot, player.skills.dash, player.position, player.facingAngle);
            }
            return;
        }

        if (slot === 'ultimate') {
            if (player.ultimateEnergy < GAME_CONFIG.COMBAT.MAX_ULTIMATE_ENERGY) {
                return;
            }
            setPlayer(prev => (prev ? { ...prev, ultimateEnergy: 0 } : null));
        }

        const projectile = triggerSkill(slot, player.skills[slot], player.position, player.facingAngle);
        if (projectile) {
            setProjectiles(prev => [...prev, projectile]);
            if (slot === 'basic') {
                setPlayer(prev =>
                    prev
                        ? {
                            ...prev,
                            ultimateEnergy: Math.min(
                                GAME_CONFIG.COMBAT.MAX_ULTIMATE_ENERGY,
                                prev.ultimateEnergy + GAME_CONFIG.COMBAT.ENERGY_PER_BASIC_ATTACK
                            ),
                        }
                        : null
                );
            }
        }
    }, [player, status, cooldowns, triggerSkill]);

    useEffect(() => {
        if (status !== 'playing' || !player) {
            return;
        }

        const interval = setInterval(() => {
            const now = Date.now();
            const deltaTimeMs = Math.min(32, now - lastTimeRef.current);
            lastTimeRef.current = now;
            const deltaSeconds = deltaTimeMs / 1000;

            updateCooldowns(deltaTimeMs);

            if (dashTimerRef.current > 0) {
                dashTimerRef.current = Math.max(0, dashTimerRef.current - deltaTimeMs);
            }

            const isDashing = dashTimerRef.current > 0;
            const speed = isDashing ? GAME_CONFIG.PHYSICS.PLAYER_DASH_SPEED : GAME_CONFIG.PHYSICS.PLAYER_SPEED;

            setPlayer(prevPlayer => {
                if (!prevPlayer) return null;

                const vx = inputVectorRef.current.x * speed;
                const vy = inputVectorRef.current.y * speed;
                const hasInput = Math.hypot(inputVectorRef.current.x, inputVectorRef.current.y) > 0.05;
                const facingAngle = hasInput
                    ? Math.atan2(inputVectorRef.current.y, inputVectorRef.current.x)
                    : prevPlayer.facingAngle;

                const nextX = Math.min(
                    GAME_CONFIG.VIEWPORT.LOGICAL_WIDTH - GAME_CONFIG.PHYSICS.BOUNDARY_PADDING,
                    Math.max(GAME_CONFIG.PHYSICS.BOUNDARY_PADDING, prevPlayer.position.x + vx * deltaSeconds)
                );
                const nextY = Math.min(
                    GAME_CONFIG.VIEWPORT.LOGICAL_HEIGHT - GAME_CONFIG.PHYSICS.BOUNDARY_PADDING,
                    Math.max(GAME_CONFIG.PHYSICS.BOUNDARY_PADDING, prevPlayer.position.y + vy * deltaSeconds)
                );

                return {
                    ...prevPlayer,
                    position: { x: nextX, y: nextY },
                    velocity: { vx, vy },
                    facingAngle,
                    state: isDashing ? 'dashing' : hasInput ? 'walking' : 'idle',
                    invulnerableUntilMs: isDashing ? now + 200 : prevPlayer.invulnerableUntilMs,
                };
            });

            updateEnemies(player.position, deltaTimeMs);

            setProjectiles(prevProjectiles => {
                const nextList: Projectile[] = [];
                for (const proj of prevProjectiles) {
                    const nextX = proj.x + proj.vx * deltaSeconds;
                    const nextY = proj.y + proj.vy * deltaSeconds;
                    const dist = proj.distanceTraveled + Math.hypot(proj.vx * deltaSeconds, proj.vy * deltaSeconds);

                    if (dist >= proj.maxDistance) {
                        continue;
                    }

                    let hit = false;
                    for (const enemy of enemies) {
                        const distance = Math.hypot(nextX - enemy.position.x, nextY - enemy.position.y);
                        if (distance <= proj.radius + enemy.radius) {
                            hit = true;
                            const damageResult = calculateDamage(
                                proj.type,
                                enemy.type,
                                proj.damage,
                                player.stats.attack,
                                enemy.attackDamage
                            );
                            damageEnemy(enemy.id, damageResult.finalDamage);
                            setFloatingDamages(curr => [
                                ...curr,
                                {
                                    id: `dmg-${Date.now()}-${Math.random()}`,
                                    x: enemy.position.x,
                                    y: enemy.position.y - 12,
                                    damage: damageResult.finalDamage,
                                    isCritical: damageResult.isCritical,
                                    opacity: 1,
                                },
                            ]);
                            break;
                        }
                    }

                    if (!hit) {
                        nextList.push({ ...proj, x: nextX, y: nextY, distanceTraveled: dist });
                    }
                }
                return nextList;
            });

            setFloatingDamages(prev =>
                prev
                    .map(d => ({ ...d, y: d.y - 0.8, opacity: d.opacity - 0.04 }))
                    .filter(d => d.opacity > 0)
            );

            if (now > player.invulnerableUntilMs && !isDashing) {
                for (const enemy of enemies) {
                    const distance = Math.hypot(player.position.x - enemy.position.x, player.position.y - enemy.position.y);
                    if (distance <= GAME_CONFIG.PHYSICS.PLAYER_RADIUS + enemy.radius) {
                        setPlayer(prev => {
                            if (!prev) return null;
                            const nextHp = Math.max(0, prev.currentHp - enemy.attackDamage);
                            if (nextHp <= 0) {
                                setStatus('game_over');
                            }
                            return {
                                ...prev,
                                currentHp: nextHp,
                                invulnerableUntilMs: now + GAME_CONFIG.COMBAT.INVULNERABILITY_AFTER_HIT_MS,
                            };
                        });
                        break;
                    }
                }
            }
        }, GAME_CONFIG.VIEWPORT.FRAME_TIME_MS);

        return () => clearInterval(interval);
    }, [status, player, enemies, updateCooldowns, updateEnemies, calculateDamage, damageEnemy]);

    const restartGame = useCallback(() => {
        resetEnemies();
        setProjectiles([]);
        setFloatingDamages([]);
        setKills(0);
        dashTimerRef.current = 0;
        inputVectorRef.current = { x: 0, y: 0 };
        pokeApiService.fetchPokemon('charmander').then(starter => {
            setPlayer(starter);
            setStatus('playing');
        });
    }, [resetEnemies]);

    return {
        player,
        enemies,
        projectiles,
        floatingDamages,
        cooldowns,
        currentWave,
        kills,
        status,
        setJoystickInput,
        handleAction,
        restartGame,
    };
}