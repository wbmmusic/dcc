# DCC Application Architecture

## Overview

This application uses a **Service-Oriented Architecture (SOA)** pattern to maintain clean separation of concerns and improve maintainability.

## Directory Structure

```
public/
├── main.ts                    # Application bootstrap (30 lines)
├── DCCApplication.ts          # Main application orchestrator
├── services/                  # Core business services
│   ├── Container.ts           # Dependency injection container
│   ├── StateService.ts        # Centralized state management
│   ├── DCCService.ts          # Hardware communication
│   └── WindowService.ts       # UI window management
├── controllers/               # Request handlers and coordination
│   ├── IPCController.ts       # IPC message routing
│   └── LocomotiveController.ts # Locomotive business logic
├── interfaces/                # Hardware interfaces
│   └── nceUsb.ts             # NCE USB protocol implementation
├── types/                     # Type definitions
└── utilities.ts               # File operations and configuration

src/                           # React renderer process
├── components/                # UI components
├── types/                     # Renderer type definitions
└── ui/                       # UI framework components

shared/
└── types.ts                  # Shared type definitions
```

## Service Responsibilities

### StateService
- **Purpose**: Single source of truth for application state
- **Responsibilities**: 
  - Manage locomotive states (speed, direction, functions)
  - Track switch positions and connection status
  - Emit events on state changes
  - Provide immutable state access

### DCCService  
- **Purpose**: Hardware communication abstraction
- **Responsibilities**:
  - NCE USB protocol implementation
  - DCC command transmission
  - Programming track operations
  - Connection management and error handling

### WindowService
- **Purpose**: UI window lifecycle management
- **Responsibilities**:
  - Create/destroy throttle windows
  - Handle window events and focus
  - Coordinate UI updates with state changes
  - Manage always-on-top throttle behavior

### LocomotiveController
- **Purpose**: Locomotive business logic coordination
- **Responsibilities**:
  - Process throttle commands from UI
  - Coordinate between DCC hardware and state
  - Handle locomotive-specific operations
  - Manage decoder function mappings

### IPCController
- **Purpose**: Message routing between processes
- **Responsibilities**:
  - Register all IPC handlers
  - Route messages to appropriate services
  - Handle file operations and dialogs
  - Maintain clean separation from business logic

## Communication Flow

```
React UI → IPC → IPCController → Service Layer → Hardware
                     ↓
                StateService → Events → WindowService → UI Updates
```

## Benefits

1. **Single Responsibility**: Each service has one clear purpose
2. **Loose Coupling**: Services communicate through events/interfaces
3. **Testability**: Services can be mocked and tested independently
4. **Maintainability**: Easy to locate and fix issues
5. **Scalability**: Simple to add new features or DCC systems

## Adding New Features

1. **New DCC Command**: Add to `DCCService`
2. **New UI Feature**: Add to appropriate controller
3. **New State**: Extend `StateService` interface
4. **New Window Type**: Extend `WindowService`

## Testing Strategy

- **Unit Tests**: Mock dependencies using dependency injection
- **Integration Tests**: Test service interactions
- **E2E Tests**: Test complete user workflows

This architecture transforms a 400+ line monolithic main.ts into a clean, professional, and maintainable codebase.