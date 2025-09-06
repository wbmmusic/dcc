# Big D's Railroad

React + Electron desktop application for comprehensive DCC (Digital Command Control) model railroad layout management. This professional-grade control system provides complete locomotive control, decoder programming, and layout automation for serious model railroad enthusiasts.

## Key Features

- **Locomotive Control**: Individual throttle windows with speed, direction, and function control for multiple locomotives simultaneously
- **DCC Programming**: Programming track support for reading/writing CVs (Configuration Variables) to decoders with comprehensive error handling
- **NCE USB Interface**: Full integration with NCE PowerCab and USB interface for reliable DCC command station communication
- **Switch Control**: Automated turnout and switch control with macro programming capabilities for complex route management
- **Accessory Management**: Control of signals, lights, and other layout accessories with custom programmable actions
- **Consist Management**: Multiple unit locomotive consists with synchronized control for realistic operations
- **Decoder Database**: Comprehensive decoder definitions for various manufacturers (ESU LokSound, TCS, etc.) with CV mapping
- **Macro System**: Programmable macros for complex layout operations and automated sequences
- **Backup/Restore**: Complete layout configuration backup and restore functionality for data protection
- **Multi-Window Interface**: Separate throttle windows for each locomotive with always-on-top capability for operational convenience
- **Professional Features**: Auto-updater, configuration management, and comprehensive error handling for reliable operation

## Architecture

Electron application with React frontend, serial communication via NCE USB interface, and multi-window throttle system designed for professional model railroad control and automation.

## Model Railroad Usage

Designed for serious model railroad enthusiasts with complex DCC layouts requiring professional-grade locomotive control, decoder programming, and layout automation capabilities.

## Dependencies

- React
- Electron
- Bootstrap
- Material-UI
- SerialPort
- electron-updater