import React from 'react';
import { Switch as RNSwitch } from 'react-native';

export function Switch({ checked, onCheckedChange, disabled = false }) {
  return (
    <RNSwitch
      value={checked}
      onValueChange={onCheckedChange}
      disabled={disabled}
      trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
      thumbColor={checked ? '#3B82F6' : '#F3F4F6'}
      ios_backgroundColor="#D1D5DB"
    />
  );
}

export default Switch;
