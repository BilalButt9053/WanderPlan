import React from 'react';
import { View, TouchableOpacity } from 'react-native';

export default function WanderCard({
  children,
  padding = 'md',
  className = '',
  hover = false,
  onPress,
  ...props
}) {
  const baseStyles = 'bg-white rounded-2xl shadow-sm border border-gray-200';

  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  // Only make touchable when an onPress is provided
  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      className={`${baseStyles} ${paddingStyles[padding]} ${className}`}
      {...(onPress ? { onPress, activeOpacity: hover ? 0.7 : 1 } : {})}
      {...props}
    >
      {children}
    </Component>
  );
}

export { WanderCard };
