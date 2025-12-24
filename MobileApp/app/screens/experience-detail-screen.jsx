import React, { useState } from 'react';
import { 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView,
  Dimensions,
  Share
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ChevronLeft,
  Star,
  MapPin,
  Clock,
  Users,
  Calendar,
  Heart,
  Share2,
  Phone,
  Mail,
  Globe,
  CheckCircle
} from 'lucide-react-native';
import ImageWithFallback from '../components/ImageWithFallback';
import WanderCard from '../components/wander-card';
import WanderChip from '../components/wander-chip';
import { WanderButton } from '../components/wander-button';

const { width } = Dimensions.get('window');

// Mock data - in real app, this would come from API
const experiencesData = {
  1: {
    id: 1,
    title: 'Hunza Valley Beauty',
    location: 'Hunza, Gilgit-Baltistan',
    image: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxodW56YSUyMHZhbGxleSUyMHBha2lzdGFufGVufDF8fHx8MTczMjYxMjAwMHww&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.9,
    reviews: 2834,
    description: 'Experience the breathtaking beauty of Hunza Valley with its snow-capped mountains, crystal clear rivers, and ancient forts. This tour includes visits to Baltit Fort, Altit Fort, Eagle\'s Nest viewpoint, and the stunning Attabad Lake.',
    duration: '3-5 days',
    price: 'PKR 45,000',
    category: 'Nature',
    images: [
      'https://images.unsplash.com/photo-1609137144813-7d9921338f24?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxodW56YSUyMHZhbGxleSUyMHBha2lzdGFufGVufDF8fHx8MTczMjYxMjAwMHww&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzd2F0JTIwdmFsbGV5fGVufDF8fHx8MTczMjYxMjAwMHww&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYWlyeSUyMG1lYWRvd3MlMjBwYWtpc3RhbnxlbnwxfHx8fDE3MzI2MTIwMDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    highlights: [
      'Visit to Baltit & Altit Forts',
      'Eagle\'s Nest viewpoint',
      'Attabad Lake boat ride',
      'Local cultural experiences',
      'Traditional Hunza cuisine',
      'Professional tour guide',
    ],
    included: [
      'Transportation',
      'Accommodation',
      'Breakfast & Dinner',
      'Entry tickets',
      'Tour guide',
    ],
    groupSize: '4-12 people',
    languages: ['English', 'Urdu'],
    contact: {
      phone: '+92 300 1234567',
      email: 'tours@wanderplan.pk',
      website: 'www.wanderplan.pk',
    },
  },
  2: {
    id: 2,
    title: 'Fairy Meadows Trek',
    location: 'Nanga Parbat, KPK',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYWlyeSUyMG1lYWRvd3MlMjBwYWtpc3RhbnxlbnwxfHx8fDE3MzI2MTIwMDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.8,
    reviews: 1567,
    description: 'Trek through the magical Fairy Meadows with stunning views of Nanga Parbat, the ninth highest mountain in the world. This adventure includes camping under the stars and experiencing the raw beauty of the Himalayas.',
    duration: '4-6 days',
    price: 'PKR 38,000',
    category: 'Adventure',
    images: [
      'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYWlyeSUyMG1lYWRvd3MlMjBwYWtpc3RhbnxlbnwxfHx8fDE3MzI2MTIwMDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1609137144813-7d9921338f24?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxodW56YSUyMHZhbGxleSUyMHBha2lzdGFufGVufDF8fHx8MTczMjYxMjAwMHww&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    highlights: [
      'Nanga Parbat base camp trek',
      'Camping in Fairy Meadows',
      'Sunrise at Beyal Camp',
      'Jeep safari adventure',
      'Mountain photography',
      'Experienced trekking guide',
    ],
    included: [
      'Transportation from Islamabad',
      'Camping equipment',
      'All meals',
      'Trekking guide',
      'Porter services',
    ],
    groupSize: '6-15 people',
    languages: ['English', 'Urdu'],
    contact: {
      phone: '+92 300 1234567',
      email: 'tours@wanderplan.pk',
      website: 'www.wanderplan.pk',
    },
  },
  3: {
    id: 3,
    title: 'Lahore Fort Heritage',
    location: 'Lahore, Punjab',
    image: 'https://images.unsplash.com/photo-1571847027516-1df28ffc1e29?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYWhvcmUlMjBmb3J0JTIwcGFraXN0YW58ZW58MXx8fHwxNzMyNjEyMDAwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.7,
    reviews: 3245,
    description: 'Explore the historic Lahore Fort, a UNESCO World Heritage site showcasing Mughal architecture and rich history. Visit the Sheesh Mahal, Alamgiri Gate, and learn about the glorious Mughal era.',
    duration: '1 day',
    price: 'PKR 5,000',
    category: 'Heritage',
    images: [
      'https://images.unsplash.com/photo-1571847027516-1df28ffc1e29?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYWhvcmUlMjBmb3J0JTIwcGFraXN0YW58ZW58MXx8fHwxNzMyNjEyMDAwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    highlights: [
      'Lahore Fort tour',
      'Sheesh Mahal (Palace of Mirrors)',
      'Alamgiri Gate',
      'Badshahi Mosque visit',
      'Old city food street',
      'Historical storytelling',
    ],
    included: [
      'Entry tickets',
      'Professional guide',
      'Lunch at food street',
      'Transportation within Lahore',
    ],
    groupSize: '2-20 people',
    languages: ['English', 'Urdu', 'Punjabi'],
    contact: {
      phone: '+92 300 1234567',
      email: 'tours@wanderplan.pk',
      website: 'www.wanderplan.pk',
    },
  },
};

