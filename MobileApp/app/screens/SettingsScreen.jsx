import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import {
  ArrowLeft,
  Bell,
  Eye,
  MapPin,
  ChevronRight,
  AlertTriangle,
  FileText,
  Shield,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WanderButton } from '../components/wander-button';
import { WanderCard } from '../components/wander-card';
import { Switch } from '../components/ui/switch';
import { useTheme } from '../../hooks/useTheme';
import { useCreateComplaintMutation, useGetMyComplaintsQuery } from '../../redux/api/complaintsApi';
import { useUpdateProfileMutation } from '../../redux/api/authApi';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { useRouter } from 'expo-router';

export function SettingsScreen({ onBack }) {
  const { colors } = useTheme();
  const router = useRouter();
  const dispatch = useDispatch();

  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: false,
    reviewNotifications: true,
    tripReminders: true,
    showLocation: true,
    showTrips: true,
    showReviews: true,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('bug');
  const [priority, setPriority] = useState('medium');

  const [createComplaint, { isLoading: isSubmitting }] = useCreateComplaintMutation();
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();
  const { data: complaintsData } = useGetMyComplaintsQuery(
    { limit: 3 },
    { refetchOnMountOrArgChange: true }
  );

  const updateSetting = async (key, value) => {
    try {
      setIsSaving(true);

      // Update local state
      setSettings(prev => ({ ...prev, [key]: value }));

      // Determine which category this setting belongs to
      const notificationKeys = ['pushNotifications', 'emailNotifications', 'reviewNotifications', 'tripReminders'];
      const privacyKeys = ['showLocation', 'showTrips', 'showReviews'];

      // Build the correct payload based on setting type
      let profileUpdate = {};

      if (notificationKeys.includes(key)) {
        profileUpdate.notificationPreferences = {
          pushNotifications: key === 'pushNotifications' ? value : settings.pushNotifications,
          emailNotifications: key === 'emailNotifications' ? value : settings.emailNotifications,
          reviewNotifications: key === 'reviewNotifications' ? value : settings.reviewNotifications,
          tripReminders: key === 'tripReminders' ? value : settings.tripReminders,
        };
      } else if (privacyKeys.includes(key)) {
        profileUpdate.privacySettings = {
          showLocation: key === 'showLocation' ? value : settings.showLocation,
          showTrips: key === 'showTrips' ? value : settings.showTrips,
          showReviews: key === 'showReviews' ? value : settings.showReviews,
        };
      }

      await updateProfile(profileUpdate).unwrap();
      Alert.alert('Success', 'Setting updated');
    } catch (error) {
      console.error('Failed to update setting:', error);
      // Revert on error
      setSettings(prev => ({ ...prev, [key]: !value }));
      Alert.alert('Error', 'Failed to update setting. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitComplaint = async () => {
    if (!subject.trim() || !description.trim()) {
      Alert.alert('Missing Info', 'Please add a subject and description.');
      return;
    }

    try {
      await createComplaint({
        subject: subject.trim(),
        description: description.trim(),
        type,
        priority,
      }).unwrap();
      setSubject('');
      setDescription('');
      setType('bug');
      setPriority('medium');
      setShowReportModal(false);
      Alert.alert('Thank you', 'Your report has been submitted to the WanderPlan team.');
    } catch (error) {
      Alert.alert(
        'Error',
        error?.data?.message || 'Failed to submit report. Please try again.'
      );
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

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ backgroundColor: colors.background, borderBottomColor: colors.border }} className="border-b">
        <View className="p-4">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={onBack}
              className="w-10 h-10 rounded-xl items-center justify-center"
              style={{ backgroundColor: colors.input }}
            >
              <ArrowLeft size={20} color={colors.text} />
            </TouchableOpacity>
            <Text style={{ color: colors.text }} className="text-2xl font-bold">Settings</Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4" style={{ gap: 24 }}>
          {/* Notifications Section */}
          <View>
            <Text style={{ color: colors.text }} className="text-lg font-semibold mb-3 px-2">Notifications</Text>
            <WanderCard padding="none">
              <View className="flex-row items-center justify-between p-4">
                <View className="flex-row items-center gap-3 flex-1">
                  <Bell size={20} color="#3B82F6" />
                  <View className="flex-1">
                    <Text style={{ color: colors.text }} className="text-sm font-medium">Push Notifications</Text>
                    <Text style={{ color: colors.textSecondary }} className="text-xs">App alerts and updates</Text>
                  </View>
                </View>
                <Switch
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => updateSetting('pushNotifications', checked)}
                  disabled={isSaving}
                />
              </View>

              <View className="h-px bg-gray-200" />

              <View className="flex-row items-center justify-between p-4">
                <View className="flex-row items-center gap-3 flex-1">
                  <View style={{ width: 20 }} />
                  <View className="flex-1">
                    <Text style={{ color: colors.text }} className="text-sm font-medium">Review Notifications</Text>
                    <Text style={{ color: colors.textSecondary }} className="text-xs">Likes and replies on your reviews</Text>
                  </View>
                </View>
                <Switch
                  checked={settings.reviewNotifications}
                  onCheckedChange={(checked) => updateSetting('reviewNotifications', checked)}
                  disabled={isSaving}
                />
              </View>

              <View className="h-px bg-gray-200" />

              <View className="flex-row items-center justify-between p-4">
                <View className="flex-row items-center gap-3 flex-1">
                  <View style={{ width: 20 }} />
                  <View className="flex-1">
                    <Text style={{ color: colors.text }} className="text-sm font-medium">Trip Reminders</Text>
                    <Text style={{ color: colors.textSecondary }} className="text-xs">Upcoming trips and activities</Text>
                  </View>
                </View>
                <Switch
                  checked={settings.tripReminders}
                  onCheckedChange={(checked) => updateSetting('tripReminders', checked)}
                  disabled={isSaving}
                />
              </View>

              <View className="h-px bg-gray-200" />

              <View className="flex-row items-center justify-between p-4">
                <View className="flex-row items-center gap-3 flex-1">
                  <View style={{ width: 20 }} />
                  <View className="flex-1">
                    <Text style={{ color: colors.text }} className="text-sm font-medium">Email Notifications</Text>
                    <Text style={{ color: colors.textSecondary }} className="text-xs">Important updates via email</Text>
                  </View>
                </View>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                  disabled={isSaving}
                />
              </View>
            </WanderCard>
          </View>

          {/* Privacy Section */}
          <View>
            <Text style={{ color: colors.text }} className="text-lg font-semibold mb-3 px-2">Privacy & Profile</Text>
            <WanderCard padding="none">
              <View className="flex-row items-center justify-between p-4">
                <View className="flex-row items-center gap-3 flex-1">
                  <Eye size={20} color="#3B82F6" />
                  <View className="flex-1">
                    <Text style={{ color: colors.text }} className="text-sm font-medium">Show Location</Text>
                    <Text style={{ color: colors.textSecondary }} className="text-xs">Visible on your profile</Text>
                  </View>
                </View>
                <Switch
                  checked={settings.showLocation}
                  onCheckedChange={(checked) => updateSetting('showLocation', checked)}
                  disabled={isSaving}
                />
              </View>

              <View className="h-px bg-gray-200" />

              <View className="flex-row items-center justify-between p-4">
                <View className="flex-row items-center gap-3 flex-1">
                  <View style={{ width: 20 }} />
                  <View className="flex-1">
                    <Text style={{ color: colors.text }} className="text-sm font-medium">Show Trips</Text>
                    <Text style={{ color: colors.textSecondary }} className="text-xs">Display on your profile</Text>
                  </View>
                </View>
                <Switch
                  checked={settings.showTrips}
                  onCheckedChange={(checked) => updateSetting('showTrips', checked)}
                  disabled={isSaving}
                />
              </View>

              <View className="h-px bg-gray-200" />

              <View className="flex-row items-center justify-between p-4">
                <View className="flex-row items-center gap-3 flex-1">
                  <View style={{ width: 20 }} />
                  <View className="flex-1">
                    <Text style={{ color: colors.text }} className="text-sm font-medium">Show Reviews</Text>
                    <Text style={{ color: colors.textSecondary }} className="text-xs">Publish reviews publicly</Text>
                  </View>
                </View>
                <Switch
                  checked={settings.showReviews}
                  onCheckedChange={(checked) => updateSetting('showReviews', checked)}
                  disabled={isSaving}
                />
              </View>
            </WanderCard>
          </View>

          {/* Support Section */}
          <View>
            <Text style={{ color: colors.text }} className="text-lg font-semibold mb-3 px-2">Support & Legal</Text>
            <WanderCard padding="none">
              <TouchableOpacity
                onPress={() => setShowReportModal(true)}
                className="flex-row items-center justify-between p-4"
              >
                <View className="flex-row items-center gap-3 flex-1">
                  <AlertTriangle size={20} color="#DC2626" />
                  <View className="flex-1">
                    <Text style={{ color: colors.text }} className="text-sm font-medium">Report a Problem</Text>
                    <Text style={{ color: colors.textSecondary }} className="text-xs">Report bugs or issues</Text>
                  </View>
                </View>
                <ChevronRight size={20} color="#9CA3AF" />
              </TouchableOpacity>

              <View className="h-px bg-gray-200" />

              <TouchableOpacity
                onPress={() => Alert.alert('Privacy Policy', 'Privacy policy content not yet available')}
                className="flex-row items-center justify-between p-4"
              >
                <View className="flex-row items-center gap-3 flex-1">
                  <FileText size={20} color="#3B82F6" />
                  <Text style={{ color: colors.text }} className="text-sm font-medium">Privacy Policy</Text>
                </View>
                <ChevronRight size={20} color="#9CA3AF" />
              </TouchableOpacity>

              <View className="h-px bg-gray-200" />

              <TouchableOpacity
                onPress={() => Alert.alert('Terms of Service', 'Terms of service content not yet available')}
                className="flex-row items-center justify-between p-4"
              >
                <View className="flex-row items-center gap-3 flex-1">
                  <Shield size={20} color="#3B82F6" />
                  <Text style={{ color: colors.text }} className="text-sm font-medium">Terms of Service</Text>
                </View>
                <ChevronRight size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </WanderCard>
          </View>

          {/* Account Section */}
          <View>
            <Text style={{ color: colors.text }} className="text-lg font-semibold mb-3 px-2">Account</Text>
            <WanderButton
              variant="outline"
              fullWidth
              onPress={handleLogout}
            >
              <Text className="text-red-500 font-semibold">Logout</Text>
            </WanderButton>
          </View>

          {/* Version & Recent Reports */}
          <View className="items-center py-4 space-y-1">
            {complaintsData?.complaints?.length > 0 && (
              <View className="w-full px-2 mb-4">
                <Text style={{ color: colors.textSecondary }} className="text-xs font-semibold mb-2">
                  Recent Reports
                </Text>
                {complaintsData.complaints.map((c) => (
                  <View
                    key={c._id}
                    className="flex-row items-center justify-between px-3 py-2 rounded-lg"
                    style={{ backgroundColor: colors.input, marginBottom: 8 }}
                  >
                    <View className="flex-1 mr-2">
                      <Text
                        className="text-xs font-medium"
                        numberOfLines={1}
                        style={{ color: colors.text }}
                      >
                        {c.subject}
                      </Text>
                      <Text className="text-[10px]" style={{ color: colors.textSecondary }}>
                        {c.status} • {c.priority}
                      </Text>
                    </View>
                    <Text className="text-[10px]" style={{ color: colors.textSecondary }}>
                      {new Date(c.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                ))}
              </View>
            )}
            <Text style={{ color: colors.textSecondary }} className="text-sm">
              WanderPlan v1.0.0
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Report Problem Modal */}
      <Modal
        visible={showReportModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowReportModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.4)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 20,
              padding: 20,
              width: '100%',
              maxWidth: 420,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text }}>
                Report a Problem
              </Text>
              <TouchableOpacity
                onPress={() => setShowReportModal(false)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: colors.input,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 16, color: colors.text }}>×</Text>
              </TouchableOpacity>
            </View>

            {/* Type Selection */}
            <View style={{ marginBottom: 12 }}>
              <Text
                style={{
                  fontSize: 12,
                  color: colors.textSecondary,
                  marginBottom: 6,
                }}
              >
                Report Type
              </Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {['bug', 'abuse', 'business', 'other'].map((t) => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setType(t)}
                    style={{
                      flex: 1,
                      paddingVertical: 8,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: type === t ? '#DC2626' : colors.border,
                      backgroundColor: type === t ? '#FEE2E2' : colors.input,
                    }}
                  >
                    <Text
                      style={{
                        textAlign: 'center',
                        fontSize: 12,
                        fontWeight: '500',
                        textTransform: 'capitalize',
                        color: type === t ? '#B91C1C' : colors.text,
                      }}
                    >
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Subject */}
            <View style={{ marginBottom: 12 }}>
              <Text
                style={{
                  fontSize: 12,
                  color: colors.textSecondary,
                  marginBottom: 4,
                }}
              >
                Subject
              </Text>
              <TextInput
                value={subject}
                onChangeText={setSubject}
                placeholder="Brief description"
                placeholderTextColor={colors.textSecondary}
                style={{
                  backgroundColor: colors.input,
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  borderWidth: 1,
                  borderColor: colors.border,
                  color: colors.text,
                  fontSize: 14,
                }}
              />
            </View>

            {/* Description */}
            <View style={{ marginBottom: 12 }}>
              <Text
                style={{
                  fontSize: 12,
                  color: colors.textSecondary,
                  marginBottom: 4,
                }}
              >
                Description
              </Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Detailed description..."
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={4}
                style={{
                  backgroundColor: colors.input,
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  borderWidth: 1,
                  borderColor: colors.border,
                  color: colors.text,
                  fontSize: 14,
                  textAlignVertical: 'top',
                  maxHeight: 160,
                }}
              />
            </View>

            {/* Priority */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 12,
                  color: colors.textSecondary,
                  marginBottom: 6,
                }}
              >
                Priority
              </Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {['low', 'medium', 'high', 'critical'].map((p) => (
                  <TouchableOpacity
                    key={p}
                    onPress={() => setPriority(p)}
                    style={{
                      flex: 1,
                      paddingVertical: 6,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: priority === p ? '#2563EB' : colors.border,
                      backgroundColor: priority === p ? '#DBEAFE' : colors.input,
                    }}
                  >
                    <Text
                      style={{
                        textAlign: 'center',
                        fontSize: 11,
                        fontWeight: '500',
                        textTransform: 'capitalize',
                        color: priority === p ? '#1D4ED8' : colors.text,
                      }}
                    >
                      {p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmitComplaint}
              disabled={isSubmitting}
              style={{
                backgroundColor: '#DC2626',
                borderRadius: 12,
                paddingVertical: 12,
                alignItems: 'center',
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text
                  style={{
                    color: '#fff',
                    fontSize: 15,
                    fontWeight: '600',
                  }}
                >
                  Submit Report
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Loading Overlay */}
      {isSaving && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.3)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ActivityIndicator color="#3B82F6" size="large" />
        </View>
      )}
    </SafeAreaView>
  );
}

export default SettingsScreen;
