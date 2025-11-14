import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { styled } from 'nativewind';

export default function WanderButton({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  className = '',
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

  // Combine all styles
  const buttonClasses = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${className}`;

  // Use styled wrapper for NativeWind
  const StyledTouchable = styled(TouchableOpacity);

  return (
    <StyledTouchable className={buttonClasses} {...props}>
      <Text className={`text-center ${variant === 'primary' ? 'text-white' : 'text-black'}`}>
        {children}
      </Text>
    </StyledTouchable>
  );
}
