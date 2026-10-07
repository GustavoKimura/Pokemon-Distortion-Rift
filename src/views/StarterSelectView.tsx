import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { GAME_CONFIG } from '../config/gameConfig';
import { StarterOption } from '../models/starter';

interface StarterSelectViewProps {
    voidDust: number;
    onSelectStarter: (pokedexId: number) => void;
    onOpenMetaTree: () => void;
    scale: number;
}

const STARTERS: StarterOption[] = [
    {
        pokedexId: 1,
        name: 'BULBASAUR',
        type: 'grass',
        secondaryType: 'poison',
        spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/1.gif',
        abilityName: 'OVERGROW',
        description: 'High HP tank with Vine Whip and piercing Solar Beam.',
    },
    {
        pokedexId: 4,
        name: 'CHARMANDER',
        type: 'fire',
        spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/4.gif',
        abilityName: 'BLAZE',
        description: 'Offensive powerhouse with Ember and Flame Charge phasing.',
    },
    {
        pokedexId: 7,
        name: 'SQUIRTLE',
        type: 'water',
        spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/7.gif',
        abilityName: 'TORRENT',
        description: 'Sturdy defensive shell with Water Gun and Aqua Jet burst.',
    },
    {
        pokedexId: 25,
        name: 'PIKACHU',
        type: 'electric',
        spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/25.gif',
        abilityName: 'STATIC',
        description: 'High-speed electric striker with rapid Thunder Shock.',
    },
];

export function StarterSelectView({
    voidDust,
    onSelectStarter,
    onOpenMetaTree,
    scale,
}: StarterSelectViewProps) {
    const [selectedId, setSelectedId] = useState<number>(4);
    const activeStarter = STARTERS.find(s => s.pokedexId === selectedId) ?? STARTERS[1];

    return (
        <View style={styles.container}>
            <View style={styles.topHeader}>
                <Text style={[styles.title, { fontSize: 18 * scale }]}>
                    SELECT YOUR VESSEL
                </Text>
                <TouchableOpacity style={styles.metaButton} onPress={onOpenMetaTree}>
                    <Text style={[styles.metaText, { fontSize: 11 * scale }]}>
                        GIRATINA CORE ({voidDust} DUST)
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.rosterRow}>
                {STARTERS.map(starter => {
                    const isSelected = starter.pokedexId === selectedId;
                    return (
                        <TouchableOpacity
                            key={starter.pokedexId}
                            style={[
                                styles.starterCard,
                                {
                                    borderColor: isSelected ? GAME_CONFIG.COLORS.CYAN_ACCENT : GAME_CONFIG.COLORS.ARENA_BORDER,
                                    backgroundColor: isSelected ? 'rgba(69, 162, 158, 0.25)' : GAME_CONFIG.COLORS.BUTTON_BG,
                                    width: 140 * scale,
                                    height: 140 * scale,
                                },
                            ]}
                            onPress={() => setSelectedId(starter.pokedexId)}
                        >
                            <Image
                                source={{ uri: starter.spriteUrl }}
                                style={{ width: 64 * scale, height: 64 * scale }}
                                resizeMode="contain"
                            />
                            <Text style={[styles.starterName, { fontSize: 10 * scale }]}>
                                {starter.name}
                            </Text>
                            <Text style={[styles.starterType, { fontSize: 8 * scale }]}>
                                {starter.type.toUpperCase()}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <View style={styles.detailsPanel}>
                <Text style={[styles.descText, { fontSize: 10 * scale }]}>
                    {activeStarter.description}
                </Text>
                <TouchableOpacity
                    style={[styles.startButton, { paddingHorizontal: 28 * scale, paddingVertical: 10 * scale }]}
                    onPress={() => onSelectStarter(activeStarter.pokedexId)}
                >
                    <Text style={[styles.startText, { fontSize: 12 * scale }]}>
                        ENTER DISTORTION RIFT
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: GAME_CONFIG.COLORS.VOID_BG,
        justifyContent: 'space-between',
        padding: 16,
    },
    topHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontWeight: '900',
        color: GAME_CONFIG.COLORS.TEXT_PRIMARY,
        letterSpacing: 2,
    },
    metaButton: {
        backgroundColor: GAME_CONFIG.COLORS.ARENA_FLOOR,
        borderWidth: 1.5,
        borderColor: GAME_CONFIG.COLORS.VOID_DUST_GOLD,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    metaText: {
        fontWeight: '900',
        color: GAME_CONFIG.COLORS.VOID_DUST_GOLD,
        letterSpacing: 1,
    },
    rosterRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
    },
    starterCard: {
        borderWidth: 2,
        borderRadius: GAME_CONFIG.UI.BORDER_RADIUS_MD,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 8,
    },
    starterName: {
        fontWeight: '900',
        color: GAME_CONFIG.COLORS.TEXT_PRIMARY,
        marginTop: 6,
        letterSpacing: 1,
    },
    starterType: {
        fontWeight: '700',
        color: GAME_CONFIG.COLORS.CYAN_ACCENT,
        marginTop: 2,
    },
    detailsPanel: {
        alignItems: 'center',
        gap: 10,
    },
    descText: {
        color: GAME_CONFIG.COLORS.TEXT_SECONDARY,
        fontWeight: '600',
        textAlign: 'center',
    },
    startButton: {
        backgroundColor: GAME_CONFIG.COLORS.ARENA_FLOOR,
        borderWidth: 2,
        borderColor: GAME_CONFIG.COLORS.CYAN_ACCENT,
        borderRadius: GAME_CONFIG.UI.BORDER_RADIUS_MD,
    },
    startText: {
        fontWeight: '900',
        color: GAME_CONFIG.COLORS.CYAN_ACCENT,
        letterSpacing: 2,
    },
});