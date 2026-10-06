# Pokemon Distortion Rift

Top-down real-time action roguelite engine built on React Native, Expo SDK 52, TypeScript, React Native Reanimated v3, and Gesture Handler. Powered by the public PokeAPI.

## Technical Architecture
- Pattern: Model-View-ViewModel (MVVM)
- Engine: 60 FPS deterministic loop via Reanimated Worklets
- Target Hardware: Android physical devices (Xiaomi Redmi) via USB reverse tunneling
- State Management: Custom reactive hooks without JSX coupling

## Prerequisites
- Node.js 18+ LTS
- Android SDK Platform-Tools (ADB)
- Expo Go installed on target Android device
- USB Debugging enabled on target device

## Development Workflow

### 1. Identify Target Device
Check active device serial:
```powershell
adb devices