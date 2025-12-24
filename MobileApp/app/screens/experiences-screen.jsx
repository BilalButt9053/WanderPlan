import React, { useState } from 'react';
import { 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView,
  TextInput,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Search, 
  MapPin, 
  ChevronLeft,
  SlidersHorizontal
} from 'lucide-react-native';
import ImageWithFallback from '../components/ImageWithFallback';
import WanderCard from '../components/wander-card';
import WanderChip from '../components/wander-chip';

const { width } = Dimensions.get('window');

const allExperiences = [
  {
    id: 1,
    title: 'Hunza Valley Beauty',
    location: 'Hunza, Gilgit-Baltistan',
    image: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxodW56YSUyMHZhbGxleSUyMHBha2lzdGFufGVufDF8fHx8MTczMjYxMjAwMHww&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.9,
    reviews: 2834,
    description: 'Experience the breathtaking beauty of Hunza Valley with its snow-capped mountains, crystal clear rivers, and ancient forts.',
    duration: '3-5 days',
    price: 'PKR 45,000',
    category: 'Nature',
  },
  {
    id: 2,
    title: 'Fairy Meadows Trek',
    location: 'Nanga Parbat, KPK',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYWlyeSUyMG1lYWRvd3MlMjBwYWtpc3RhbnxlbnwxfHx8fDE3MzI2MTIwMDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.8,
    reviews: 1567,
    description: 'Trek through the magical Fairy Meadows with stunning views of Nanga Parbat, the ninth highest mountain in the world.',
    duration: '4-6 days',
    price: 'PKR 38,000',
    category: 'Adventure',
  },
  {
    id: 3,
    title: 'Lahore Fort Heritage',
    location: 'Lahore, Punjab',
    image: 'https://images.unsplash.com/photo-1571847027516-1df28ffc1e29?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYWhvcmUlMjBmb3J0JTIwcGFraXN0YW58ZW58MXx8fHwxNzMyNjEyMDAwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.7,
    reviews: 3245,
    description: 'Explore the historic Lahore Fort, a UNESCO World Heritage site showcasing Mughal architecture and rich history.',
    duration: '1 day',
    price: 'PKR 5,000',
    category: 'Heritage',
  },
  {
    id: 4,
    title: 'Skardu Lakes Tour',
    location: 'Skardu, Gilgit-Baltistan',
    image: 'https://images.unsplash.com/photo-1587837073080-448bc6a2329b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxza2FyZHUlMjBsYWtlc3xlbnwxfHx8fDE3MzI2MTIwMDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.9,
    reviews: 2156,
    description: 'Visit the stunning Satpara, Upper Kachura, and Lower Kachura lakes surrounded by majestic mountains.',
    duration: '3-4 days',
    price: 'PKR 42,000',
    category: 'Nature',
  },
  {
    id: 5,
    title: 'Mohenjo-Daro Discovery',
    location: 'Larkana, Sindh',
    image: 'https://images.unsplash.com/photo-1588335214782-6a731ab0d6f9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2hlbmpvJTIwZGFyb3xlbnwxfHx8fDE3MzI2MTIwMDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.6,
    reviews: 1432,
    description: 'Step back in time at Mohenjo-Daro, one of the world\'s earliest urban settlements from the Indus Valley Civilization.',
    duration: '1-2 days',
    price: 'PKR 12,000',
    category: 'Heritage',
  },
  {
    id: 6,
    title: 'Swat Valley Paradise',
    location: 'Swat, KPK',
    image: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzd2F0JTIwdmFsbGV5fGVufDF8fHx8MTczMjYxMjAwMHww&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.8,
    reviews: 1998,
    description: 'Known as the "Switzerland of Pakistan", Swat Valley offers lush green valleys, waterfalls, and Buddhist archaeological sites.',
    duration: '2-4 days',
    price: 'PKR 28,000',
    category: 'Nature',
  },
];

const categories = ['All', 'Nature', 'Adventure', 'Heritage', 'Culture'];

export default function ExperiencesScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredExperiences = allExperiences.filter((exp) => {
    const matchesSearch = exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         exp.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || exp.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleExperiencePress = (experience) => {
    router.push({
      pathname: '/screens/experience-detail-screen',
      params: { experienceId: experience.id }
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="bg-background border-b border-gray-200">
        <View className="flex-row items-center gap-3 p-4">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
          >
            <ChevronLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-900">Experiences</Text>
            <Text className="text-xs text-gray-500">{filteredExperiences.length} experiences found</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View className="px-4 pb-4">
          <View className="flex-row items-center gap-3 bg-gray-100 rounded-2xl px-4 py-3">
            <Search size={20} color="#6B7280" />
            <TextInput
              placeholder="Search experiences..."
              placeholderTextColor="#9CA3AF"
              className="flex-1 text-gray-900"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity>
              <SlidersHorizontal size={20} color="#2563EB" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Category Filter */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="px-4 pb-4"
          contentContainerStyle={{ gap: 8 }}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              onPress={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full ${
                selectedCategory === category 
                  ? 'bg-blue-600' 
                  : 'bg-gray-100'
              }`}
            >
              <Text className={`text-sm font-medium ${
                selectedCategory === category 
                  ? 'text-white' 
                  : 'text-gray-600'
              }`}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Experiences Grid */}
      <ScrollView className="flex-1 px-4 py-4">
        <View className="gap-4 pb-4">
          {filteredExperiences.map((exp) => (
            <TouchableOpacity 
              key={exp.id}
              onPress={() => handleExperiencePress(exp)}
              activeOpacity={0.9}
            >
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
                  <View className="absolute top-3 left-3">
                    <WanderChip variant="secondary" size="sm">
                      {exp.category}
                    </WanderChip>
                  </View>
                </View>
                <View className="p-4">
                  <Text className="text-lg font-bold text-gray-900 mb-1">{exp.title}</Text>
                  <View className="flex-row items-center gap-1 mb-2">
                    <MapPin size={14} color="#6B7280" />
                    <Text className="text-sm text-gray-500">{exp.location}</Text>
                  </View>
                  <Text className="text-sm text-gray-600 mb-3" numberOfLines={2}>
                    {exp.description}
                  </Text>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3">
                      <Text className="text-xs text-gray-500">
                        {exp.reviews.toLocaleString()} reviews
                      </Text>
                      <Text className="text-xs text-gray-400">•</Text>
                      <Text className="text-xs text-gray-500">{exp.duration}</Text>
                    </View>
                    <Text className="text-base font-bold text-blue-600">{exp.price}</Text>
                  </View>
                </View>
              </WanderCard>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
