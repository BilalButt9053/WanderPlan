import React, { useState } from 'react';
import { Image, View, Text } from 'react-native';

const ERROR_IMG_SRC = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==';

export default function ImageWithFallback({ src, alt, className = '', style, ...props }) {
  const [didError, setDidError] = useState(false);

  const handleError = () => {
    setDidError(true);
  };

  if (didError) {
    return (
      <View 
        className={`bg-gray-100 items-center justify-center ${className}`}
        style={style}
        {...props}
      >
        <Image
          source={{ uri: ERROR_IMG_SRC }}
          style={{ width: 88, height: 88 }}
          resizeMode="contain"
        />
      </View>
    );
  }

  return (
    <Image
      source={{ uri: src }}
      className={className}
      style={style}
      onError={handleError}
      {...props}
    />
  );
}

export { ImageWithFallback };
