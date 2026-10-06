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

export interface PokeApiSprites {
    front_default: string | null;
    other?: {
        'official-artwork'?: {
            front_default: string | null;
        };
    };
}

export interface PokeApiPokemonResponse {
    id: number;
    name: string;
    types: PokeApiTypeSlot[];
    stats: PokeApiStatSlot[];
    moves: PokeApiMoveSlot[];
    sprites: PokeApiSprites;
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