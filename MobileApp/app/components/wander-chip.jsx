import React from 'react';
import { View, Text } from 'react-native';

export default function WanderChip({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) {
  const baseStyles = 'rounded-full flex-row items-center gap-1';

  const variantStyles = {
    primary: 'bg-blue-100',
    secondary: 'bg-gray-200',
    accent: 'bg-green-100',
  };

  const sizeStyles = {
    sm: 'px-2 py-1',
    md: 'px-3 py-1.5',
  };

  const textSizeStyles = {
    sm: 'text-xs',
    md: 'text-sm',
  };

  const textColorStyles = {
    primary: 'text-blue-600',
    secondary: 'text-gray-800',
    accent: 'text-green-600',
  };

  return (
    <View
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      <Text className={`${textSizeStyles[size]} ${textColorStyles[variant]} font-medium`}>
        {children}
      </Text>
    </View>
  );
}

export { WanderChip };
