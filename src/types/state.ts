// Component state interfaces
export interface LocoState {
  _id: string;
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
}

export interface EditState {
  name: string;
  address: string | number;
  device?: object;
  reverse?: boolean;
  actions?: object[];
}

export interface DeleteModalState {
  show: boolean;
  id: string;
  consist?: object;
  dcdr?: object;
}

export interface StatusModalState {
  show: boolean;
  action: string;
}