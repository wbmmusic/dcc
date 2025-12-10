import { ReactNode, CSSProperties } from 'react';

// Common React component prop types
export interface BaseComponentProps {
  children?: ReactNode;
  style?: CSSProperties;
  className?: string;
}

export interface ModalProps {
  show: boolean;
  onHide: () => void;
  children: ReactNode;
  title?: string;
  footer?: ReactNode;
}

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface LayoutProps {
  activeTrack: number;
  setActiveTrack: (track: number) => void;
}

export interface LocoBarProps {
  selectedLoco: number;
  selectLoco: (index: number) => void;
}

export interface LocoControlProps {
  selectedLoco: number;
}

export interface LocoIconProps {
  loco: Locomotive;
  index: number;
  selectedLoco: number;
  selectLoco?: (index: number) => void;
  selected?: (index: number) => void;
  color: string;
  numberOfLocos?: number;
}