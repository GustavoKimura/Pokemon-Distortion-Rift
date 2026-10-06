# Pokemon Distortion Rift

Top-down real-time action roguelite engine built on React Native, Expo SDK 52, TypeScript, React Native Reanimated v3, and Gesture Handler. Powered by the public PokeAPI.

## Technical Architecture
- Pattern: Model-View-ViewModel (MVVM)
- Engine: 60 FPS deterministic loop via Reanimated Worklets
- Target Hardware: Android physical devices via USB reverse tunneling
- State Management: Custom reactive hooks without JSX coupling

## Android Device Settings
Ensure the following configurations are set inside Developer Options:
- USB Debugging: Enabled
- Install via USB: Enabled
- Verify apps over USB: Disabled

## Prerequisites
- Node.js 18+ LTS
- Android SDK Platform-Tools (ADB)
- Expo Go APK installed on target device
- USB Debugging enabled on target device

## Development Workflow

### 1. Reset ADB Daemon
Ensure clean ADB communication:

    adb kill-server
    adb start-server

### 2. Manual APK Installation via Push
Transfer the APK to device Downloads folder:

    adb push "C:\Users\Admin\.expo\android-apk-cache\Expo-Go-2.32.20.apk" /sdcard/Download/ExpoGo.apk

Open device File Manager, locate Downloads, and install ExpoGo.apk.

### 3. Reverse Port Forwarding
Forward Metro Bundler port to connected Android device:

    adb reverse tcp:8081 tcp:8081

### 4. Launch Metro Bundler
Start development server bound to localhost:

    npx expo start --localhost

### 5. Launch Application
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