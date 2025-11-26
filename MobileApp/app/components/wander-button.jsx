import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

export function WanderButton({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  className = '',
  onPress,
  ...props
}) {
  const baseStyles = 'rounded-2xl flex items-center justify-center gap-2 transition-transform';

  const variantStyles = {
    primary: 'bg-blue-600 text-white shadow-sm',
    secondary: 'bg-gray-200 text-gray-800',
    outline: 'border-2 border-blue-600 text-blue-600',
    ghost: 'bg-transparent text-gray-800',
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
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

export default WanderButton;
