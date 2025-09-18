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

Electron application with React frontend, SerialPort communication for NCE USB interface, multi-window throttle system, and automatic USB device detection with reconnection handling.

## Dependencies

- React
- Electron
- Bootstrap
- Material-UI
- SerialPort
- electron-updater

## Development Notes

Built as a fun programming challenge to create a custom DCC control system. The application is designed to be flexible and expandable for future layout modifications while currently serving Dennis's specific N gauge operations.