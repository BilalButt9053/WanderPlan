
import React, { useRef } from 'react';
import { 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  TextInput,
  Image,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { 
  Search, 
  MapPin, 
  Star, 
  TrendingUp, 
  ChevronRight,
  Sparkles,
  Award,
  Navigation
} from 'lucide-react-native';
import ImageWithFallback from '../components/ImageWithFallback';
import { SafeAreaView } from 'react-native-safe-area-context';
import WanderCard from '../components/wander-card';
import WanderChip from '../components/wander-chip';
import { WanderButton } from '../components/wander-button';
import Progress from '../components/ui/progress';

const { width } = Dimensions.get('window');

const experiences = [
  {
    id: 1,
    title: 'Hunza Valley Beauty',
    location: 'Hunza, Gilgit-Baltistan',
    image: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxodW56YSUyMHZhbGxleSUyMHBha2lzdGFufGVufDF8fHx8MTczMjYxMjAwMHww&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.9,
    reviews: 2834,
  },
  {
    id: 2,
    title: 'Fairy Meadows Trek',
    location: 'Nanga Parbat, KPK',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYWlyeSUyMG1lYWRvd3MlMjBwYWtpc3RhbnxlbnwxfHx8fDE3MzI2MTIwMDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.8,
    reviews: 1567,
  },
  {
    id: 3,
    title: 'Lahore Fort Heritage',
    location: 'Lahore, Punjab',
    image: 'https://images.unsplash.com/photo-1571847027516-1df28ffc1e29?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYWhvcmUlMjBmb3J0JTIwcGFraXN0YW58ZW58MXx8fHwxNzMyNjEyMDAwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.7,
    reviews: 3245,
  },
];

const deals = [
  {
    id: 1,
    title: 'Khan Baba Restaurant',
    discount: '25% OFF',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYWtpc3RhbmklMjBmb29kJTIwYmlyeWFuaXxlbnwxfHx8fDE3MzI2MTIwMDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    type: 'restaurant',
  },
  {
    id: 2,
    title: 'Pearl Continental Hotel',
    discount: '35% OFF',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMGx1eHVyeSUyMHJvb218ZW58MXx8fHwxNzMyNjEyMDAwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    type: 'hotel',
  },
];

const hiddenGems = [
  {
    id: 1,
    name: 'Dilpasand Cafe',
    rating: 4.7,
    distance: '1.2 km',
    category: 'Cafe',
    image: 'https://images.unsplash.com/photo-1559305616-3b2b9c8e6e3c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWZlJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzMyNjEyMDAwfDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 2,
    name: 'Haveli Restaurant',
    rating: 4.8,
    distance: '2.3 km',
    category: 'Restaurant',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwaW50ZXJpb3J8ZW58MXx8fHwxNzMyNjEyMDAwfDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 3,
    name: 'Liberty Market',
    rating: 4.6,
    distance: '3.5 km',
    category: 'Shopping',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXJrZXQlMjBzaG9wcGluZ3xlbnwxfHx8fDE3MzI2MTIwMDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
];

export default function Page() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth?.user || null);
  const reviewProgress = 60;

  

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1">
        {/* Header with Search Bar */}
        <View className="bg-background border-b border-gray-200">
          <View className="flex-row items-center gap-3 p-4">
            {/* Search Bar */}
            <View className="flex-1 flex-row items-center gap-3 bg-gray-100 rounded-2xl px-4 py-3">
              <Search size={20} color="#6B7280" />
              <TextInput
                placeholder="Where to?"
                placeholderTextColor="#9CA3AF"
                className="flex-1 text-gray-900"
              />
              <Navigation size={18} color="#2563EB" />
            </View>
            
            {/* Profile Avatar */}
            <TouchableOpacity 
              onPress={() => router.push('/(tabs)/profile')}
              className="w-12 h-12 rounded-full items-center justify-center overflow-hidden"
              style={{ 
                backgroundColor: user?.profilePhoto ? 'transparent' : '#3B82F6',
                borderWidth: user?.profilePhoto ? 2 : 0,
                borderColor: '#3B82F6'
              }}
            >
              {user?.profilePhoto ? (
                <Image
                  source={{ uri: user.profilePhoto }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              ) : (
                <Text className="text-white font-semibold text-lg">
                  {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
     
      </View>

      {/* Main Content */}
      <View>
        {/* Experiences Section */}
        <View className="py-4 px-4">
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-2xl font-bold text-gray-900 mb-1">Experiences</Text>
              <Text className="text-sm text-gray-500">Discover amazing places</Text>
            </View>
            <TouchableOpacity className="flex-row items-center gap-1">
              <Text className="text-blue-600 text-sm">See all</Text>
              <ChevronRight size={16} color="#2563EB" />
            </TouchableOpacity>
          </View>

          {/* Horizontal Scroll */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            className="pb-4"
            contentContainerStyle={{ gap: 16 }}
          >
            {experiences.map((exp) => (
              <View key={exp.id} style={{ width: width * 0.75 }}>
                <WanderCard padding="none" className="overflow-hidden" hover>
                  <View className="relative h-48">
                    <ImageWithFallback
                      src={exp.image}
                      alt={exp.title}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                    <View className="absolute top-3 right-3">
                      <WanderChip variant="primary" size="sm">
                        ⭐ {exp.rating}
                      </WanderChip>
                    </View>
                  </View>
                  <View className="p-4">
                    <Text className="text-lg font-bold text-gray-900 mb-1">{exp.title}</Text>
                    <View className="flex-row items-center gap-1">
                      <MapPin size={14} color="#6B7280" />
                      <Text className="text-sm text-gray-500">{exp.location}</Text>
                    </View>
                    <Text className="text-xs text-gray-400 mt-2">
                      {exp.reviews.toLocaleString()} reviews
                    </Text>
                  </View>
                </WanderCard>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Deals & Sponsored Ads */}
        <View className="py-4 px-4 bg-blue-50">
          <View className="flex-row items-center gap-2 mb-4">
            <Sparkles size={20} color="#10B981" />
            <Text className="text-xl font-bold text-gray-900">Deals & Offers</Text>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12 }}
          >
            {deals.map((deal) => (
              <View key={deal.id} style={{ width: width * 0.7 }}>
                <WanderCard padding="none" className="overflow-hidden" hover>
                  <View className="flex-row items-center gap-3 p-3">
                    <View className="w-20 h-20 rounded-xl overflow-hidden">
                      <ImageWithFallback
                        src={deal.image}
                        alt={deal.title}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    </View>
                    <View className="flex-1">
                      <WanderChip variant="accent" size="sm" className="mb-2 self-start">
                        {deal.discount}
                      </WanderChip>
                      <Text className="text-base font-bold text-gray-900" numberOfLines={1}>
                        {deal.title}
                      </Text>
                      <Text className="text-xs text-gray-500 capitalize">
                        {deal.type}
                      </Text>
                    </View>
                  </View>
                </WanderCard>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Quick Budget Plan Card */}
        <View className="py-4 px-4">
          <WanderCard 
            padding="lg"
            style={{ backgroundColor: '#3B82F6' }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <View className="flex-row items-center gap-2 mb-2">
                  <TrendingUp size={18} color="#FFFFFF" strokeWidth={2} />
                  <Text className="text-base font-semibold text-white">Quick Budget Plan</Text>
                </View>
                <Text className="text-white text-xs mb-4" style={{ opacity: 0.9 }}>
                  Create a personalized budget for{'\n'}your next trip in seconds
                </Text>
                <TouchableOpacity 
                  className="bg-white rounded-full px-5 py-2.5 self-start"
                  activeOpacity={0.8}
                  onPress={() => router.push('./trips')}
                >
                  <Text style={{ color: '#3B82F6' }} className="text-sm font-semibold">Generate Plan</Text>
                </TouchableOpacity>
              </View>
              <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255, 255, 255, 0.2)' }} className="items-center justify-center ml-3">
                <TrendingUp size={28} color="#FFFFFF" strokeWidth={1.8} />
              </View>
            </View>
          </WanderCard>
        </View>

        {/* Hidden Gems */}
        <View className="py-4 px-4">
          <View className="mb-4">
            <Text className="text-2xl font-bold text-gray-900 mb-1">Hidden Gems</Text>
            <Text className="text-sm text-gray-500">Local spots nearby</Text>
          </View>

          <View className="gap-3">
            {hiddenGems.map((gem) => (
              <WanderCard key={gem.id} padding="none" className="overflow-hidden" hover>
                <View className="flex-row items-center gap-3 p-3">
                  <View className="w-16 h-16 rounded-xl overflow-hidden">
                    <ImageWithFallback
                      src={gem.image}
                      alt={gem.name}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-bold text-gray-900 mb-1">{gem.name}</Text>
                    <View className="flex-row items-center gap-3">
                      <View className="flex-row items-center gap-1">
                        <Star size={12} fill="#10B981" color="#10B981" />
                        <Text className="text-xs text-gray-500">{gem.rating}</Text>
                      </View>
                      <View className="flex-row items-center gap-1">
                        <Navigation size={12} color="#6B7280" />
                        <Text className="text-xs text-gray-500">{gem.distance}</Text>
                      </View>
                    </View>
                    <WanderChip variant="secondary" size="sm" className="mt-2 self-start">
                      {gem.category}
                    </WanderChip>
                  </View>
                  <ChevronRight size={20} color="#9CA3AF" />
                </View>
              </WanderCard>
            ))}
          </View>
        </View>

        {/* Gamification Progress */}
        <View className="py-4 px-4 mb-4">
          <WanderCard className="bg-green-50">
            <View className="flex-row items-center gap-3">
              <View className="w-12 h-12 rounded-full bg-green-100 items-center justify-center">
                <Award size={24} color="#10B981" />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-base font-bold text-gray-900">Earn Rewards</Text>
                  <Text className="text-sm text-green-600">3/5</Text>
                </View>
                <Progress value={reviewProgress} className="h-2 mb-2" />
                <Text className="text-xs text-gray-500">
                  3 reviews to earn a coupon
                </Text>
              </View>
            </View>
          </WanderCard>
        </View>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}