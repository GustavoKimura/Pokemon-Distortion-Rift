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

    adb devices

### 2. Target Device Serial
Configure PowerShell session to bind target device:

    $env:ANDROID_SERIAL="b16a69a5"

### 3. Reverse Port Forwarding
Forward Metro Bundler port to device:

    adb -s b16a69a5 reverse tcp:8081 tcp:8081

### 4. Launch Metro Bundler
Start development server bound to localhost:

    npx expo start --localhost

### 5. Launch On Physical Device
In the interactive Metro terminal, press the key "a" to trigger Android launch.

## Project Directory Structure

    docs/
      GDD.md
    src/
      config/
      models/
      services/
      viewmodels/
      components/
      views/
      utils/
    App.tsx
    app.json
    babel.config.js
    metro.config.js
    tsconfig.json