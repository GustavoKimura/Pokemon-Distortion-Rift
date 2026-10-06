# Pokemon Distortion Rift

Top-down real-time action roguelite engine built on React Native, Expo SDK 57, TypeScript, React Native Reanimated, and Gesture Handler. Powered by the public PokeAPI.

## Technical Architecture
- Pattern: Model-View-ViewModel (MVVM)
- Engine: 60 FPS deterministic loop via Reanimated Worklets
- Target Hardware: Android physical devices via Wi-Fi LAN or USB reverse tunneling
- State Management: Custom reactive hooks without JSX coupling

## Prerequisites
- Node.js 18+ LTS
- Target Android device and PC connected to the same Wi-Fi network
- Expo Go application installed from Google Play Store on target device

## Development Workflow (Wi-Fi LAN)

### 1. Launch Metro Bundler on Local Network
Start Metro server in LAN mode:

    npx expo start --lan

### 2. Connect Mobile Device
Open Expo Go on the physical Android device:
- Tap "Scan QR code" and scan the terminal QR code, OR
- Select the development server listed on the Expo Go home screen, OR
- Tap "Enter URL manually" and input the exp URL displayed in the terminal.

## Alternative Workflow (USB ADB)
If Wi-Fi isolation is enabled on the router:

    adb reverse tcp:8081 tcp:8081
    npx expo start --localhost

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