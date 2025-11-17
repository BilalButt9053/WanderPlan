import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { styled } from 'nativewind';

export default function WanderInput({ 
  label, 
  error, 
  icon,
  className = '',
  ...props 
}) {
  const StyledInput = styled(TextInput);

  return (
    <View className="w-full mb-2">
      {label && (
        <Text className="mb-2 text-gray-800 font-medium">{label}</Text>
      )}

      <View className="relative w-full">
        {icon && (
          <View className="absolute left-4 top-1/2 -translate-y-1/2">
            {icon}
          </View>
        )}
        <StyledInput
          className={`w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-2xl ${icon ? 'pl-12' : ''} focus:ring-2 focus:ring-blue-300 ${className}`}
          {...props}
        />
      </View>

      {error && (
        <Text className="mt-1 text-sm text-red-600">{error}</Text>
      )}
    </View>
  );
}