export default function ExperienceDetailScreen() {
  const router = useRouter();
  const { experienceId } = useLocalSearchParams();
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const experience = experiencesData[experienceId] || experiencesData[1];

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this amazing experience: ${experience.title} - ${experience.location}`,
        title: experience.title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleBookNow = () => {
    // Navigate to booking screen or show booking modal
    console.log('Book now:', experience.title);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1">
        {/* Image Gallery */}
        <View className="relative">
          <View className="h-80">
            <ImageWithFallback
              src={experience.images?.[selectedImageIndex] || experience.image}
              alt={experience.title}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>

          {/* Header Overlay */}
          <View className="absolute top-0 left-0 right-0 flex-row items-center justify-between p-4">
            <TouchableOpacity 
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-white/90 items-center justify-center shadow-sm"
            >
              <ChevronLeft size={24} color="#1F2937" />
            </TouchableOpacity>
            <View className="flex-row items-center gap-2">
              <TouchableOpacity 
                onPress={() => setIsFavorite(!isFavorite)}
                className="w-10 h-10 rounded-full bg-white/90 items-center justify-center shadow-sm"
              >
                <Heart 
                  size={20} 
                  color={isFavorite ? "#EF4444" : "#6B7280"} 
                  fill={isFavorite ? "#EF4444" : "transparent"}
                />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleShare}
                className="w-10 h-10 rounded-full bg-white/90 items-center justify-center shadow-sm"
              >
                <Share2 size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Image Indicators */}
          {experience.images && experience.images.length > 1 && (
            <View className="absolute bottom-4 left-0 right-0 flex-row justify-center gap-2">
              {experience.images.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedImageIndex(index)}
                  className={`h-2 rounded-full ${
                    selectedImageIndex === index 
                      ? 'w-8 bg-white' 
                      : 'w-2 bg-white/50'
                  }`}
                />
              ))}
            </View>
          )}
        </View>

        {/* Content */}
        <View className="px-4 py-6">
          {/* Title & Rating */}
          <View className="mb-4">
            <View className="flex-row items-start justify-between mb-2">
              <View className="flex-1 pr-4">
                <Text className="text-2xl font-bold text-gray-900 mb-2">
                  {experience.title}
                </Text>
                <View className="flex-row items-center gap-1">
                  <MapPin size={16} color="#6B7280" />
                  <Text className="text-sm text-gray-500">{experience.location}</Text>
                </View>
              </View>
              <WanderChip variant="secondary" size="sm">
                {experience.category}
              </WanderChip>
            </View>

            <View className="flex-row items-center gap-4 mt-3">
              <View className="flex-row items-center gap-1">
                <Star size={16} fill="#10B981" color="#10B981" />
                <Text className="text-base font-semibold text-gray-900">
                  {experience.rating}
                </Text>
                <Text className="text-sm text-gray-500">
                  ({experience.reviews.toLocaleString()} reviews)
                </Text>
              </View>
            </View>
          </View>

          {/* Quick Info */}
          <WanderCard className="mb-6">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 items-center border-r border-gray-200 pr-4">
                <Clock size={20} color="#2563EB" />
                <Text className="text-xs text-gray-500 mt-1">Duration</Text>
                <Text className="text-sm font-semibold text-gray-900 mt-1">
                  {experience.duration}
                </Text>
              </View>
              <View className="flex-1 items-center border-r border-gray-200 px-4">
                <Users size={20} color="#2563EB" />
                <Text className="text-xs text-gray-500 mt-1">Group Size</Text>
                <Text className="text-sm font-semibold text-gray-900 mt-1">
                  {experience.groupSize}
                </Text>
              </View>
              <View className="flex-1 items-center pl-4">
                <Calendar size={20} color="#2563EB" />
                <Text className="text-xs text-gray-500 mt-1">Available</Text>
                <Text className="text-sm font-semibold text-gray-900 mt-1">
                  Year-round
                </Text>
              </View>
            </View>
          </WanderCard>

          {/* Description */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-3">About</Text>
            <Text className="text-sm text-gray-600 leading-6">
              {experience.description}
            </Text>
          </View>

          {/* Highlights */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-3">Highlights</Text>
            <View className="gap-2">
              {experience.highlights.map((highlight, index) => (
                <View key={index} className="flex-row items-start gap-2">
                  <CheckCircle size={18} color="#10B981" className="mt-0.5" />
                  <Text className="flex-1 text-sm text-gray-600">{highlight}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* What's Included */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-3">What's Included</Text>
            <WanderCard className="bg-green-50">
              <View className="gap-2">
                {experience.included.map((item, index) => (
                  <View key={index} className="flex-row items-center gap-2">
                    <View className="w-2 h-2 rounded-full bg-green-600" />
                    <Text className="text-sm text-gray-700">{item}</Text>
                  </View>
                ))}
              </View>
            </WanderCard>
          </View>

          {/* Languages */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-3">Languages</Text>
            <View className="flex-row items-center gap-2">
              {experience.languages.map((lang, index) => (
                <WanderChip key={index} variant="secondary" size="sm">
                  {lang}
                </WanderChip>
              ))}
            </View>
          </View>

          {/* Contact Information */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-3">Contact</Text>
            <WanderCard>
              <View className="gap-3">
                <View className="flex-row items-center gap-3">
                  <Phone size={18} color="#2563EB" />
                  <Text className="text-sm text-gray-700">{experience.contact.phone}</Text>
                </View>
                <View className="flex-row items-center gap-3">
                  <Mail size={18} color="#2563EB" />
                  <Text className="text-sm text-gray-700">{experience.contact.email}</Text>
                </View>
                <View className="flex-row items-center gap-3">
                  <Globe size={18} color="#2563EB" />
                  <Text className="text-sm text-gray-700">{experience.contact.website}</Text>
                </View>
              </View>
            </WanderCard>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View className="bg-white border-t border-gray-200 px-4 py-4">
        <View className="flex-row items-center justify-between gap-4">
          <View>
            <Text className="text-xs text-gray-500">Starting from</Text>
            <Text className="text-2xl font-bold text-blue-600">{experience.price}</Text>
          </View>
          <View className="flex-1">
            <WanderButton 
              onPress={handleBookNow}
              className="w-full"
            >
              Book Now
            </WanderButton>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
