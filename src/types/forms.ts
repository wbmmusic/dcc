/**
 * Form-specific types for UI components
 * These handle the string/number conversion between forms and data models
 */

import { Locomotive, Decoder, Switch, Consist, Macro, Accessory } from '../shared/types';

// Form versions where numbers are strings (from HTML inputs)

export interface LocomotiveForm extends Omit<Locomotive, 'number' | 'address'> {
  number: string;
  address: string;
}

export interface SwitchForm extends Omit<Switch, 'address'> {
  address: string;
}

export interface ConsistForm extends Omit<Consist, 'address'> {
  address: string;
}

export interface AccessoryForm extends Omit<Accessory, 'address'> {
  address: string;
}

// Helper functions to convert between form and data types
export const locomotiveFormToData = (form: LocomotiveForm): Locomotive => ({
  ...form,
  number: parseInt(form.number),
  address: parseInt(form.address)
});

export const locomotiveDataToForm = (data: Locomotive): LocomotiveForm => ({
  ...data,
  number: data.number.toString(),
  address: data.address.toString()
});

export const switchFormToData = (form: SwitchForm): Switch => ({
  ...form,
  address: parseInt(form.address)
});

export const switchDataToForm = (data: Switch): SwitchForm => ({
  ...data,
  address: data.address.toString()
});