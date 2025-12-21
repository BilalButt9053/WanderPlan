import React from 'react';
import { View, Text, TextInput } from 'react-native';

export default function WanderInput({ 
  label, 
  error, 
  icon,
  className = '',
  maxLength = 50,
  ...props 
}) {
  return (
    <View className="w-full mb-4">
      {label && (
        <Text className="mb-2 text-gray-700 font-medium">{label}</Text>
      )}

      <View className="relative w-full min-h-[48px]">
        {icon && (
          <View className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
            {icon}
          </View>
        )}
        <TextInput
          className={`w-full px-4 py-3 bg-white border ${error ? 'border-red-500' : 'border-gray-300'} rounded-xl ${icon ? 'pl-11' : ''} text-base text-gray-700 ${className}`}
          maxLength={maxLength}
          {...props}
        />
        {error && (
          <Text className="absolute -bottom-4 left-0 text-xs text-red-600">{error}</Text>
        )}
      </View>
    </View>
  );
}
