import { useState, useEffect, useRef, useCallback } from 'react';
import { GAME_CONFIG } from '../config/gameConfig';
import { PlayerPokemon } from '../models/pokemon';
import { Projectile, SkillSlot } from '../models/combat';
import { Enemy } from '../models/enemy';
import { pokeApiService } from '../services/pokeApi';
import { useCombatEngine } from './useCombatEngine';

export interface FloatingDamage {
    id: string;
    x: number;
    y: number;
    damage: number;
    isCritical: boolean;
    opacity: number;
}

export type GameStatus = 'loading' | 'playing' | 'game_over';

const ENEMY_TEMPLATES = [
    { pokedexId: 19, name: 'RATTATA', type: 'normal' as const, maxHp: 80, damage: 12 },
    { pokedexId: 41, name: 'ZUBAT', type: 'poison' as const, maxHp: 95, damage: 15 },
    { pokedexId: 92, name: 'GASTLY', type: 'ghost' as const, maxHp: 110, damage: 18 },
    { pokedexId: 95, name: 'ONIX', type: 'rock' as const, maxHp: 240, damage: 24 },
];

export function useGameLoop() {
    const [player, setPlayer] = useState<PlayerPokemon | null>(null);
    const [enemies, setEnemies] = useState<Enemy[]>([]);
    const [projectiles, setProjectiles] = useState<Projectile[]>([]);
    const [floatingDamages, setFloatingDamages] = useState<FloatingDamage[]>([]);
    const [cooldowns, setCooldowns] = useState<Record<SkillSlot, number>>({
        basic: 0, skill1: 0, skill2: 0, dash: 0, ultimate: 0,
    });
    const [currentWave, setCurrentWave] = useState(1);
    const [kills, setKills] = useState(0);
    const [fps, setFps] = useState(60);
    const [status, setStatus] = useState<GameStatus>('loading');

    const inputVectorRef = useRef({ x: 0, y: 0 });
    const dashTimerRef = useRef(0);
    const lastTimeRef = useRef(performance.now());
    const fpsTimerRef = useRef(performance.now());
    const frameCountRef = useRef(0);

    const playerRef = useRef<PlayerPokemon | null>(null);
    const enemiesRef = useRef<Enemy[]>([]);
    const projectilesRef = useRef<Projectile[]>([]);
    const damagesRef = useRef<FloatingDamage[]>([]);
    const cooldownsRef = useRef({ basic: 0, skill1: 0, skill2: 0, dash: 0, ultimate: 0 });
    const waveRef = useRef(1);
    const killsRef = useRef(0);
    const spawnTimerRef = useRef(0);

    const { calculateDamage, triggerSkill } = useCombatEngine();

    useEffect(() => {
        pokeApiService.fetchPokemon('charmander').then(starter => {
            playerRef.current = starter;
            setPlayer(starter);
            setStatus('playing');
        });
    }, []);

    const setJoystickInput = useCallback((vector: { x: number; y: number }) => {
        inputVectorRef.current = vector;
    }, []);

    const handleAction = useCallback((slot: SkillSlot) => {
        const p = playerRef.current;
        if (!p || status !== 'playing') return;

        if (slot === 'dash') {
            if (cooldownsRef.current.dash <= 0 && dashTimerRef.current <= 0) {
                dashTimerRef.current = GAME_CONFIG.PHYSICS.DASH_DURATION_MS;
                cooldownsRef.current.dash = GAME_CONFIG.PHYSICS.DASH_COOLDOWN_MS;
            }
            return;
        }

        if (cooldownsRef.current[slot] > 0) return;

        if (slot === 'ultimate') {
            if (p.ultimateEnergy < GAME_CONFIG.COMBAT.MAX_ULTIMATE_ENERGY) return;
            p.ultimateEnergy = 0;
        }

        cooldownsRef.current[slot] = p.skills[slot].cooldownMs;
        const proj = triggerSkill(slot, p.skills[slot], p.position, p.facingAngle);
        if (proj) {
            projectilesRef.current.push(proj);
            if (slot === 'basic') {
                p.ultimateEnergy = Math.min(
                    GAME_CONFIG.COMBAT.MAX_ULTIMATE_ENERGY,
                    p.ultimateEnergy + GAME_CONFIG.COMBAT.ENERGY_PER_BASIC_ATTACK
                );
            }
        }
    }, [status, triggerSkill]);

    useEffect(() => {
        if (status !== 'playing') return;

        let animId: number;

        const loop = (now: number) => {
            const dt = Math.min(33, now - lastTimeRef.current);
            lastTimeRef.current = now;
            const dtSec = dt / 1000;

            frameCountRef.current += 1;
            if (now - fpsTimerRef.current >= 500) {
                setFps(Math.round((frameCountRef.current * 1000) / (now - fpsTimerRef.current)));
                frameCountRef.current = 0;
                fpsTimerRef.current = now;
            }

            const cd = cooldownsRef.current;
            cd.basic = Math.max(0, cd.basic - dt);
            cd.skill1 = Math.max(0, cd.skill1 - dt);
            cd.skill2 = Math.max(0, cd.skill2 - dt);
            cd.dash = Math.max(0, cd.dash - dt);
            cd.ultimate = Math.max(0, cd.ultimate - dt);

            if (dashTimerRef.current > 0) {
                dashTimerRef.current = Math.max(0, dashTimerRef.current - dt);
            }

            const isDashing = dashTimerRef.current > 0;
            const speed = isDashing ? GAME_CONFIG.PHYSICS.PLAYER_DASH_SPEED : GAME_CONFIG.PHYSICS.PLAYER_SPEED;

            const p = playerRef.current;
            if (p) {
                const vx = inputVectorRef.current.x * speed;
                const vy = inputVectorRef.current.y * speed;
                const hasInput = Math.hypot(inputVectorRef.current.x, inputVectorRef.current.y) > 0.05;
                if (hasInput) {
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
            }

            spawnTimerRef.current += dt;
            if (spawnTimerRef.current >= 2000 && enemiesRef.current.length < 12) {
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
            }

            if (p) {
                for (const enemy of enemiesRef.current) {
                    const dx = p.position.x - enemy.position.x;
                    const dy = p.position.y - enemy.position.y;
                    const dist = Math.hypot(dx, dy);
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
                        damagesRef.current.push({
                            id: `d-${Date.now()}-${Math.random()}`,
                            x: enemy.position.x,
                            y: enemy.position.y - 12,
                            damage: dmg.finalDamage,
                            isCritical: dmg.isCritical,
                            opacity: 1,
                        });
                        break;
                    }
                }
                if (!hit) nextProjs.push(proj);
            }
            projectilesRef.current = nextProjs;

            enemiesRef.current = enemiesRef.current.filter(e => {
                if (e.currentHp <= 0) {
                    killsRef.current += 1;
                    if (killsRef.current % 10 === 0) waveRef.current += 1;
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
                        if (p.currentHp <= 0) {
                            setStatus('game_over');
                        }
                        break;
                    }
                }
            }

            setPlayer(p ? { ...p } : null);
            setEnemies([...enemiesRef.current]);
            setProjectiles([...projectilesRef.current]);
            setFloatingDamages([...damagesRef.current]);
            setCooldowns({ ...cd });
            setCurrentWave(waveRef.current);
            setKills(killsRef.current);

            animId = requestAnimationFrame(loop);
        };

        animId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(animId);
    }, [status, calculateDamage]);

    const restartGame = useCallback(() => {
        enemiesRef.current = [];
        projectilesRef.current = [];
        damagesRef.current = [];
        killsRef.current = 0;
        waveRef.current = 1;
        dashTimerRef.current = 0;
        inputVectorRef.current = { x: 0, y: 0 };
        pokeApiService.fetchPokemon('charmander').then(starter => {
            playerRef.current = starter;
            setPlayer(starter);
            setStatus('playing');
        });
    }, []);

    return {
        player,
        enemies,
        projectiles,
        floatingDamages,
        cooldowns,
        currentWave,
        kills,
        fps,
        status,
        setJoystickInput,
        handleAction,
        restartGame,
    };
}