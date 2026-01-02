import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Bell, ThumbsUp, Star, Gift, Award } from 'lucide-react-native';
import { WanderCard } from '../wander-card';

export default function NotificationsTab({ notifications }) {
  const [notifList, setNotifList] = useState(notifications);

  const markAsRead = (id) => {
    setNotifList(notifList.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'like': return <ThumbsUp size={18} color="#F59E0B" />;
      case 'reply': return <Star size={18} color="#3B82F6" />;
      case 'reward': return <Gift size={18} color="#F59E0B" />;
      case 'badge': return <Award size={18} color="#3B82F6" />;
      default: return <Bell size={18} color="#6B7280" />;
    }
  };

  return (
    <View style={{ gap: 12 }}>
      {notifList.length === 0 ? (
        <View className="items-center py-12">
          <Bell size={48} color="#D1D5DB" style={{ marginBottom: 16 }} />
          <Text className="text-gray-600">No notifications yet</Text>
        </View>
      ) : (
        notifList.map((notif) => (
          <TouchableOpacity key={notif.id} onPress={() => markAsRead(notif.id)}>
            <WanderCard
              style={{
                borderLeftWidth: !notif.read ? 4 : 0,
                borderLeftColor: '#3B82F6',
              }}
            >
              <View className="flex-row gap-3">
                <View className="w-10 h-10 rounded-xl bg-gray-100 items-center justify-center">
                  {getIcon(notif.type)}
                </View>
                <View className="flex-1">
                  <Text className={!notif.read ? 'text-gray-900' : 'text-gray-600'}>
                    {notif.text}
                  </Text>
                  <Text className="text-sm text-gray-500 mt-1">{notif.timestamp}</Text>
                </View>
                {!notif.read && (
                  <View
                    className="w-2 h-2 rounded-full mt-2"
                    style={{ backgroundColor: '#3B82F6' }}
                  />
                )}
              </View>
            </WanderCard>
          </TouchableOpacity>
        ))
      )}
    </View>
  );
}
