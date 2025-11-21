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

  // Combine all styles
  const buttonClasses = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${className}`;

  // Use styled wrapper for NativeWind
  const StyledTouchable = styled(TouchableOpacity);

  return (
    <StyledTouchable className={buttonClasses} {...props}>
      <Text className={`text-center ${variant === 'primary' ? 'text-white' : 'text-black'}`}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}
