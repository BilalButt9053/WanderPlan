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
import { logout, updateUser, selectCurrentUser } from '../../redux/slices/authSlice';
import { useRouter } from 'expo-router';
import { useTheme } from '../hooks/useTheme';
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
import OverviewTab from '../components/profile/OverviewTab';
import NotificationsTab from '../components/profile/NotificationsTab';
import SavedTripsTab from '../components/profile/SavedTripsTab';
import RewardsTab from '../components/profile/RewardsTab';
import MyReviewsTab from '../components/profile/MyReviewsTab';
import SavedReviewsTab from '../components/profile/SavedReviewsTab';

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
  const { isDarkMode, colors } = useTheme();
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
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} style={{ backgroundColor: colors.background }}>
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
              <SavedReviewsTab />
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

export default Profile;