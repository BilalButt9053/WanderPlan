import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

export function WanderButton({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  onPress,
  className = '',
  ...props
}) {
  const baseStyles = 'rounded-2xl flex items-center justify-center gap-2';

  const variantStyles = {
    primary: 'bg-blue-600',
    secondary: 'bg-gray-200',
    outline: 'border-2 border-blue-600 bg-transparent',
    ghost: 'bg-transparent',
  };

  const sizeStyles = {
    sm: 'px-4 py-2',
    md: 'px-6 py-3',
    lg: 'px-8 py-4',
  };

  const widthStyles = fullWidth ? 'w-full' : '';

  return (
    <TouchableOpacity 
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${className}`}
      onPress={onPress}
      {...props}
    >
      <Text className={`text-center font-semibold ${
        variant === 'primary' ? 'text-white text-lg' : 
        variant === 'outline' ? 'text-blue-600 text-lg' :
        'text-gray-800 text-lg'
      }`}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}
