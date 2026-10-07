export interface PokeApiNamedResource {
    name: string;
    url: string;
}

export interface PokeApiTypeSlot {
    slot: number;
    type: PokeApiNamedResource;
}

export interface PokeApiStatSlot {
    base_stat: number;
    effort: number;
    stat: PokeApiNamedResource;
}

export interface PokeApiMoveSlot {
    move: PokeApiNamedResource;
}

export interface PokeApiAbilitySlot {
    ability: PokeApiNamedResource;
    is_hidden: boolean;
    slot: number;
}

export interface PokeApiSprites {
    front_default: string | null;
    other?: {
        'official-artwork'?: {
            front_default: string | null;
        };
        showdown?: {
            front_default: string | null;
        };
    };
}

export interface PokeApiPokemonResponse {
    id: number;
    name: string;
    height: number;
    weight: number;
    types: PokeApiTypeSlot[];
    stats: PokeApiStatSlot[];
    moves: PokeApiMoveSlot[];
    abilities: PokeApiAbilitySlot[];
    sprites: PokeApiSprites;
    cries?: {
        latest?: string;
        legacy?: string;
    };
}

export interface PokeApiMoveResponse {
    id: number;
    name: string;
    power: number | null;
    accuracy: number | null;
    pp: number | null;
    priority: number;
    type: PokeApiNamedResource;
    damage_class: PokeApiNamedResource;
}