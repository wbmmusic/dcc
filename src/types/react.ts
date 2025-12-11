/**
 * React Component Props Types
 */

import type { Locomotive } from '../shared/types';

export interface LocoControlProps {
  selectedLoco: string;
}

export interface LocoBarProps {
  selectedLoco: string;
  onSelectLocomotive: (locomotiveId: string) => void;
}

export interface LocoIconProps {
  loco: Locomotive;
  idx: number;
  selectedLoco: string;
  setSelectedLoco: (locomotiveId: string) => void;
  numberOfLocos?: number;
  color?: string;
}