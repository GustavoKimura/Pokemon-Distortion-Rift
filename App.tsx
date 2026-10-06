import React from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GAME_CONFIG } from './src/config/gameConfig';
import { GameScreen } from './src/views/GameScreen';

export default function App() {
    return (
        <SafeAreaProvider>
            <GestureHandlerRootView style={styles.root}>
                <GameScreen />
            </GestureHandlerRootView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: GAME_CONFIG.COLORS.VOID_BG,
    },
});