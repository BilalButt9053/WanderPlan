import { useState, useCallback } from 'react';

export const useToast = () => {
  const toast = useCallback(({ title, description, variant = 'default' }) => {
    // Simple alert for now - you can implement a proper toast system later
    const message = `${title}${description ? '\n' + description : ''}`;
    
    if (variant === 'destructive') {
      alert('❌ ' + message);
    } else {
      alert('✓ ' + message);
    }
  }, []);

  return { toast };
};
