import React, { createContext, useContext, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

const TabsContext = createContext({ activeTab: '', setActiveTab: () => {} });

export function Tabs({ value, onValueChange, children, className = '' }) {
  const [activeTab, setActiveTab] = useState(value || '');

  useEffect(() => {
    if (value !== undefined && value !== activeTab) {
      setActiveTab(value);
    }
  }, [value]);

  const handleChange = (newValue) => {
    setActiveTab(newValue);
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleChange }}>
      <View className={className}>
        {children}
      </View>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className = '' }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className={className}
    >
      <View className="flex-row">
        {children}
      </View>
    </ScrollView>
  );
}

export function TabsTrigger({ value, children, className = '' }) {
  const context = useContext(TabsContext);
  
  if (!context) {
    console.error('TabsTrigger must be used within Tabs');
    return null;
  }
  
  const { activeTab, setActiveTab } = context;
  const isActive = activeTab === value;

  return (
    <TouchableOpacity
      onPress={() => setActiveTab(value)}
      className={`px-4 py-3 ${className}`}
      style={{
        borderBottomWidth: 2,
        borderBottomColor: isActive ? '#3B82F6' : 'transparent',
      }}
    >
      <Text
        className="font-medium"
        style={{ color: isActive ? '#3B82F6' : '#6B7280' }}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );
}

export function TabsContent({ value, children, className = '' }) {
  const context = useContext(TabsContext);
  
  if (!context) {
    console.error('TabsContent must be used within Tabs');
    return null;
  }
  
  const { activeTab } = context;

  if (activeTab !== value) {
    return null;
  }

  return (
    <View className={className}>
      {children}
    </View>
  );
}

export default { Tabs, TabsList, TabsTrigger, TabsContent };
