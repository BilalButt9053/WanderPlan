import React from 'react';
import { View } from 'react-native';

export default function Progress({ value = 0, className = '' }) {
  return (
    <View className={`w-full bg-gray-200 rounded-full overflow-hidden ${className}`}>
      <View 
        className="bg-green-500 h-full rounded-full"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </View>
  );
}

export { Progress };
