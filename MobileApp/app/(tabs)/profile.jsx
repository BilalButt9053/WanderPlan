import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Share,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useDispatch, useSelector } from 'react-redux';
import { logout, updateUser } from '../../redux/slices/authSlice';
import { useRouter } from 'expo-router';
import {
  Settings,
  Bell,
  Star,
  Bookmark,
  Award,
  MapPin,
  TrendingUp,
  Edit,
  Trash2,
  Gift,
  Calendar,
  ThumbsUp,
  Eye,
  CheckCircle,
  Clock,
  ChevronRight,
} from 'lucide-react-native';
import  WanderButton  from '../components/wander-button';
import  WanderCard  from '../components/wander-card';
import  WanderChip  from '../components/wander-chip';
import  Progress  from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import  ImageWithFallback  from '../components/ImageWithFallback';
import { SettingsScreen } from '../screens/SettingsScreen';
import { SafeAreaView } from 'react-native-safe-area-context';

const userProfileData = {
  name: 'John Doe',
  username: '@johndoe',
  avatar: 'JD',
  level: 7,
  points: 2450,
  nextLevelPoints: 3000,
  location: 'New York, USA',
  memberSince: 'January 2024',
  stats: {
    reviews: 42,
    trips: 15,
    saved: 28,
    helpful: 156,
  },
  badges: [
    { id: '1', name: 'Top Contributor', icon: '🏆', description: '50+ reviews', unlocked: true },
    { id: '2', name: 'Travel Expert', icon: '✈️', description: '10+ trips', unlocked: true },
    { id: '3', name: 'Helpful Guide', icon: '👍', description: '100+ helpful votes', unlocked: true },
    { id: '4', name: 'Food Critic', icon: '🍽️', description: '25+ food reviews', unlocked: true, progress: 80 },
    { id: '5', name: 'Explorer', icon: '🗺️', description: '5 different countries', unlocked: false, progress: 60 },
  ],
};

const rewardsData = [
  {
    id: '1',
    title: '20% Off at Grand Hotel',
    discount: '20%',
    type: 'hotel',
    expiresAt: '2024-12-31',
    isRedeemed: false,
    code: 'WANDER20',
  },
  {
    id: '2',
    title: '15% Off Restaurant Voucher',
    discount: '15%',
    type: 'restaurant',
    expiresAt: '2024-11-30',
    isRedeemed: false,
    code: 'FOOD15',
  },
  {
    id: '3',
    title: '10% Travel Discount',
    discount: '10%',
    type: 'travel',
    expiresAt: '2024-10-31',
    isRedeemed: true,
    code: 'TRIP10',
  },
];

const savedTripsData = [
  {
    id: '1',
    destination: 'Paris, France',
    image: 'https://images.unsplash.com/photo-1431274172761-fca41d930114?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXJpcyUyMGVpZmZlbCUyMHRvd2VyfGVufDF8fHx8MTc2MDMyODIyMnww&ixlib=rb-4.1.0&q=80&w=1080',
    budget: 3500,
    savedAt: '2 weeks ago',
  },
  {
    id: '2',
    destination: 'Tokyo, Japan',
    image: 'https://images.unsplash.com/photo-1602283662099-1c6c158ee94d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b2t5byUyMGphcGFuJTIwY2l0eXxlbnwxfHx8fDE3NjAzMjgyMjJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    budget: 4000,
    savedAt: '1 month ago',
  },
];

const notificationsData = [
  {
    id: '1',
    type: 'like',
    text: 'Sarah M. liked your review of La Bella Cucina',
    timestamp: '2 hours ago',
    read: false,
  },
  {
    id: '2',
    type: 'reward',
    text: 'You unlocked a 20% hotel discount coupon! 🎉',
    timestamp: '1 day ago',
    read: false,
  },
  {
    id: '3',
    type: 'badge',
    text: 'Congratulations! You earned the "Top Contributor" badge',
    timestamp: '3 days ago',
    read: true,
  },
  {
    id: '4',
    type: 'reply',
    text: 'Alex replied to your review',
    timestamp: '5 days ago',
    read: true,
  },
];

