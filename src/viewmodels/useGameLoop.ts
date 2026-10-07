import { useState, useEffect, useRef, useCallback } from 'react';
import { GAME_CONFIG } from '../config/gameConfig';
import { PlayerPokemon } from '../models/pokemon';
import { Projectile, SkillSlot } from '../models/combat';
import { Enemy } from '../models/enemy';
import { pokeApiService } from '../services/pokeApi';
import { useCombatEngine } from './useCombatEngine';
import { logger } from '../utils/logger';

export interface FloatingDamage {
    id: string;
    x: number;
    y: number;
    damage: number;
    isCritical: boolean;
    opacity: number;
}

export type GameStatus = 'loading' | 'playing' | 'game_over';

export interface GameFrameState {
    player: PlayerPokemon | null;
    enemies: Enemy[];
    projectiles: Projectile[];
    floatingDamages: FloatingDamage[];
    cooldowns: Record<SkillSlot, number>;
    currentWave: number;
    kills: number;
    fps: number;
    status: GameStatus;
    targetEnemyId: string | null;
}

const ENEMY_TEMPLATES = [
    { pokedexId: 19, name: 'RATTATA', type: 'normal' as const, maxHp: 80, damage: 12 },
    { pokedexId: 41, name: 'ZUBAT', type: 'poison' as const, maxHp: 95, damage: 15 },
    { pokedexId: 92, name: 'GASTLY', type: 'ghost' as const, maxHp: 110, damage: 18 },
    { pokedexId: 95, name: 'ONIX', type: 'rock' as const, maxHp: 240, damage: 24 },
];

