/**
 * Shared DCC Types
 * 
 * Common type definitions used by both the main process (Electron) and 
 * renderer process (React). These represent the core DCC domain objects.
 */

export interface Locomotive {
  _id: string;
  hidden: boolean;
  name: string;
  number: number;
  address: number;
  model: string;
  photo: string;
  decoder: string;
}

export interface Decoder {
  _id: string;
  name: string;
  model: string;
  manufacturer: string;
  functions: DecoderFunction[];
}

export interface DecoderFunction {
  name: string;
  action: 'toggle' | 'momentary';
}

export interface Switch {
  _id: string;
  name: string;
  address: number;
  reverse: boolean;
  state: boolean;
}

export interface Accessory {
  _id: string;
  name: string;
  address: number;
  device: AccessoryDevice;
}

export interface AccessoryDevice {
  name: string;
  actions: AccessoryAction[];
}

export interface AccessoryAction {
  name: string;
  action: string;
  idx: number;
}

export interface Consist {
  _id: string;
  name: string;
  address: number;
  locos: ConsistLoco[];
  enabled?: boolean;
}

export interface ConsistLoco {
  _id: string;
  forward: boolean;
  enabled: boolean;
}

export interface Macro {
  _id: string;
  name: string;
  actions: MacroAction[];
}

export interface MacroAction {
  switch: string;
  state: 'open' | 'close';
}

export interface LocoState {
  name: string;
  number: number;
  photo: string;
  direction: 'forward' | 'reverse';
  speed: number;
  functions: LocoFunction[];
}

export interface LocoFunction {
  name: string;
  state: boolean;
  action?: 'toggle' | 'momentary';
}

export interface Settings {
  usbInterface: {
    type: string;
    port: string;
  };
}

export interface SerialPort {
  path: string;
  serialNumber: string;
}

export interface Config {
  locos: Locomotive[];
  decoders: Decoder[];
  switches: Switch[];
  macros: Macro[];
  accessories: Accessory[];
  consists: Consist[];
}

export interface DCCCommand {
  type: 'locoCtrlCmd' | 'asyncSignal' | 'opsProgramming' | 'enableProgrammingTrack' | 'disableProgrammingTrack' | 'readCvPrg';
  data?: any;
  callback?: (result: any) => void;
}