const Profile = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector((state) => state.auth.user);
  const [activeTab, setActiveTab] = useState('overview');
  const [userProfile] = useState(userProfileData);
  const [showSettings, setShowSettings] = useState(false);

  const progressPercentage = (userProfile.points / userProfile.nextLevelPoints) * 100;

  const handleOpenSettings = () => {
    setShowSettings(true);
  };

  const handleImagePicker = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'We need permission to access your photos');
        return;
      }

      // Show action sheet to choose camera or gallery
      Alert.alert(
        'Upload Photo',
        'Choose an option',
        [
          {
            text: 'Take Photo',
            onPress: async () => {
              const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
              if (cameraPermission.status === 'granted') {
                const result = await ImagePicker.launchCameraAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  allowsEditing: true,
                  aspect: [1, 1],
                  quality: 0.8,
                });
                if (!result.canceled) {
                  handleImageUpload(result.assets[0].uri);
                }
              } else {
                Alert.alert('Permission Required', 'We need permission to access your camera');
              }
            },
          },
          {
            text: 'Choose from Library',
            onPress: async () => {
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
              });
              if (!result.canceled) {
                handleImageUpload(result.assets[0].uri);
              }
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ],
        { cancelable: true }
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
      console.error('Image picker error:', error);
    }
  };

  const handleImageUpload = async (uri) => {
    try {
      // TODO: Upload to server
      // For now, just update local state
      dispatch(updateUser({ profilePhoto: uri }));
      Alert.alert('Success', 'Profile photo updated!');
    } catch (error) {
      Alert.alert('Error', 'Failed to upload photo');
      console.error('Upload error:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            dispatch(logout());
            router.replace('/(auth)/sign-in');
          },
        },
      ]
    );
  };

  // Show settings screen if enabled
  if (showSettings) {
    return <SettingsScreen onBack={() => setShowSettings(false)} />;
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View
          className="rounded-b-3xl pb-6"
          style={{
            background: 'linear-gradient(to bottom right, #3B82F6, #F59E0B)',
            backgroundColor: '#3B82F6',
          }}
        >
          <View className="px-6 pt-6 pb-8">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-2xl font-bold text-white">Profile</Text>
              <TouchableOpacity
                onPress={handleOpenSettings}
                className="w-10 h-10 rounded-xl items-center justify-center"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              >
                <Settings size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Profile Info */}
            <View className="flex-row items-start gap-4 mb-6">
              <TouchableOpacity
                onPress={handleImagePicker}
                className="w-20 h-20 rounded-2xl items-center justify-center relative"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 5,
                }}
              >
                {user?.profilePhoto ? (
                  <Image
                    source={{ uri: user.profilePhoto }}
                    style={{ width: '100%', height: '100%', borderRadius: 16 }}
                    resizeMode="cover"
                  />
                ) : (
                  <Text className="text-white text-2xl font-bold">
                    {user ? user.fullName?.charAt(0).toUpperCase() || 'U' : userProfile.avatar}
                  </Text>
                )}
                {/* Camera Icon Overlay */}
                <View 
                  className="absolute bottom-0 right-0 w-7 h-7 rounded-full items-center justify-center"
                  style={{ backgroundColor: '#3B82F6' }}
                >
                  <Edit size={14} color="#fff" />
                </View>
              </TouchableOpacity>
              <View className="flex-1">
                <Text className="text-xl font-bold text-white mb-1">
                  {user ? user.fullName : userProfile.name}
                </Text>
                <Text className="text-sm mb-2" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  {user ? user.email : userProfile.username}
                </Text>
                <View className="flex-row items-center gap-2">
                  <MapPin size={14} color="rgba(255,255,255,0.8)" />
                  <Text className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                    {user ? 'Pakistan' : userProfile.location}
                  </Text>
                </View>
              </View>
            </View>

            {/* Level Badge */}
            <View
              className="rounded-2xl p-4"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-2">
                  <Award size={20} color="#fff" />
                  <Text className="text-white font-semibold">Level {userProfile.level}</Text>
                </View>
                <Text className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  {userProfile.points} / {userProfile.nextLevelPoints} pts
                </Text>
              </View>
              <Progress
                value={progressPercentage}
                className="h-2"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              />
              <Text className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {userProfile.nextLevelPoints - userProfile.points} points to level {userProfile.level + 1}
              </Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <View className="border-b border-gray-200 bg-white">
            <TabsList className="px-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="reviews">My Reviews</TabsTrigger>
              <TabsTrigger value="saved">Saved</TabsTrigger>
              <TabsTrigger value="rewards">Rewards</TabsTrigger>
            </TabsList>
          </View>

          <View className="p-4">
            <TabsContent value="overview">
              <OverviewTab profile={userProfile} />
            </TabsContent>

            <TabsContent value="notifications">
              <NotificationsTab notifications={notificationsData} />
            </TabsContent>

            <TabsContent value="reviews">
              <MyReviewsTab />
            </TabsContent>

            <TabsContent value="saved">
              <SavedTripsTab trips={savedTripsData} />
            </TabsContent>

            <TabsContent value="rewards">
              <RewardsTab rewards={rewardsData} />
            </TabsContent>
          </View>
        </Tabs>

        {/* Logout Button */}
        <View className="p-4">
          <WanderButton variant="outline" onPress={handleLogout}>
            <Text className="text-red-500 font-semibold">Logout</Text>
          </WanderButton>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

