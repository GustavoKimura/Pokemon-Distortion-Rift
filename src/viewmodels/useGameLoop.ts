import { useState, useEffect, useRef, useCallback } from 'react';
import { GAME_CONFIG } from '../config/gameConfig';
import { PlayerPokemon } from '../models/pokemon';
import { Projectile, SkillSlot, PokemonType } from '../models/combat';
import { Enemy } from '../models/enemy';
import { ItemDrop } from '../models/item';
import { MetaTalents } from '../models/starter';
import { pokeApiService } from '../services/pokeApi';
import { evolutionService } from '../services/evolutionService';
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

export type GameMode = 'select_starter' | 'meta_tree' | 'playing' | 'game_over';

export interface GameFrameState {
    player: PlayerPokemon | null;
    enemies: Enemy[];
    projectiles: Projectile[];
    floatingDamages: FloatingDamage[];
    items: ItemDrop[];
    cooldowns: Record<SkillSlot, number>;
    currentWave: number;
    kills: number;
    voidDust: number;
    fps: number;
    status: GameMode;
    targetEnemyId: string | null;
    isBlazeActive: boolean;
    talents: MetaTalents;
}

const ENEMY_TEMPLATES = [
    { pokedexId: 19, name: 'RATTATA', type: 'normal' as const, maxHp: 80, attack: 56, defense: 35, specialDefense: 35, weight: 35, height: 3, spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/19.gif' },
    { pokedexId: 41, name: 'ZUBAT', type: 'poison' as const, maxHp: 95, attack: 45, defense: 35, specialDefense: 40, weight: 75, height: 8, spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/41.gif' },
    { pokedexId: 92, name: 'GASTLY', type: 'ghost' as const, maxHp: 110, attack: 35, defense: 30, specialDefense: 35, weight: 1, height: 13, spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/92.gif' },
    { pokedexId: 95, name: 'ONIX', type: 'rock' as const, maxHp: 240, attack: 45, defense: 160, specialDefense: 45, weight: 2100, height: 88, spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/95.gif' },
];

export function useGameLoop() {
    const [gameState, setGameState] = useState<GameFrameState>({
        player: null,
        enemies: [],
        projectiles: [],
        floatingDamages: [],
        items: [],
        cooldowns: { basic: 0, skill1: 0, skill2: 0, dash: 0, ultimate: 0 },
        currentWave: 1,
        kills: 0,
        voidDust: 0,
        fps: 30,
        status: 'select_starter',
        targetEnemyId: null,
        isBlazeActive: false,
        talents: { vigor: 0, fury: 0, agility: 0, mastery: 0 },
    });

    const inputVectorRef = useRef({ x: 0, y: 0 });
    const dashTimerRef = useRef(0);
    const lastTimeRef = useRef(performance.now());
    const fpsTimerRef = useRef(performance.now());
    const perfLogTimerRef = useRef(performance.now());
    const frameCountRef = useRef(0);
    const fpsValueRef = useRef(30);

    const playerRef = useRef<PlayerPokemon | null>(null);
    const enemiesRef = useRef<Enemy[]>([]);
    const projectilesRef = useRef<Projectile[]>([]);
    const damagesRef = useRef<FloatingDamage[]>([]);
    const itemsRef = useRef<ItemDrop[]>([]);
    const cooldownsRef = useRef({ basic: 0, skill1: 0, skill2: 0, dash: 0, ultimate: 0 });
    const waveRef = useRef(1);
    const killsRef = useRef(0);
    const voidDustRef = useRef(0);
    const spawnTimerRef = useRef(0);
    const statusRef = useRef<GameMode>('select_starter');
    const talentsRef = useRef<MetaTalents>({ vigor: 0, fury: 0, agility: 0, mastery: 0 });

    const { calculateDamage, createProjectile } = useCombatEngine();

    const startRun = useCallback((pokedexId: number) => {
        logger.info('SYSTEM', `Starting run with starter #${pokedexId}`);
        enemiesRef.current = [];
        projectilesRef.current = [];
        damagesRef.current = [];
        itemsRef.current = [];
        killsRef.current = 0;
        waveRef.current = 1;

        pokeApiService.fetchPokemon(pokedexId).then(starter => {
            const t = talentsRef.current;
            starter.stats.maxHp = Math.round(starter.stats.maxHp * (1 + t.vigor * GAME_CONFIG.META.HP_BONUS_PER_LEVEL));
            starter.currentHp = starter.stats.maxHp;
            starter.stats.attack = Math.round(starter.stats.attack * (1 + t.fury * GAME_CONFIG.META.ATK_BONUS_PER_LEVEL));
            starter.stats.specialAttack = Math.round(starter.stats.specialAttack * (1 + t.fury * GAME_CONFIG.META.ATK_BONUS_PER_LEVEL));
            starter.stats.speed = Math.round(starter.stats.speed * (1 + t.agility * GAME_CONFIG.META.SPD_BONUS_PER_LEVEL));

            playerRef.current = starter;
            statusRef.current = 'playing';
            setGameState(prev => ({
                ...prev,
                player: starter,
                enemies: [],
                projectiles: [],
                items: [],
                currentWave: 1,
                kills: 0,
                status: 'playing',
            }));
        });
    }, []);

    const upgradeTalent = useCallback((key: keyof MetaTalents) => {
        const currentLvl = talentsRef.current[key];
        if (currentLvl >= GAME_CONFIG.META.TALENT_MAX_LEVEL) return;
        const cost = (currentLvl + 1) * GAME_CONFIG.META.TALENT_BASE_COST;
        if (voidDustRef.current < cost) return;

        voidDustRef.current -= cost;
        talentsRef.current[key] += 1;
        setGameState(prev => ({
            ...prev,
            voidDust: voidDustRef.current,
            talents: { ...talentsRef.current },
        }));
    }, []);

    const openMetaTree = useCallback(() => {
        statusRef.current = 'meta_tree';
        setGameState(prev => ({ ...prev, status: 'meta_tree' }));
    }, []);

    const closeMetaTree = useCallback(() => {
        statusRef.current = 'select_starter';
        setGameState(prev => ({ ...prev, status: 'select_starter' }));
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
            }
            return;
        }

        if (cooldownsRef.current[slot] > 0) return;

        if (slot === 'ultimate') {
            if (p.ultimateEnergy < GAME_CONFIG.COMBAT.MAX_ULTIMATE_ENERGY) return;
            p.ultimateEnergy = 0;
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
            let blazeActive = false;

            if (p) {
                blazeActive = p.primaryType === 'fire' && p.currentHp <= p.stats.maxHp * GAME_CONFIG.COMBAT.BLAZE_HP_THRESHOLD;

                const nextEvo = evolutionService.checkEvolution(p.pokedexId, waveRef.current);
                if (nextEvo) {
                    p.pokedexId = nextEvo.pokedexId;
                    p.name = nextEvo.name;
                    p.spriteUrl = nextEvo.spriteUrl;
                    p.height = nextEvo.height;
                    p.weight = nextEvo.weight;
                    p.primaryType = nextEvo.primaryType as PokemonType;
                    if (nextEvo.secondaryType) p.secondaryType = nextEvo.secondaryType as PokemonType;
                    p.stats.maxHp += nextEvo.hpBonus;
                    p.currentHp += nextEvo.hpBonus;
                    p.stats.attack += nextEvo.attackBonus;
                    p.stats.specialAttack += nextEvo.specialAttackBonus;
                }

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

                itemsRef.current = itemsRef.current.filter(item => {
                    const dist = Math.hypot(p.position.x - item.x, p.position.y - item.y);
                    if (dist <= GAME_CONFIG.ITEMS.PICKUP_RADIUS) {
                        item.x += (p.position.x - item.x) * 6 * dtSec;
                        item.y += (p.position.y - item.y) * 6 * dtSec;
                    }
                    if (dist <= GAME_CONFIG.PHYSICS.PLAYER_RADIUS) {
                        if (item.healAmount) {
                            p.currentHp = Math.min(p.stats.maxHp, p.currentHp + item.healAmount);
                        }
                        return false;
                    }
                    return true;
                });
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
                else if (side === 2) { ex = Math.random() * GAME_CONFIG.VIEWPORT.LOGICAL_WIDTH; ey = GAME_CONFIG.PHYSICS.BOUNDARY_PADDING; }
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
                    radius: isBoss ? GAME_CONFIG.PHYSICS.ENEMY_RADIUS * 1.5 : GAME_CONFIG.PHYSICS.ENEMY_RADIUS,
                    attackDamage: t.attack,
                    defense: t.defense,
                    specialDefense: t.specialDefense,
                    weight: t.weight,
                    height: t.height,
                    spriteUrl: t.spriteUrl,
                    isBoss,
                    state: 'chasing',
                });
            }

            const enemiesList = enemiesRef.current;
            for (let i = 0; i < enemiesList.length; i++) {
                for (let j = i + 1; j < enemiesList.length; j++) {
                    const eA = enemiesList[i];
                    const eB = enemiesList[j];
                    const dx = eB.position.x - eA.position.x;
                    const dy = eB.position.y - eA.position.y;
                    const dist = Math.hypot(dx, dy);
                    const minDist = eA.radius + eB.radius;
                    if (dist < minDist && dist > 0.01) {
                        const overlap = (minDist - dist) * 0.5;
                        const nx = dx / dist;
                        const ny = dy / dist;
                        eA.position.x -= nx * overlap;
                        eA.position.y -= ny * overlap;
                        eB.position.x += nx * overlap;
                        eB.position.y += ny * overlap;
                    }
                }
            }

            let closestId: string | null = null;
            let minEnemyDist = Infinity;
            if (p) {
                for (const enemy of enemiesList) {
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

                    if (!isDashing) {
                        const minPlayerDist = GAME_CONFIG.PHYSICS.PLAYER_RADIUS + enemy.radius;
                        if (dist < minPlayerDist && dist > 0.01) {
                            const pushDist = minPlayerDist - dist;
                            const pushNx = dx / dist;
                            const pushNy = dy / dist;
                            enemy.position.x -= pushNx * pushDist;
                            enemy.position.y -= pushNy * pushDist;
                        }
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
                for (const enemy of enemiesList) {
                    const dist = Math.hypot(proj.x - enemy.position.x, proj.y - enemy.position.y);
                    if (dist <= proj.radius + enemy.radius) {
                        hit = true;
                        let finalPower = proj.damage;
                        if (blazeActive && proj.type === 'fire') {
                            finalPower = Math.round(finalPower * GAME_CONFIG.COMBAT.BLAZE_DAMAGE_MULTIPLIER);
                        }

                        const dmg = calculateDamage(
                            proj.type,
                            enemy.type,
                            finalPower,
                            proj.damageClass,
                            { attack: p?.stats.attack ?? 52, specialAttack: p?.stats.specialAttack ?? 60 },
                            { defense: enemy.defense, specialDefense: enemy.specialDefense }
                        );
                        enemy.currentHp -= dmg.finalDamage;

                        const weightRatio = Math.max(0.3, Math.min(2.0, 85 / Math.max(1, enemy.weight)));
                        const angle = Math.atan2(enemy.position.y - proj.y, enemy.position.x - proj.x);
                        enemy.position.x += Math.cos(angle) * GAME_CONFIG.PHYSICS.KNOCKBACK_FORCE * weightRatio * dtSec;
                        enemy.position.y += Math.sin(angle) * GAME_CONFIG.PHYSICS.KNOCKBACK_FORCE * weightRatio * dtSec;

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

            enemiesRef.current = enemiesList.filter(e => {
                if (e.currentHp <= 0) {
                    killsRef.current += 1;
                    voidDustRef.current += GAME_CONFIG.META.VOID_DUST_PER_KILL;
                    if (killsRef.current % 8 === 0) waveRef.current += 1;
                    if (p) {
                        p.ultimateEnergy = Math.min(
                            GAME_CONFIG.COMBAT.MAX_ULTIMATE_ENERGY,
                            p.ultimateEnergy + GAME_CONFIG.COMBAT.ENERGY_PER_KILL
                        );
                    }

                    if (Math.random() < GAME_CONFIG.ITEMS.DROP_CHANCE && itemsRef.current.length < GAME_CONFIG.LIMITS.MAX_DROPPED_ITEMS) {
                        const isSitrus = Math.random() < 0.25;
                        itemsRef.current.push({
                            id: `item-${Date.now()}-${Math.random()}`,
                            name: isSitrus ? 'SITRUS BERRY' : 'ORAN BERRY',
                            category: 'healing',
                            spriteUrl: isSitrus
                                ? 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/sitrus-berry.png'
                                : 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/oran-berry.png',
                            x: e.position.x,
                            y: e.position.y,
                            healAmount: isSitrus ? GAME_CONFIG.ITEMS.SITRUS_BERRY_HEAL : GAME_CONFIG.ITEMS.ORAN_BERRY_HEAL,
                        });
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
                        if (p.currentHp <= 0) statusRef.current = 'game_over';
                        break;
                    }
                }
            }

            setGameState({
                player: p ? { ...p } : null,
                enemies: [...enemiesRef.current],
                projectiles: [...projectilesRef.current],
                floatingDamages: [...damagesRef.current],
                items: [...itemsRef.current],
                cooldowns: { ...cd },
                currentWave: waveRef.current,
                kills: killsRef.current,
                voidDust: voidDustRef.current,
                fps: fpsValueRef.current,
                status: statusRef.current,
                targetEnemyId: closestId,
                isBlazeActive: blazeActive,
                talents: { ...talentsRef.current },
            });

            animId = requestAnimationFrame(loop);
        };

        animId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(animId);
    }, [calculateDamage, createProjectile, getNearestEnemyAngle]);

    const restartGame = useCallback(() => {
        statusRef.current = 'select_starter';
        setGameState(prev => ({
            ...prev,
            status: 'select_starter',
            player: null,
            enemies: [],
            projectiles: [],
            floatingDamages: [],
            items: [],
            currentWave: 1,
            kills: 0,
            isBlazeActive: false,
        }));
    }, []);

    return {
        gameState,
        startRun,
        upgradeTalent,
        openMetaTree,
        closeMetaTree,
        setJoystickInput,
        handleAction,
        restartGame,
    };
}