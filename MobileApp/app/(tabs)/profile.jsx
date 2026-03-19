import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Share,
  Image,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useDispatch, useSelector } from 'react-redux';
import { logout, updateUser, selectCurrentUser } from '../../redux/slices/authSlice';
import { useUpdateProfileMutation } from '../../redux/api/authApi';
import {
  useGetProfileStatsQuery,
  useGetRewardsQuery,
  useGetNotificationsQuery,
} from '../../redux/api/userProfileApi';
import { useRouter } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
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
  X,
  Save,
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

// Fallback data in case API fails
const fallbackProfileData = {
  name: 'User',
  username: '@user',
  avatar: 'U',
  level: 1,
  points: 0,
  nextLevelPoints: 100,
  location: 'Pakistan',
  memberSince: 'New member',
  stats: {
    reviews: 0,
    trips: 0,
    saved: 0,
    helpful: 0,
  },
  badges: [],
};

const Profile = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector((state) => state.auth.user);
  const { isDarkMode, colors } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch profile data from API
  const { data: profileData, isLoading: profileLoading, refetch: refetchProfile } = useGetProfileStatsQuery();
  const { data: rewardsData, isLoading: rewardsLoading } = useGetRewardsQuery('all');
  const { data: notificationsData, isLoading: notificationsLoading } = useGetNotificationsQuery({ page: 1, limit: 20 });

  const userProfile = useMemo(() => {
    if (profileData?.success) {
      const { profile, gamification, stats } = profileData;
      return {
        name: profile.name || user?.fullName || fallbackProfileData.name,
        username: profile.username || user?.email || fallbackProfileData.username,
        avatar: profile.avatar || fallbackProfileData.avatar,
        level: gamification.level || 1,
        points: gamification.points || 0,
        nextLevelPoints: gamification.nextLevelPoints || 100,
        location: 'Pakistan',
        memberSince: profile.memberSince || 'New member',
        stats: {
          reviews: stats.reviews || 0,
          trips: stats.trips || 0,
          saved: stats.saved || 0,
          helpful: stats.helpful || 0,
        },
        badges: gamification.badges || [],
        fullStats: stats, // Include full stats for detailed views
      };
    }
    // Fallback to local user data if API fails
    const points = user?.contribution?.points ?? fallbackProfileData.points ?? 0;
    const level = user?.contribution?.level ?? fallbackProfileData.level ?? 1;
    const nextLevelPoints = Math.max((level + 1) * 500, fallbackProfileData.nextLevelPoints || 0);

    return {
      ...fallbackProfileData,
      name: user?.fullName || fallbackProfileData.name,
      username: user?.email || fallbackProfileData.username,
      level,
      points,
      nextLevelPoints,
    };
  }, [profileData, user]);

  // Transform notifications for the tab
  const notifications = useMemo(() => {
    if (notificationsData?.notifications) {
      return notificationsData.notifications.map(n => ({
        id: n._id,
        type: n.type,
        text: n.message,
        timestamp: new Date(n.createdAt).toLocaleDateString('en-US', {
          month: 'short', day: 'numeric'
        }),
        read: n.read,
      }));
    }
    return [];
  }, [notificationsData]);

  // Transform rewards for the tab
  const rewards = useMemo(() => {
    if (rewardsData?.rewards) {
      return rewardsData.rewards.map(r => ({
        id: r._id,
        title: r.title,
        discount: `${r.discountValue}%`,
        type: r.type,
        expiresAt: r.validUntil,
        isRedeemed: r.isUsed,
        code: r.code,
        isActive: r.isActive,
      }));
    }
    return [];
  }, [rewardsData]);

  const nextRewardInfo = rewardsData?.nextReward || null;

  const [showSettings, setShowSettings] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');

  // RTK Query mutation for profile update
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  const progressPercentage = (userProfile.points / Math.max(userProfile.nextLevelPoints, 1)) * 100;

  const handleOpenSettings = () => {
    setShowSettings(true);
  };

  const handleOpenEditModal = () => {
    setEditName(user?.fullName || '');
    setShowEditModal(true);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    try {
      const result = await updateProfile({ fullName: editName.trim() }).unwrap();
      dispatch(updateUser(result.user));
      setShowEditModal(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('Error', error?.data?.message || 'Failed to update profile');
    }
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
      // Update profile via API
      const result = await updateProfile({ profilePhoto: uri }).unwrap();
      dispatch(updateUser(result.user));
      Alert.alert('Success', 'Profile photo updated!');
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', error?.data?.message || 'Failed to upload photo');
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
                <View className="flex-row items-center gap-2 mb-1">
                  <Text className="text-xl font-bold text-white">
                    {user ? user.fullName : userProfile.name}
                  </Text>
                  <TouchableOpacity
                    onPress={handleOpenEditModal}
                    className="w-6 h-6 rounded-full items-center justify-center"
                    style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                  >
                    <Edit size={12} color="#fff" />
                  </TouchableOpacity>
                </View>
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
              <OverviewTab profile={userProfile} isLoading={profileLoading} />
            </TabsContent>

            <TabsContent value="notifications">
              <NotificationsTab
                notifications={notifications}
                unreadCount={notificationsData?.unreadCount || 0}
                isLoading={notificationsLoading}
              />
            </TabsContent>

            <TabsContent value="reviews">
              <MyReviewsTab />
            </TabsContent>

            <TabsContent value="saved">
              <SavedReviewsTab />
            </TabsContent>

            <TabsContent value="rewards">
              <RewardsTab
                rewards={rewards}
                nextRewardInfo={nextRewardInfo}
                isLoading={rewardsLoading}
              />
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

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}>
          <View style={{
            backgroundColor: colors.card,
            borderRadius: 20,
            padding: 24,
            width: '100%',
            maxWidth: 400,
          }}>
            {/* Modal Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 20, fontWeight: '600', color: colors.text }}>Edit Profile</Text>
              <TouchableOpacity
                onPress={() => setShowEditModal(false)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: colors.input,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={18} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Name Input */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 8 }}>Full Name</Text>
              <TextInput
                value={editName}
                onChangeText={setEditName}
                placeholder="Enter your name"
                placeholderTextColor={colors.textSecondary}
                style={{
                  backgroundColor: colors.input,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontSize: 16,
                  color: colors.text,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              />
            </View>

            {/* Save Button */}
            <TouchableOpacity
              onPress={handleSaveProfile}
              disabled={isUpdating}
              style={{
                backgroundColor: '#3B82F6',
                borderRadius: 12,
                paddingVertical: 14,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                opacity: isUpdating ? 0.7 : 1,
              }}
            >
              {isUpdating ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Save size={18} color="#fff" />
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Save Changes</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Profile;