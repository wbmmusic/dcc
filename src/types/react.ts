/**
 * React Component Props Types
 */

export interface LocoControlProps {
  selectedLoco: number;
}

export interface LocoBarProps {
  selectedLoco: number;
  setSelectedLoco: (index: number) => void;
}

import type { Locomotive } from '../shared/types';

export interface LocoIconProps {
  loco: Locomotive;
  idx: number;
  selectedLoco: number;
  setSelectedLoco: (index: number) => void;
  numberOfLocos?: number;
  color?: string;
}