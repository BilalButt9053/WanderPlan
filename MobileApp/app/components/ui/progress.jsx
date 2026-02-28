import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

export default function Progress({ value = 0, className = '' }) {
  const { colors } = useTheme();
  
  return (
    <View className={`w-full rounded-full overflow-hidden ${className}`} style={{ backgroundColor: colors.input }}>
      <View 
        className="h-full rounded-full"
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, backgroundColor: colors.secondary }}
      />
    </View>
  );
}

export { Progress };
