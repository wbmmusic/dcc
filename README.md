# Big D's Railroad

Custom DCC (Digital Command Control) application built for Dennis's N gauge model railroad. This Electron-based React app provides intuitive locomotive control, decoder programming, and layout automation through NCE PowerCab integration.

## Key Features

- **Multi-Locomotive Control**: Simultaneous operation of up to 3 locomotives with separate always-on-top throttle windows
- **NCE PowerCab Integration**: Auto-detecting USB interface with automatic reconnection handling
- **Programming Track Support**: CV programming and decoder configuration on dedicated programming track
- **Sound Decoder Functions**: Toggle and momentary function control for horns, bells, lights, and sound effects
- **Layout Automation**: Macro system for controlling multiple switches and scenic elements simultaneously
- **Visual Layout Interface**: Main window layout view for intuitive train operations
- **Consist Management**: Multi-unit locomotive control with synchronized speed and direction
- **Backup/Restore**: Configuration and locomotive roster backup with image preservation
- **Auto-Updates**: Seamless software updates without manual intervention
- **Customizable Decoders**: Built-in decoder definitions with user customization capabilities

## Hardware Requirements

- NCE PowerCab DCC system
- NCE USB interface for PowerCab
- Windows computer with available USB port

## Usage

Designed specifically for Dennis's N gauge layout operations, featuring occasional operating sessions with simple switch control and scenic automation. The app handles typical home layout scenarios with 3 concurrent locomotives and basic accessory control.

## Technical Architecture

**Service-Oriented Architecture** with clean separation of concerns:

- **Main Process**: Service-oriented design with dependency injection
  - `DCCService`: Hardware communication (NCE USB protocol)
  - `StateService`: Centralized state management with event system
  - `WindowService`: Multi-window throttle management
  - `LocomotiveController`: Business logic coordination
  - `IPCController`: Message routing between processes

- **Renderer Process**: React frontend with TypeScript
  - Component-based UI with Material-UI
  - Real-time locomotive control interfaces
  - Configuration and programming dialogs

- **Communication**: 
  - SerialPort for NCE USB interface
  - IPC for main/renderer coordination
  - Event-driven state updates
  - Automatic USB device detection with reconnection

- **Build System**: Electron Forge + Vite with TypeScript compilation

## Dependencies

- React 19
- Electron 39
- Electron Forge + Vite
- TypeScript
- Bootstrap
- Material-UI
- SerialPort
- electron-updater

## Development

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm dev

# Package for distribution
pnpm package

# Create installer
pnpm make
```

## Architecture Benefits

- **Maintainable**: Each service has single responsibility
- **Testable**: Services can be unit tested independently  
- **Scalable**: Easy to add new DCC features or support multiple systems
- **Type-Safe**: Full TypeScript coverage with shared type definitions
- **Professional**: Enterprise-grade patterns with dependency injection

## Recent Updates

- **Drag & Drop Reordering**: Replaced arrow buttons with intuitive drag handles for locomotive reordering
- **Enhanced Locomotive Management**: Added search, show all/hide all functions, and card-based layout
- **Improved UI/UX**: Dark-themed modals, better button organization, and locomotive visibility controls
- **Fixed Button Colors**: Reorganized theme colors so only E-Stop and Delete buttons are red
- **Throttle Window Sync**: Fixed bidirectional synchronization between main window and throttle windows
- **Window Titles**: Throttle windows now show locomotive numbers, main window shows app version
- **ID-Based Architecture**: Converted from index-based to ID-based locomotive selection for better consistency

## Development Notes

Built as a programming challenge to create a custom DCC control system using modern software architecture patterns. The service-oriented design makes it flexible and expandable for future layout modifications while currently serving Dennis's specific N gauge operations.