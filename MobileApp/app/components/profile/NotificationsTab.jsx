import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Bell, ThumbsUp, Star, Gift, Award, MessageCircle, MapPin, Heart } from 'lucide-react-native';
import { WanderCard } from '../wander-card';
import { useMarkNotificationAsReadMutation, useMarkAllNotificationsAsReadMutation } from '../../../redux/api/userProfileApi';

export default function NotificationsTab({ notifications = [], unreadCount = 0, isLoading }) {
  const [notifList, setNotifList] = useState(notifications);
  const [markAsRead] = useMarkNotificationAsReadMutation();
  const [markAllAsRead] = useMarkAllNotificationsAsReadMutation();

  useEffect(() => {
    setNotifList(notifications);
  }, [notifications]);

  const handleMarkAsRead = async (id) => {
    // Optimistically update UI
    setNotifList(notifList.map(n => n.id === id ? { ...n, read: true } : n));
    try {
      await markAsRead(id).unwrap();
    } catch (error) {
      // Revert on error
      setNotifList(notifList);
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    // Optimistically update UI
    const originalList = [...notifList];
    setNotifList(notifList.map(n => ({ ...n, read: true })));
    try {
      await markAllAsRead().unwrap();
    } catch (error) {
      // Revert on error
      setNotifList(originalList);
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'like': return <ThumbsUp size={18} color="#F59E0B" />;
      case 'comment': return <MessageCircle size={18} color="#3B82F6" />;
      case 'follow': return <Heart size={18} color="#EC4899" />;
      case 'reply': return <Star size={18} color="#3B82F6" />;
      case 'reward': return <Gift size={18} color="#F59E0B" />;
      case 'badge': return <Award size={18} color="#3B82F6" />;
      case 'trip': return <MapPin size={18} color="#10B981" />;
      case 'review': return <Star size={18} color="#F59E0B" />;
      default: return <Bell size={18} color="#6B7280" />;
    }
  };

  if (isLoading) {
    return (
      <View className="items-center justify-center py-12">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-500 mt-4">Loading notifications...</Text>
      </View>
    );
  }

  const unreadNotifications = notifList.filter(n => !n.read);

  return (
    <View style={{ gap: 12 }}>
      {/* Mark All as Read button */}
      {unreadNotifications.length > 0 && (
        <TouchableOpacity
          onPress={handleMarkAllAsRead}
          className="self-end"
        >
          <Text className="text-blue-500 text-sm font-medium">Mark all as read</Text>
        </TouchableOpacity>
      )}

      {notifList.length === 0 ? (
        <View className="items-center py-12">
          <Bell size={48} color="#D1D5DB" style={{ marginBottom: 16 }} />
          <Text className="text-gray-600">No notifications yet</Text>
          <Text className="text-gray-400 text-sm mt-1">
            We'll notify you about important updates
          </Text>
        </View>
      ) : (
        notifList.map((notif) => (
          <TouchableOpacity key={notif.id} onPress={() => !notif.read && handleMarkAsRead(notif.id)}>
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