export function useGameLoop() {
    const [gameState, setGameState] = useState<GameFrameState>({
        player: null,
        enemies: [],
        projectiles: [],
        floatingDamages: [],
        cooldowns: { basic: 0, skill1: 0, skill2: 0, dash: 0, ultimate: 0 },
        currentWave: 1,
        kills: 0,
        fps: 30,
        status: 'loading',
        targetEnemyId: null,
    });

    const inputVectorRef = useRef({ x: 0, y: 0 });
    const dashTimerRef = useRef(0);
    const autoAttackTimerRef = useRef(0);
    const lastTimeRef = useRef(performance.now());
    const fpsTimerRef = useRef(performance.now());
    const perfLogTimerRef = useRef(performance.now());
    const frameCountRef = useRef(0);
    const fpsValueRef = useRef(30);

    const playerRef = useRef<PlayerPokemon | null>(null);
    const enemiesRef = useRef<Enemy[]>([]);
    const projectilesRef = useRef<Projectile[]>([]);
    const damagesRef = useRef<FloatingDamage[]>([]);
    const cooldownsRef = useRef({ basic: 0, skill1: 0, skill2: 0, dash: 0, ultimate: 0 });
    const waveRef = useRef(1);
    const killsRef = useRef(0);
    const spawnTimerRef = useRef(0);
    const statusRef = useRef<GameStatus>('loading');

    const { calculateDamage, createProjectile } = useCombatEngine();

    useEffect(() => {
        logger.info('SYSTEM', 'Initializing Game Engine and loading Charmander');
        pokeApiService.fetchPokemon('charmander').then(starter => {
            playerRef.current = starter;
            statusRef.current = 'playing';
            setGameState(prev => ({ ...prev, player: starter, status: 'playing' }));
            logger.info('SYSTEM', 'Game loop active at target 30 FPS');
        });
    }, []);

    const setJoystickInput = useCallback((vector: { x: number; y: number }) => {
        inputVectorRef.current = vector;
    }, []);

    const getNearestEnemyAngle = useCallback((pos: { x: number; y: number }, defaultAngle: number) => {
        if (enemiesRef.current.length === 0) return defaultAngle;
        let minDist = Infinity;
        let nearest = enemiesRef.current[0];
        for (const e of enemiesRef.current) {
            const d = Math.hypot(e.position.x - pos.x, e.position.y - pos.y);
            if (d < minDist) {
                minDist = d;
                nearest = e;
            }
        }
        return Math.atan2(nearest.position.y - pos.y, nearest.position.x - pos.x);
    }, []);

    const handleAction = useCallback((slot: SkillSlot) => {
        const p = playerRef.current;
        if (!p || statusRef.current !== 'playing') return;

        if (slot === 'dash') {
            if (cooldownsRef.current.dash <= 0 && dashTimerRef.current <= 0) {
                dashTimerRef.current = GAME_CONFIG.PHYSICS.DASH_DURATION_MS;
                cooldownsRef.current.dash = GAME_CONFIG.PHYSICS.DASH_COOLDOWN_MS;
                logger.debug('INPUT', 'Dash executed');
            }
            return;
        }

        if (cooldownsRef.current[slot] > 0) return;

        if (slot === 'ultimate') {
            if (p.ultimateEnergy < GAME_CONFIG.COMBAT.MAX_ULTIMATE_ENERGY) return;
            p.ultimateEnergy = 0;
            logger.info('COMBAT', 'Ultimate discharged');
        }

        const aimAngle = getNearestEnemyAngle(p.position, p.facingAngle);
        p.facingAngle = aimAngle;
        cooldownsRef.current[slot] = p.skills[slot].cooldownMs;
        const proj = createProjectile(slot, p.skills[slot], p.position, aimAngle);

        if (projectilesRef.current.length < GAME_CONFIG.LIMITS.MAX_PROJECTILES) {
            projectilesRef.current.push(proj);
        }
    }, [createProjectile, getNearestEnemyAngle]);

    useEffect(() => {
        let animId: number;

        const loop = (now: number) => {
            if (statusRef.current !== 'playing') {
                animId = requestAnimationFrame(loop);
                return;
            }

            const elapsed = now - lastTimeRef.current;
            if (elapsed < GAME_CONFIG.VIEWPORT.FRAME_TIME_MS) {
                animId = requestAnimationFrame(loop);
                return;
            }

            lastTimeRef.current = now - (elapsed % GAME_CONFIG.VIEWPORT.FRAME_TIME_MS);
            const dtSec = GAME_CONFIG.VIEWPORT.FRAME_TIME_MS / 1000;
            const dt = GAME_CONFIG.VIEWPORT.FRAME_TIME_MS;

            frameCountRef.current += 1;
            if (now - fpsTimerRef.current >= 500) {
                fpsValueRef.current = Math.min(30, Math.round((frameCountRef.current * 1000) / (now - fpsTimerRef.current)));
                frameCountRef.current = 0;
                fpsTimerRef.current = now;
            }

            if (now - perfLogTimerRef.current >= GAME_CONFIG.LOGGING.PERF_REPORT_INTERVAL_MS) {
                perfLogTimerRef.current = now;
                logger.perf(
                    'TICK',
                    fpsValueRef.current,
                    elapsed,
                    `Enemies: ${enemiesRef.current.length}/${GAME_CONFIG.LIMITS.MAX_ENEMIES} | Proj: ${projectilesRef.current.length} | Wave: ${waveRef.current}`
                );
            }

            const cd = cooldownsRef.current;
            cd.basic = Math.max(0, cd.basic - dt);
            cd.skill1 = Math.max(0, cd.skill1 - dt);
            cd.skill2 = Math.max(0, cd.skill2 - dt);
            cd.dash = Math.max(0, cd.dash - dt);
            cd.ultimate = Math.max(0, cd.ultimate - dt);

            if (dashTimerRef.current > 0) dashTimerRef.current = Math.max(0, dashTimerRef.current - dt);

            const isDashing = dashTimerRef.current > 0;
            const speed = isDashing ? GAME_CONFIG.PHYSICS.PLAYER_DASH_SPEED : GAME_CONFIG.PHYSICS.PLAYER_SPEED;

            const p = playerRef.current;
            if (p) {
                const vx = inputVectorRef.current.x * speed;
                const vy = inputVectorRef.current.y * speed;
                const hasInput = Math.hypot(inputVectorRef.current.x, inputVectorRef.current.y) > 0.05;
                if (hasInput && enemiesRef.current.length === 0) {
                    p.facingAngle = Math.atan2(inputVectorRef.current.y, inputVectorRef.current.x);
                }
                p.position.x = Math.min(
                    GAME_CONFIG.VIEWPORT.LOGICAL_WIDTH - GAME_CONFIG.PHYSICS.BOUNDARY_PADDING,
                    Math.max(GAME_CONFIG.PHYSICS.BOUNDARY_PADDING, p.position.x + vx * dtSec)
                );
                p.position.y = Math.min(
                    GAME_CONFIG.VIEWPORT.LOGICAL_HEIGHT - GAME_CONFIG.PHYSICS.BOUNDARY_PADDING,
                    Math.max(GAME_CONFIG.PHYSICS.BOUNDARY_PADDING, p.position.y + vy * dtSec)
                );
                p.state = isDashing ? 'dashing' : hasInput ? 'walking' : 'idle';

                autoAttackTimerRef.current += dt;
                if (autoAttackTimerRef.current >= GAME_CONFIG.COMBAT.AUTO_ATTACK_INTERVAL_MS && enemiesRef.current.length > 0) {
                    autoAttackTimerRef.current = 0;
                    const aim = getNearestEnemyAngle(p.position, p.facingAngle);
                    p.facingAngle = aim;
                    if (projectilesRef.current.length < GAME_CONFIG.LIMITS.MAX_PROJECTILES) {
                        projectilesRef.current.push(createProjectile('basic', p.skills.basic, p.position, aim));
                    }
                }
            }

            spawnTimerRef.current += dt;
            if (spawnTimerRef.current >= 1800 && enemiesRef.current.length < GAME_CONFIG.LIMITS.MAX_ENEMIES) {
                spawnTimerRef.current = 0;
                const t = ENEMY_TEMPLATES[Math.floor(Math.random() * ENEMY_TEMPLATES.length)];
                const isBoss = waveRef.current % 5 === 0 && Math.random() < 0.2;
                const side = Math.floor(Math.random() * 4);
                let ex = GAME_CONFIG.PHYSICS.BOUNDARY_PADDING;
                let ey = GAME_CONFIG.PHYSICS.BOUNDARY_PADDING;
                if (side === 0) { ex = Math.random() * GAME_CONFIG.VIEWPORT.LOGICAL_WIDTH; ey = GAME_CONFIG.PHYSICS.BOUNDARY_PADDING; }
                else if (side === 1) { ex = GAME_CONFIG.VIEWPORT.LOGICAL_WIDTH - GAME_CONFIG.PHYSICS.BOUNDARY_PADDING; ey = Math.random() * GAME_CONFIG.VIEWPORT.LOGICAL_HEIGHT; }
                else if (side === 2) { ex = Math.random() * GAME_CONFIG.VIEWPORT.LOGICAL_WIDTH; ey = GAME_CONFIG.VIEWPORT.LOGICAL_HEIGHT - GAME_CONFIG.PHYSICS.BOUNDARY_PADDING; }
                else { ex = GAME_CONFIG.PHYSICS.BOUNDARY_PADDING; ey = Math.random() * GAME_CONFIG.VIEWPORT.LOGICAL_HEIGHT; }
                const hp = Math.round(t.maxHp * (1 + (waveRef.current - 1) * 0.15) * (isBoss ? 2.5 : 1));
                enemiesRef.current.push({
                    id: `e-${Date.now()}-${Math.random()}`,
                    pokedexId: t.pokedexId,
                    name: isBoss ? `ALPHA ${t.name}` : t.name,
                    type: t.type,
                    maxHp: hp,
                    currentHp: hp,
                    position: { x: ex, y: ey },
                    velocity: { vx: 0, vy: 0 },
                    speed: isBoss ? GAME_CONFIG.PHYSICS.ENEMY_BASE_SPEED * 0.8 : GAME_CONFIG.PHYSICS.ENEMY_BASE_SPEED,
                    radius: isBoss ? GAME_CONFIG.PHYSICS.ENEMY_RADIUS * 1.6 : GAME_CONFIG.PHYSICS.ENEMY_RADIUS,
                    attackDamage: t.damage,
                    isBoss,
                    state: 'chasing',
                });
                logger.debug('SPAWNER', `Spawned ${t.name} (Wave ${waveRef.current})`);
            }

            let closestId: string | null = null;
            let minEnemyDist = Infinity;
            if (p) {
                for (const enemy of enemiesRef.current) {
                    const dx = p.position.x - enemy.position.x;
                    const dy = p.position.y - enemy.position.y;
                    const dist = Math.hypot(dx, dy);
                    if (dist < minEnemyDist) {
                        minEnemyDist = dist;
                        closestId = enemy.id;
                    }
                    if (dist > 1) {
                        enemy.position.x += (dx / dist) * enemy.speed * dtSec;
                        enemy.position.y += (dy / dist) * enemy.speed * dtSec;
                    }
                }
            }

            const nextProjs: Projectile[] = [];
            for (const proj of projectilesRef.current) {
                proj.x += proj.vx * dtSec;
                proj.y += proj.vy * dtSec;
                proj.distanceTraveled += Math.hypot(proj.vx * dtSec, proj.vy * dtSec);
                if (proj.distanceTraveled >= proj.maxDistance) continue;

                let hit = false;
                for (const enemy of enemiesRef.current) {
                    const dist = Math.hypot(proj.x - enemy.position.x, proj.y - enemy.position.y);
                    if (dist <= proj.radius + enemy.radius) {
                        hit = true;
                        const dmg = calculateDamage(proj.type, enemy.type, proj.damage, p ? p.stats.attack : 50, enemy.attackDamage);
                        enemy.currentHp -= dmg.finalDamage;
                        const angle = Math.atan2(enemy.position.y - proj.y, enemy.position.x - proj.x);
                        enemy.position.x += Math.cos(angle) * GAME_CONFIG.PHYSICS.KNOCKBACK_FORCE * dtSec;
                        enemy.position.y += Math.sin(angle) * GAME_CONFIG.PHYSICS.KNOCKBACK_FORCE * dtSec;

                        if (damagesRef.current.length < GAME_CONFIG.LIMITS.MAX_FLOATING_DAMAGES) {
                            damagesRef.current.push({
                                id: `d-${Date.now()}-${Math.random()}`,
                                x: enemy.position.x,
                                y: enemy.position.y - 12,
                                damage: dmg.finalDamage,
                                isCritical: dmg.isCritical,
                                opacity: 1,
                            });
                        }
                        break;
                    }
                }
                if (!hit) nextProjs.push(proj);
            }
            projectilesRef.current = nextProjs;

            enemiesRef.current = enemiesRef.current.filter(e => {
                if (e.currentHp <= 0) {
                    killsRef.current += 1;
                    if (killsRef.current % 10 === 0) {
                        waveRef.current += 1;
                        logger.info('SPAWNER', `Advancing to Wave ${waveRef.current}`);
                    }
                    if (p) {
                        p.ultimateEnergy = Math.min(
                            GAME_CONFIG.COMBAT.MAX_ULTIMATE_ENERGY,
                            p.ultimateEnergy + GAME_CONFIG.COMBAT.ENERGY_PER_KILL
                        );
                    }
                    return false;
                }
                return true;
            });

            damagesRef.current = damagesRef.current
                .map(d => ({ ...d, y: d.y - 1, opacity: d.opacity - 0.05 }))
                .filter(d => d.opacity > 0);

            if (p && now > p.invulnerableUntilMs && !isDashing) {
                for (const enemy of enemiesRef.current) {
                    const dist = Math.hypot(p.position.x - enemy.position.x, p.position.y - enemy.position.y);
                    if (dist <= GAME_CONFIG.PHYSICS.PLAYER_RADIUS + enemy.radius) {
                        p.currentHp = Math.max(0, p.currentHp - enemy.attackDamage);
                        p.invulnerableUntilMs = now + GAME_CONFIG.COMBAT.INVULNERABILITY_AFTER_HIT_MS;
                        logger.warn('COMBAT', `Player struck by ${enemy.name}, HP remaining: ${p.currentHp}`);
                        if (p.currentHp <= 0) {
                            statusRef.current = 'game_over';
                            logger.warn('SYSTEM', 'Player defeated, entering Game Over state');
                        }
                        break;
                    }
                }
            }

            setGameState({
                player: p ? { ...p } : null,
                enemies: [...enemiesRef.current],
                projectiles: [...projectilesRef.current],
                floatingDamages: [...damagesRef.current],
                cooldowns: { ...cd },
                currentWave: waveRef.current,
                kills: killsRef.current,
                fps: fpsValueRef.current,
                status: statusRef.current,
                targetEnemyId: closestId,
            });

            animId = requestAnimationFrame(loop);
        };

        animId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(animId);
    }, [calculateDamage, createProjectile, getNearestEnemyAngle]);

    const restartGame = useCallback(() => {
        logger.info('SYSTEM', 'Restarting run');
        enemiesRef.current = [];
        projectilesRef.current = [];
        damagesRef.current = [];
        killsRef.current = 0;
        waveRef.current = 1;
        dashTimerRef.current = 0;
        autoAttackTimerRef.current = 0;
        inputVectorRef.current = { x: 0, y: 0 };
        pokeApiService.fetchPokemon('charmander').then(starter => {
            playerRef.current = starter;
            statusRef.current = 'playing';
            setGameState(prev => ({
                ...prev,
                player: starter,
                enemies: [],
                projectiles: [],
                floatingDamages: [],
                currentWave: 1,
                kills: 0,
                status: 'playing',
            }));
        });
    }, []);

    return {
        gameState,
        setJoystickInput,
        handleAction,
        restartGame,
    };
}