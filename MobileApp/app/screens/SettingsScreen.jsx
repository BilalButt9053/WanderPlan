import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {
  ArrowLeft,
  Globe,
  DollarSign,
  Lock,
  Bell,
  Eye,
  MapPin,
  Moon,
  ChevronRight,
  LogOut,
  Trash2,
  HelpCircle,
  FileText,
  Shield,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WanderButton } from '../components/wander-button';
import { WanderCard } from '../components/wander-card';
import { Switch } from '../components/ui/switch';
import { useTheme } from '../hooks/useTheme';

export function SettingsScreen({ onBack }) {
  const { colors } = useTheme();
  const [settings, setSettings] = useState({
    language: 'English',
    currency: 'USD',
    darkMode: false,
    pushNotifications: true,
    emailNotifications: false,
    reviewNotifications: true,
    tripReminders: true,
    marketingEmails: false,
    profileVisibility: 'public',
    showLocation: true,
    showTrips: true,
    showReviews: true,
  });

  const updateSetting = (key, value) => {
    setSettings({ ...settings, [key]: value });
    Alert.alert('Success', 'Setting updated');
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
          {/* General Settings */}
          <View>
            <Text style={{ color: colors.text }} className="text-lg font-semibold mb-3 px-2">General</Text>
            <WanderCard padding="none">
              <TouchableOpacity
                onPress={() => Alert.alert('Language', 'Language selection coming soon')}
                className="flex-row items-center justify-between p-4"
              >
                <View className="flex-row items-center gap-3 flex-1">
                  <Globe size={20} color="#3B82F6" />
                  <View className="flex-1">
                    <Text style={{ color: colors.text }} className="text-sm font-medium">Language</Text>
                    <Text style={{ color: colors.textSecondary }} className="text-sm">{settings.language}</Text>
                  </View>
                </View>
                <ChevronRight size={20} color="#9CA3AF" />
              </TouchableOpacity>

              <View className="h-px bg-gray-200" />

              <TouchableOpacity
                onPress={() => Alert.alert('Currency', 'Currency selection coming soon')}
                className="flex-row items-center justify-between p-4"
              >
                <View className="flex-row items-center gap-3 flex-1">
                  <DollarSign size={20} color="#3B82F6" />
                  <View className="flex-1">
                    <Text style={{ color: colors.text }} className="text-sm font-medium">Currency</Text>
                    <Text style={{ color: colors.textSecondary }} className="text-sm">{settings.currency}</Text>
                  </View>
                </View>
                <ChevronRight size={20} color="#9CA3AF" />
              </TouchableOpacity>

              <View className="h-px bg-gray-200" />

              <View className="flex-row items-center justify-between p-4">
                <View className="flex-row items-center gap-3 flex-1">
                  <Moon size={20} color="#3B82F6" />
                  <View className="flex-1">
                    <Text style={{ color: colors.text }} className="text-sm font-medium">Dark Mode</Text>
                    <Text style={{ color: colors.textSecondary }} className="text-sm">Coming soon</Text>
                  </View>
                </View>
                <Switch
                  checked={settings.darkMode}
                  onCheckedChange={(checked) => updateSetting('darkMode', checked)}
                  disabled
                />
              </View>
            </WanderCard>
          </View>

          {/* Notifications */}
          <View>
            <Text style={{ color: colors.text }} className="text-lg font-semibold mb-3 px-2">Notifications</Text>
            <WanderCard padding="none">
              <View className="flex-row items-center justify-between p-4">
                <View className="flex-row items-center gap-3 flex-1">
                  <Bell size={20} color="#3B82F6" />
                  <View className="flex-1">
                    <Text style={{ color: colors.text }} className="text-sm font-medium">Push Notifications</Text>
                    <Text style={{ color: colors.textSecondary }} className="text-sm">App notifications</Text>
                  </View>
                </View>
                <Switch
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => updateSetting('pushNotifications', checked)}
                />
              </View>

              <View className="h-px bg-gray-200" />

              <View className="flex-row items-center justify-between p-4">
                <View className="flex-row items-center gap-3 flex-1">
                  <View style={{ width: 20 }} />
                  <View className="flex-1">
                    <Text className="text-sm font-medium">Email Notifications</Text>
                    <Text className="text-sm text-gray-600">Updates via email</Text>
                  </View>
                </View>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                />
              </View>

              <View className="h-px bg-gray-200" />

              <View className="flex-row items-center justify-between p-4">
                <View className="flex-row items-center gap-3 flex-1">
                  <View style={{ width: 20 }} />
                  <View className="flex-1">
                    <Text className="text-sm font-medium">Review Notifications</Text>
                    <Text className="text-sm text-gray-600">Likes and replies</Text>
                  </View>
                </View>
                <Switch
                  checked={settings.reviewNotifications}
                  onCheckedChange={(checked) => updateSetting('reviewNotifications', checked)}
                />
              </View>

              <View className="h-px bg-gray-200" />

              <View className="flex-row items-center justify-between p-4">
                <View className="flex-row items-center gap-3 flex-1">
                  <View style={{ width: 20 }} />
                  <View className="flex-1">
                    <Text className="text-sm font-medium">Trip Reminders</Text>
                    <Text className="text-sm text-gray-600">Upcoming trips</Text>
                  </View>
                </View>
                <Switch
                  checked={settings.tripReminders}
                  onCheckedChange={(checked) => updateSetting('tripReminders', checked)}
                />
              </View>

              <View className="h-px bg-gray-200" />

              <View className="flex-row items-center justify-between p-4">
                <View className="flex-row items-center gap-3 flex-1">
                  <View style={{ width: 20 }} />
                  <View className="flex-1">
                    <Text className="text-sm font-medium">Marketing Emails</Text>
                    <Text className="text-sm text-gray-600">Offers and deals</Text>
                  </View>
                </View>
                <Switch
                  checked={settings.marketingEmails}
                  onCheckedChange={(checked) => updateSetting('marketingEmails', checked)}
                />
              </View>
            </WanderCard>
          </View>

          {/* Privacy */}
          <View>
            <Text className="text-lg font-semibold mb-3 px-2">Privacy</Text>
            <WanderCard padding="none">
              <TouchableOpacity
                onPress={() => Alert.alert('Profile Visibility', 'Profile visibility settings coming soon')}
                className="flex-row items-center justify-between p-4"
              >
                <View className="flex-row items-center gap-3 flex-1">
                  <Eye size={20} color="#3B82F6" />
                  <View className="flex-1">
                    <Text className="text-sm font-medium">Profile Visibility</Text>
                    <Text className="text-sm text-gray-600 capitalize">{settings.profileVisibility}</Text>
                  </View>
                </View>
                <ChevronRight size={20} color="#9CA3AF" />
              </TouchableOpacity>

              <View className="h-px bg-gray-200" />

              <View className="flex-row items-center justify-between p-4">
                <View className="flex-row items-center gap-3 flex-1">
                  <MapPin size={20} color="#3B82F6" />
                  <View className="flex-1">
                    <Text className="text-sm font-medium">Show Location</Text>
                    <Text className="text-sm text-gray-600">Visible to others</Text>
                  </View>
                </View>
                <Switch
                  checked={settings.showLocation}
                  onCheckedChange={(checked) => updateSetting('showLocation', checked)}
                />
              </View>

              <View className="h-px bg-gray-200" />

              <View className="flex-row items-center justify-between p-4">
                <View className="flex-row items-center gap-3 flex-1">
                  <View style={{ width: 20 }} />
                  <View className="flex-1">
                    <Text className="text-sm font-medium">Show Trips</Text>
                    <Text className="text-sm text-gray-600">Display on profile</Text>
                  </View>
                </View>
                <Switch
                  checked={settings.showTrips}
                  onCheckedChange={(checked) => updateSetting('showTrips', checked)}
                />
              </View>

              <View className="h-px bg-gray-200" />

              <View className="flex-row items-center justify-between p-4">
                <View className="flex-row items-center gap-3 flex-1">
                  <View style={{ width: 20 }} />
                  <View className="flex-1">
                    <Text className="text-sm font-medium">Show Reviews</Text>
                    <Text className="text-sm text-gray-600">Public reviews</Text>
                  </View>
                </View>
                <Switch
                  checked={settings.showReviews}
                  onCheckedChange={(checked) => updateSetting('showReviews', checked)}
                />
              </View>
            </WanderCard>
          </View>

          {/* Security */}
          <View>
            <Text className="text-lg font-semibold mb-3 px-2">Security</Text>
            <WanderCard padding="none">
              <TouchableOpacity
                onPress={() => Alert.alert('Change Password', 'Password change coming soon')}
                className="flex-row items-center justify-between p-4"
              >
                <View className="flex-row items-center gap-3 flex-1">
                  <Lock size={20} color="#3B82F6" />
                  <Text className="text-sm font-medium">Change Password</Text>
                </View>
                <ChevronRight size={20} color="#9CA3AF" />
              </TouchableOpacity>

              <View className="h-px bg-gray-200" />

              <TouchableOpacity
                onPress={() => Alert.alert('2FA', 'Two-factor authentication coming soon')}
                className="flex-row items-center justify-between p-4"
              >
                <View className="flex-row items-center gap-3 flex-1">
                  <Shield size={20} color="#3B82F6" />
                  <Text className="text-sm font-medium">Two-Factor Authentication</Text>
                </View>
                <ChevronRight size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </WanderCard>
          </View>

          {/* Support */}
          <View>
            <Text className="text-lg font-semibold mb-3 px-2">Support</Text>
            <WanderCard padding="none">
              <TouchableOpacity
                onPress={() => Alert.alert('Help Center', 'Help center coming soon')}
                className="flex-row items-center justify-between p-4"
              >
                <View className="flex-row items-center gap-3 flex-1">
                  <HelpCircle size={20} color="#3B82F6" />
                  <Text className="text-sm font-medium">Help Center</Text>
                </View>
                <ChevronRight size={20} color="#9CA3AF" />
              </TouchableOpacity>

              <View className="h-px bg-gray-200" />

              <TouchableOpacity
                onPress={() => Alert.alert('Terms', 'Terms of service coming soon')}
                className="flex-row items-center justify-between p-4"
              >
                <View className="flex-row items-center gap-3 flex-1">
                  <FileText size={20} color="#3B82F6" />
                  <Text className="text-sm font-medium">Terms of Service</Text>
                </View>
                <ChevronRight size={20} color="#9CA3AF" />
              </TouchableOpacity>

              <View className="h-px bg-gray-200" />

              <TouchableOpacity
                onPress={() => Alert.alert('Privacy', 'Privacy policy coming soon')}
                className="flex-row items-center justify-between p-4"
              >
                <View className="flex-row items-center gap-3 flex-1">
                  <Shield size={20} color="#3B82F6" />
                  <Text className="text-sm font-medium">Privacy Policy</Text>
                </View>
                <ChevronRight size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </WanderCard>
          </View>

          {/* Account Actions */}
          <View>
            <Text className="text-lg font-semibold mb-3 px-2">Account</Text>
            <View style={{ gap: 12 }}>
              <WanderButton
                variant="outline"
                fullWidth
                onPress={() => Alert.alert('Log Out', 'Are you sure you want to log out?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Log Out', onPress: () => Alert.alert('Logged out') }
                ])}
              >
                <View className="flex-row items-center gap-2">
                  <LogOut size={20} color="#3B82F6" />
                  <Text className="text-blue-600 font-semibold">Log Out</Text>
                </View>
              </WanderButton>

              <WanderButton
                variant="outline"
                fullWidth
                onPress={() => Alert.alert('Delete Account', 'This action cannot be undone. Are you sure?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: () => Alert.alert('Account deletion requested') }
                ])}
              >
                <View className="flex-row items-center gap-2">
                  <Trash2 size={20} color="#EF4444" />
                  <Text className="text-red-500 font-semibold">Delete Account</Text>
                </View>
              </WanderButton>
            </View>
          </View>

          {/* Version */}
          <View className="items-center py-4">
            <Text className="text-sm text-gray-500">WanderPlan v1.0.0</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default SettingsScreen;
