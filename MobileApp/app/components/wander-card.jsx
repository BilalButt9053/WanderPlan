import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useTheme } from '../hooks/useTheme';

export default function WanderCard({
  children,
  padding = 'md',
  className = '',
  hover = false,
  onPress,
  style,
  ...props
}) {
  const { colors } = useTheme();
  const baseStyles = 'rounded-2xl shadow-sm';

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
      style={[
        { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 },
        style
      ]}
      {...(onPress ? { onPress, activeOpacity: hover ? 0.7 : 1 } : {})}
      {...props}
    >
      {children}
    </Component>
  );
}

export { WanderCard };
