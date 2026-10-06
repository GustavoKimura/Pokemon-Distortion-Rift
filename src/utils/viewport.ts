import { GAME_CONFIG } from '../config/gameConfig';

export interface ViewportInsets {
    top: number;
    bottom: number;
    left: number;
    right: number;
}

export interface ViewportMetrics {
    scale: number;
    offsetX: number;
    offsetY: number;
    viewportWidth: number;
    viewportHeight: number;
    logicalWidth: number;
    logicalHeight: number;
}

export function calculateViewportMetrics(
    screenWidth: number,
    screenHeight: number,
    insets: ViewportInsets
): ViewportMetrics {
    const availableWidth = screenWidth - (insets.left + insets.right);
    const availableHeight = screenHeight - (insets.top + insets.bottom);
    const logicalWidth = GAME_CONFIG.VIEWPORT.LOGICAL_WIDTH;
    const logicalHeight = GAME_CONFIG.VIEWPORT.LOGICAL_HEIGHT;

    const scale = Math.min(
        availableWidth / logicalWidth,
        availableHeight / logicalHeight
    );

    const viewportWidth = logicalWidth * scale;
    const viewportHeight = logicalHeight * scale;

    const offsetX = insets.left + (availableWidth - viewportWidth) / 2;
    const offsetY = insets.top + (availableHeight - viewportHeight) / 2;

    return {
        scale,
        offsetX,
        offsetY,
        viewportWidth,
        viewportHeight,
        logicalWidth,
        logicalHeight,
    };
}

export function toScreenX(logicalX: number, scale: number, offsetX: number): number {
    return offsetX + logicalX * scale;
}

export function toScreenY(logicalY: number, scale: number, offsetY: number): number {
    return offsetY + logicalY * scale;
}

export function toLogicalX(screenX: number, scale: number, offsetX: number): number {
    return (screenX - offsetX) / scale;
}

export function toLogicalY(screenY: number, scale: number, offsetY: number): number {
    return (screenY - offsetY) / scale;
}

export function scaleDimension(logicalValue: number, scale: number): number {
    return logicalValue * scale;
}