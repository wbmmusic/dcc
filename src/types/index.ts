// Re-export shared domain types (single source of truth)
export * from '../shared/types';

// Re-export only essential local types
export * from './react';
export * from './forms';

// Essential UI types
export interface SelectOption {
  label: string;
  value: string | number;
}

export interface LayoutComponentProps {
  activeTrack: number;
  setActiveTrack: (track: number) => void;
}

// Generic delete modal state
export interface DeleteModalState<T = any> {
  show: boolean;
  id: string;
  entity?: T;
}