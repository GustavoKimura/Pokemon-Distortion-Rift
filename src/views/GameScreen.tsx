import React, { useEffect } from 'react';
import { StyleSheet, View, useWindowDimensions, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GAME_CONFIG } from '../config/gameConfig';
import { calculateViewportMetrics } from '../utils/viewport';
import { useGameLoop } from '../viewmodels/useGameLoop';
import { ArenaView } from './ArenaView';
import { GameHudView } from './GameHudView';
import { StarterSelectView } from './StarterSelectView';
import { MetaProgressionModal } from './MetaProgressionModal';
import { TouchControlsOverlay } from '../components/controls/TouchControlsOverlay';
import { logger } from '../utils/logger';

export function GameScreen() {
    const { width, height } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const metrics = calculateViewportMetrics(width, height, insets);
    const {
        gameState,
        startRun,
        upgradeTalent,
        openMetaTree,
        closeMetaTree,
        setJoystickInput,
        handleAction,
        restartGame,
    } = useGameLoop();

    useEffect(() => {
        logger.info('SYSTEM', 'GameScreen layout ready');
        if (Platform.OS === 'android') {
            NavigationBar.setVisibilityAsync('hidden').catch(() => { });
        }
    }, []);

    return (
        <View style={styles.root}>
            <StatusBar style="light" hidden={true} />
            <View
                style={[
                    styles.viewport,
                    {
                        width: metrics.viewportWidth,
                        height: metrics.viewportHeight,
                        left: metrics.offsetX,
                        top: metrics.offsetY,
                    },
                ]}
            >
                {gameState.status === 'select_starter' && (
                    <StarterSelectView
                        voidDust={gameState.voidDust}
                        onSelectStarter={startRun}
                        onOpenMetaTree={openMetaTree}
                        scale={metrics.scale}
                    />
                )}

                {gameState.status === 'meta_tree' && (
                    <MetaProgressionModal
                        voidDust={gameState.voidDust}
                        talents={gameState.talents}
                        onUpgrade={upgradeTalent}
                        onClose={closeMetaTree}
                        scale={metrics.scale}
                    />
                )}

                {(gameState.status === 'playing' || gameState.status === 'game_over') && (
                    <>
                        <ArenaView
                            player={gameState.player}
                            enemies={gameState.enemies}
                            projectiles={gameState.projectiles}
                            items={gameState.items}
                            floatingDamages={gameState.floatingDamages}
                            targetEnemyId={gameState.targetEnemyId}
                            isBlazeActive={gameState.isBlazeActive}
                            playerAilment={gameState.playerAilment}
                            enemyAilments={gameState.enemyAilments}
                            scale={metrics.scale}
                        />

                        <GameHudView
                            player={gameState.player}
                            currentWave={gameState.currentWave}
                            kills={gameState.kills}
                            voidDust={gameState.voidDust}
                            fps={gameState.fps}
                            status={gameState.status}
                            isBlazeActive={gameState.isBlazeActive}
                            playerAilment={gameState.playerAilment}
                            onRestart={restartGame}
                            scale={metrics.scale}
                        />

                        {gameState.player && gameState.status === 'playing' && (
                            <TouchControlsOverlay
                                onJoystickMove={setJoystickInput}
                                onActionPress={handleAction}
                                cooldowns={gameState.cooldowns}
                                ultimateEnergy={gameState.player.ultimateEnergy}
                            />
                        )}
                    </>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: GAME_CONFIG.COLORS.VOID_BG,
    },
    viewport: {
        position: 'absolute',
        backgroundColor: GAME_CONFIG.COLORS.ARENA_FLOOR,
        borderWidth: 2,
        borderColor: GAME_CONFIG.COLORS.ARENA_BORDER,
        borderRadius: GAME_CONFIG.UI.BORDER_RADIUS_MD,
        overflow: 'hidden',
    },
});