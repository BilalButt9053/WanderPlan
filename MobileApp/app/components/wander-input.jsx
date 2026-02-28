import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { useTheme } from '../hooks/useTheme';

export default function WanderInput({ 
  label, 
  error, 
  icon,
  className = '',
  maxLength = 50,
  ...props 
}) {
  const { colors } = useTheme();
  
  return (
    <View className="w-full mb-4">
      {label && (
        <Text className="mb-2 font-medium" style={{ color: colors.text }}>{label}</Text>
      )}

      <View className="relative w-full min-h-[48px]">
        {icon && (
          <View className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
            {icon}
          </View>
        )}
        <TextInput
          className={`w-full px-4 py-3 border rounded-xl ${icon ? 'pl-11' : ''} text-base ${className}`}
          style={{
            backgroundColor: colors.input,
            borderColor: error ? '#EF4444' : colors.border,
            color: colors.text
          }}
          placeholderTextColor={colors.textTertiary}
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
