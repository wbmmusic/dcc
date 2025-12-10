// Re-export all types for easy importing
export * from './dcc';
export * from './react';
export * from './events';
export * from './state';
export * from './handlers';

// CSS Property fixes
export type TextAlign = 'left' | 'right' | 'center' | 'justify' | 'start' | 'end';

// Event handler types
export type EventHandler<T = Event> = (event: T) => void;
export type ChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => void;
export type ClickHandler = (event: React.MouseEvent<HTMLButtonElement>) => void;

// Common state types
export interface DeleteModal {
  show: boolean;
  id: string;
}

export interface StatusModal {
  show: boolean;
  action: string;
}

// Layout component props
export interface LayoutComponentProps {
  activeTrack: number;
  setActiveTrack: (track: number) => void;
}