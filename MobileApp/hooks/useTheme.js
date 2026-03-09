import { useSelector } from 'react-redux';

export const useTheme = () => {
  const isDarkMode = useSelector((state) => state.theme?.isDarkMode || false);

  const colors = {
    background: isDarkMode ? '#1F2937' : '#FFFFFF',
    surface: isDarkMode ? '#374151' : '#F9FAFB',
    text: isDarkMode ? '#F9FAFB' : '#111827',
    textSecondary: isDarkMode ? '#D1D5DB' : '#6B7280',
    textTertiary: isDarkMode ? '#9CA3AF' : '#9CA3AF',
    border: isDarkMode ? '#4B5563' : '#E5E7EB',
    card: isDarkMode ? '#374151' : '#FFFFFF',
    input: isDarkMode ? '#4B5563' : '#F3F4F6',
    primary: '#3B82F6',
    secondary: '#10B981',
    accent: '#F59E0B',
    error: '#EF4444',
  };

  return { isDarkMode, colors };
};
