export type AilmentType = 'none' | 'burn' | 'paralysis' | 'poison' | 'freeze';

export interface ActiveAilment {
    type: AilmentType;
    durationMs: number;
    tickTimerMs: number;
    damagePerTick: number;
}

export interface StatModifiers {
    attackMultiplier: number;
    defenseMultiplier: number;
    speedMultiplier: number;
}