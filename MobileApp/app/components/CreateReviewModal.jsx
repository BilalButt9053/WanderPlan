import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import {
  MapPin,
  Star,
  Image as ImageIcon,
  Camera,
  Send,
} from 'lucide-react-native';
import { WanderButton } from './wander-button';
import Modal from './Modal';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../hooks/useTheme';
import { useGetBusinessesQuery } from '../../redux/api/businessItemsApi';

const getInitialCategory = (category) => {
  if (category === 'hotels' || category === 'food' || category === 'places') return category;
  return 'food';
};

const getCategoryForBusinessType = (businessType) => {
  const type = businessType?.toLowerCase();
  if (['hotel', 'guest_house', 'resort', 'hostel', 'accommodation'].includes(type)) return 'hotels';
  if (['restaurant', 'cafe', 'food', 'bakery'].includes(type)) return 'food';
  return 'places';
};

export default function CreateReviewModal({
  visible,
  onClose,
  onSubmit,
  initialPlace = '',
  initialCategory = 'food',
  initialTags = [],
  initialBusinessId = null,
}) {
  const { colors } = useTheme();
  const [place, setPlace] = useState('');
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [category, setCategory] = useState(getInitialCategory(initialCategory));
  const [images, setImages] = useState([]); // array of { uri }
  const { data: businessesData } = useGetBusinessesQuery(
    { search: place, limit: 10 },
    { skip: !visible || place.trim().length < 2 }
  );
  const businessSuggestions = businessesData?.businesses || [];

  useEffect(() => {
    if (!visible) return;
    setPlace(initialPlace || '');
    setSelectedBusiness(initialBusinessId ? { _id: initialBusinessId, businessName: initialPlace } : null);
    setCategory(getInitialCategory(initialCategory));
  }, [visible, initialPlace, initialCategory, initialBusinessId]);

  const handleSelectBusiness = (business) => {
    setSelectedBusiness(business);
    setPlace(business.businessName || '');
    setCategory(getCategoryForBusinessType(business.businessType));
  };

  const handleSubmit = () => {
    if (!selectedBusiness?._id) {
      Alert.alert('Select a business', 'Please choose a registered business from the list.');
      return;
    }

    if (!place || rating === 0 || !text) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const newReview = {
      id: Date.now().toString(),
      user: {
        name: 'You',
        avatar: 'Y',
        isVerified: false,
      },
      place,
      businessId: selectedBusiness._id,
      category,
      rating,
      text,
      images: images.map(i => i.uri),
      tags: initialTags,
      likes: 0,
      helpful: 0,
      replies: [],
      timestamp: 'Just now',
    };

    onSubmit(newReview);
    setPlace('');
    setSelectedBusiness(null);
    setRating(0);
    setText('');
    setCategory(getInitialCategory(initialCategory));
    setImages([]);
  };

  const pickImageFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need access to your photos to upload images.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled) {
      const asset = result.assets?.[0];
      if (asset?.uri) {
        setImages((prev) => [...prev, { uri: asset.uri }]);
      }
    }
  };

  const takePhotoWithCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need access to your camera to take photos.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled) {
      const asset = result.assets?.[0];
      if (asset?.uri) {
        setImages((prev) => [...prev, { uri: asset.uri }]);
      }
    }
  };

  return (
    <Modal visible={visible} onClose={onClose} title="Write a Review">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Place Input */}
        <View className="mb-4">
          <Text className="mb-2 font-medium" style={{ color: colors.text }}>Place</Text>
          <View className="flex-row items-center gap-2 rounded-xl px-4 py-3" style={{ backgroundColor: colors.input }}>
            <MapPin size={20} color={colors.textSecondary} />
            <TextInput
              placeholder="Search registered business..."
              placeholderTextColor={colors.textTertiary}
              value={place}
              onChangeText={(value) => {
                setPlace(value);
                setSelectedBusiness(null);
              }}
              className="flex-1"
              style={{ color: colors.text }}
            />
          </View>
          {businessSuggestions.length > 0 && !selectedBusiness?._id && (
            <View className="mt-2 rounded-xl overflow-hidden" style={{ borderWidth: 1, borderColor: colors.border }}>
              {businessSuggestions.map((business) => (
                <TouchableOpacity
                  key={business._id}
                  onPress={() => handleSelectBusiness(business)}
                  className="px-4 py-3"
                  style={{ backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border }}
                >
                  <Text className="font-medium" style={{ color: colors.text }}>
                    {business.businessName}
                  </Text>
                  <Text className="text-xs mt-1" style={{ color: colors.textSecondary }}>
                    {[business.businessType, business.address?.city].filter(Boolean).join(' • ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {selectedBusiness?._id && (
            <Text className="text-xs mt-2" style={{ color: '#059669' }}>
              Reviewing registered business: {selectedBusiness.businessName || place}
            </Text>
          )}
        </View>

        {/* Category */}
        <View className="mb-4">
          <Text className="mb-2 font-medium" style={{ color: colors.text }}>Category</Text>
          <View className="flex-row gap-2">
            {['food', 'places', 'hotels'].map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setCategory(cat)}
                className="px-4 py-2 rounded-full"
                style={{
                  backgroundColor: category === cat ? '#3B82F6' : colors.input,
                }}
              >
                <Text
                  className="text-sm font-medium capitalize"
                  style={{ color: category === cat ? '#fff' : colors.text }}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Rating */}
        <View className="mb-4">
          <Text className="mb-2 font-medium" style={{ color: colors.text }}>Rating</Text>
          <View className="flex-row gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
              >
                <Star
                  size={32}
                  color={star <= rating ? '#F59E0B' : '#D1D5DB'}
                  fill={star <= rating ? '#F59E0B' : 'transparent'}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Review Text */}
        <View className="mb-4">
          <Text className="mb-2 font-medium" style={{ color: colors.text }}>Your Review</Text>
          <TextInput
            placeholder="Share your experience..."
            placeholderTextColor={colors.textTertiary}
            value={text}
            onChangeText={setText}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            className="rounded-xl p-3"
            style={{ backgroundColor: colors.input, color: colors.text }}
          />
        </View>

        {/* Add Images */}
        <View className="flex-row gap-2 mb-4">
          <TouchableOpacity
            className="flex-1 py-3 border-2 border-dashed rounded-2xl flex-row items-center justify-center gap-2"
            style={{ borderColor: colors.border }}
            onPress={takePhotoWithCamera}
          >
            <Camera size={20} color={colors.textSecondary} />
            <Text style={{ color: colors.textSecondary }}>Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 py-3 border-2 border-dashed rounded-2xl flex-row items-center justify-center gap-2"
            style={{ borderColor: colors.border }}
            onPress={pickImageFromGallery}
          >
            <ImageIcon size={20} color={colors.textSecondary} />
            <Text style={{ color: colors.textSecondary }}>Gallery</Text>
          </TouchableOpacity>
        </View>

        {images.length > 0 && (
          <View className="mb-4" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {images.map((img, idx) => (
              <View key={`${img.uri}-${idx}`} className="relative rounded-xl overflow-hidden" style={{ width: '30%', aspectRatio: 1 }}>
                <Image
                  source={{ uri: img.uri }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={() => setImages(images.filter((_, i) => i !== idx))}
                  className="absolute top-1 right-1 bg-black/50 rounded-full px-2 py-1"
                >
                  <Text className="text-white text-xs">X</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Submit Button */}
        <WanderButton onPress={handleSubmit}>
          <View className="flex-row items-center gap-2">
            <Send size={20} color="#fff" />
            <Text className="text-white font-semibold">Post Review</Text>
          </View>
        </WanderButton>
      </ScrollView>
    </Modal>
  );
}
