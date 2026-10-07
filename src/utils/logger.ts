import { GAME_CONFIG } from '../config/gameConfig';

export type LogCategory =
    | 'PHYSICS'
    | 'COMBAT'
    | 'PERF'
    | 'INPUT'
    | 'POKEAPI'
    | 'SPAWNER'
    | 'SYSTEM';

function formatTimestamp(): string {
    const d = new Date();
    const time = d.toTimeString().split(' ')[0];
    const ms = String(d.getMilliseconds()).padStart(3, '0');
    return `${time}.${ms}`;
}

export const logger = {
    debug(category: LogCategory, message: string, data?: unknown): void {
        if (!GAME_CONFIG.LOGGING.ENABLED) return;
        if (data !== undefined) {
            console.log(`[${category}][DEBUG][${formatTimestamp()}] ${message}`, data);
        } else {
            console.log(`[${category}][DEBUG][${formatTimestamp()}] ${message}`);
        }
    },

    info(category: LogCategory, message: string, data?: unknown): void {
        if (!GAME_CONFIG.LOGGING.ENABLED) return;
        if (data !== undefined) {
            console.log(`[${category}][INFO][${formatTimestamp()}] ${message}`, data);
        } else {
            console.log(`[${category}][INFO][${formatTimestamp()}] ${message}`);
        }
    },

    warn(category: LogCategory, message: string, data?: unknown): void {
        if (!GAME_CONFIG.LOGGING.ENABLED) return;
        if (data !== undefined) {
            console.warn(`[${category}][WARN][${formatTimestamp()}] ${message}`, data);
        } else {
            console.warn(`[${category}][WARN][${formatTimestamp()}] ${message}`);
        }
    },

    error(category: LogCategory, message: string, error?: unknown): void {
        if (!GAME_CONFIG.LOGGING.ENABLED) return;
        if (error !== undefined) {
            console.error(`[${category}][ERROR][${formatTimestamp()}] ${message}`, error);
        } else {
            console.error(`[${category}][ERROR][${formatTimestamp()}] ${message}`);
        }
    },

    perf(tag: string, fps: number, frameTimeMs: number, entityStats: string): void {
        if (!GAME_CONFIG.LOGGING.ENABLED) return;
        console.log(
            `[PERF][${formatTimestamp()}] ${tag} -> FPS: ${fps} | FrameTime: ${frameTimeMs.toFixed(1)}ms | ${entityStats}`
        );
    },
};