export interface ExpGem {
    id: string;
    x: number;
    y: number;
    value: number;
}

export type UpgradeCategory = 'attack' | 'speed' | 'health' | 'utility';

export interface UpgradeOption {
    id: string;
    name: string;
    description: string;
    category: UpgradeCategory;
    iconText: string;
}