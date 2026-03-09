import React, { useState } from 'react';
import { Image, View, Text } from 'react-native';

const ERROR_IMG_SRC = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==';
const DEFAULT_IMG = 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=400';

/**
 * Safely extracts image URL from various formats
 * @param {string|object} src - Image source (string URL or object with url property)
 * @returns {string} Valid image URL
 */
const extractImageUrl = (src) => {
  if (!src) return DEFAULT_IMG;
  if (typeof src === 'string') return src;
  if (typeof src === 'object' && src.url) return src.url;
  if (typeof src === 'object' && src.uri) return src.uri;
  return DEFAULT_IMG;
};

export default function ImageWithFallback({ src, alt, className = '', style, ...props }) {
  const [didError, setDidError] = useState(false);
  
  // Safely extract URL
  const imageUrl = extractImageUrl(src);

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
      source={{ uri: imageUrl }}
      className={className}
      style={style}
      onError={handleError}
      {...props}
    />
  );
}

export { ImageWithFallback };