function OverviewTab({ profile }) {
  return (
    <View style={{ gap: 16 }}>
      {/* Stats Grid */}
      <View className="flex-row flex-wrap gap-3">
        <View className="w-[48%]">
          <WanderCard>
            <View className="items-center">
              <Star size={24} color="#F59E0B" style={{ marginBottom: 8 }} />
              <Text className="text-2xl font-bold">{profile.stats.reviews}</Text>
              <Text className="text-sm text-gray-600">Reviews</Text>
            </View>
          </WanderCard>
        </View>
        <View className="w-[48%]">
          <WanderCard>
            <View className="items-center">
              <MapPin size={24} color="#3B82F6" style={{ marginBottom: 8 }} />
              <Text className="text-2xl font-bold">{profile.stats.trips}</Text>
              <Text className="text-sm text-gray-600">Trips</Text>
            </View>
          </WanderCard>
        </View>
        <View className="w-[48%]">
          <WanderCard>
            <View className="items-center">
              <Bookmark size={24} color="#3B82F6" style={{ marginBottom: 8 }} />
              <Text className="text-2xl font-bold">{profile.stats.saved}</Text>
              <Text className="text-sm text-gray-600">Saved Places</Text>
            </View>
          </WanderCard>
        </View>
        <View className="w-[48%]">
          <WanderCard>
            <View className="items-center">
              <ThumbsUp size={24} color="#F59E0B" style={{ marginBottom: 8 }} />
              <Text className="text-2xl font-bold">{profile.stats.helpful}</Text>
              <Text className="text-sm text-gray-600">Helpful Votes</Text>
            </View>
          </WanderCard>
        </View>
      </View>

      {/* Contributor Stats */}
      <WanderCard>
        <View className="flex-row items-center gap-2 mb-4">
          <TrendingUp size={20} color="#3B82F6" />
          <Text className="text-lg font-semibold">Contributor Stats</Text>
        </View>
        <View style={{ gap: 12 }}>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-gray-600">Total Impact Score</Text>
            <Text className="text-blue-500 font-semibold">2,450 pts</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-gray-600">Reviews This Month</Text>
            <Text className="font-semibold">8</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-gray-600">Avg. Rating Given</Text>
            <Text className="font-semibold">4.6 ⭐</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-gray-600">Member Since</Text>
            <Text className="font-semibold">{profile.memberSince}</Text>
          </View>
        </View>
      </WanderCard>

      {/* Badges */}
      <WanderCard>
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-lg font-semibold">Badges</Text>
          <WanderChip variant="primary">
            <Text className="text-xs text-blue-600">
              {profile.badges.filter(b => b.unlocked).length}/{profile.badges.length}
            </Text>
          </WanderChip>
        </View>
        <View className="flex-row flex-wrap gap-3">
          {profile.badges.map((badge) => (
            <View
              key={badge.id}
              className="w-[30%] items-center p-3 rounded-xl"
              style={{
                backgroundColor: badge.unlocked ? 'rgba(59, 130, 246, 0.1)' : '#F3F4F6',
                opacity: badge.unlocked ? 1 : 0.5,
              }}
            >
              <Text className="text-3xl mb-2">{badge.icon}</Text>
              <Text className="text-xs text-center" numberOfLines={1}>{badge.name}</Text>
              {badge.progress && !badge.unlocked && (
                <View className="w-full mt-2">
                  <Progress value={badge.progress} className="h-1" />
                  <Text className="text-xs text-gray-600 text-center mt-1">{badge.progress}%</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </WanderCard>
    </View>
  );
}

function NotificationsTab({ notifications }) {
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

function MyReviewsTab() {
  const myReviews = [
    {
      id: '1',
      place: 'La Bella Cucina',
      rating: 5,
      text: 'Amazing pasta! The atmosphere was perfect for a date night.',
      helpful: 89,
      timestamp: '1 week ago',
      image: 'https://images.unsplash.com/photo-1667388968964-4aa652df0a9b?w=400',
    },
    {
      id: '2',
      place: 'Modern Art Museum',
      rating: 4.5,
      text: 'Great collection. Spent hours here exploring.',
      helpful: 45,
      timestamp: '2 weeks ago',
      image: 'https://images.unsplash.com/photo-1631168524494-3711bece9c09?w=400',
    },
  ];

  const handleEdit = (id) => {
    Alert.alert('Edit Review', 'Opening edit mode...');
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Review', 'Are you sure you want to delete this review?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => Alert.alert('Success', 'Review deleted') },
    ]);
  };

  return (
    <View style={{ gap: 12 }}>
      {myReviews.map((review) => (
        <WanderCard key={review.id} padding="none">
          <View className="flex-row gap-3 p-3">
            <View className="w-16 h-16 rounded-xl overflow-hidden">
              <ImageWithFallback
                source={{ uri: review.image }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            </View>
            <View className="flex-1">
              <Text className="font-semibold mb-1" numberOfLines={1}>{review.place}</Text>
              <View className="flex-row items-center gap-1 mb-2">
                {[...Array(5)].map((_, idx) => (
                  <Star
                    key={idx}
                    size={12}
                    color={idx < review.rating ? '#F59E0B' : '#D1D5DB'}
                    fill={idx < review.rating ? '#F59E0B' : 'transparent'}
                  />
                ))}
              </View>
              <Text className="text-sm text-gray-600 mb-2" numberOfLines={2}>{review.text}</Text>
              <View className="flex-row items-center gap-4">
                <View className="flex-row items-center gap-1">
                  <ThumbsUp size={12} color="#666" />
                  <Text className="text-sm text-gray-600">{review.helpful} helpful</Text>
                </View>
                <Text className="text-sm text-gray-600">{review.timestamp}</Text>
              </View>
            </View>
          </View>
          <View className="flex-row gap-2 p-3 border-t border-gray-200">
            <WanderButton variant="outline" onPress={() => handleEdit(review.id)} style={{ flex: 1 }}>
              <View className="flex-row items-center gap-2">
                <Edit size={14} color="#3B82F6" />
                <Text className="text-blue-500 font-medium">Edit</Text>
              </View>
            </WanderButton>
            <WanderButton variant="outline" onPress={() => handleDelete(review.id)} style={{ flex: 1 }}>
              <View className="flex-row items-center gap-2">
                <Trash2 size={14} color="#EF4444" />
                <Text className="text-red-500 font-medium">Delete</Text>
              </View>
            </WanderButton>
          </View>
        </WanderCard>
      ))}
    </View>
  );
}

function SavedTripsTab({ trips }) {
  return (
    <View style={{ gap: 12 }}>
      {trips.map((trip) => (
        <TouchableOpacity key={trip.id}>
          <WanderCard padding="none">
            <View className="flex-row gap-3 p-3">
              <View className="w-20 h-20 rounded-xl overflow-hidden">
                <ImageWithFallback
                  source={{ uri: trip.image }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-base mb-2">{trip.destination}</Text>
                <Text className="text-sm text-gray-600 mb-2">${trip.budget} budget</Text>
                <Text className="text-xs text-gray-500">Saved {trip.savedAt}</Text>
              </View>
              <ChevronRight size={20} color="#9CA3AF" style={{ alignSelf: 'center' }} />
            </View>
          </WanderCard>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function RewardsTab({ rewards }) {
  const activeRewards = rewards.filter(r => !r.isRedeemed);
  const redeemedRewards = rewards.filter(r => r.isRedeemed);

  const handleRedeem = async (code) => {
    try {
      await Share.share({
        message: `Your coupon code: ${code}`,
      });
    } catch (error) {
      Alert.alert('Success', `Coupon code: ${code}`);
    }
  };

  return (
    <View style={{ gap: 24 }}>
      {/* Progress Tracker */}
      <View
        className="rounded-2xl p-4"
        style={{
          background: 'linear-gradient(to right, rgba(251, 146, 60, 0.1), rgba(59, 130, 246, 0.1))',
          backgroundColor: '#FEF3C7',
        }}
      >
        <View className="flex-row items-center gap-3">
          <View
            className="w-12 h-12 rounded-full items-center justify-center"
            style={{ backgroundColor: 'rgba(251, 146, 60, 0.2)' }}
          >
            <Award size={24} color="#F59E0B" />
          </View>
          <View className="flex-1">
            <Text className="font-semibold mb-1">Next Reward</Text>
            <Text className="text-sm text-gray-600 mb-2">
              Write 2 more reviews to unlock 10% hotel coupon
            </Text>
            <Progress value={60} className="h-2" />
          </View>
        </View>
      </View>

      {/* Active Rewards */}
      <View>
        <Text className="text-lg font-bold mb-3">Available Coupons</Text>
        <View style={{ gap: 12 }}>
          {activeRewards.map((reward) => (
            <WanderCard
              key={reward.id}
              style={{
                borderLeftWidth: 4,
                borderLeftColor: '#F59E0B',
              }}
            >
              <View className="flex-row items-start justify-between mb-3">
                <View className="flex-1">
                  <WanderChip variant="accent" style={{ alignSelf: 'flex-start', marginBottom: 8 }}>
                    <Text className="text-xs text-orange-600">{reward.discount}</Text>
                  </WanderChip>
                  <Text className="font-semibold mb-1">{reward.title}</Text>
                  <View className="flex-row items-center gap-2">
                    <Calendar size={14} color="#666" />
                    <Text className="text-sm text-gray-600">Expires {reward.expiresAt}</Text>
                  </View>
                </View>
              </View>
              <WanderButton onPress={() => handleRedeem(reward.code)}>
                <View className="flex-row items-center gap-2">
                  <Gift size={16} color="#fff" />
                  <Text className="text-white font-semibold">Copy Code: {reward.code}</Text>
                </View>
              </WanderButton>
            </WanderCard>
          ))}
        </View>
      </View>

      {/* Redeemed History */}
      {redeemedRewards.length > 0 && (
        <View>
          <Text className="text-lg font-bold mb-3">Redeemed</Text>
          <View style={{ gap: 8 }}>
            {redeemedRewards.map((reward) => (
              <WanderCard key={reward.id} style={{ opacity: 0.6 }}>
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="font-semibold mb-1">{reward.title}</Text>
                    <View className="flex-row items-center gap-2">
                      <CheckCircle size={14} color="#10B981" />
                      <Text className="text-sm text-gray-600">Redeemed</Text>
                    </View>
                  </View>
                  <WanderChip variant="secondary">
                    <Text className="text-xs text-gray-700">{reward.discount}</Text>
                  </WanderChip>
                </View>
              </WanderCard>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

export default Profile;