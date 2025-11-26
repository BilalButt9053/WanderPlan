import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {
  MapPin,
  Star,
  Image as ImageIcon,
  Send,
} from 'lucide-react-native';
import { WanderButton } from './wander-button';
import Modal from './Modal';

export default function CreateReviewModal({ visible, onClose, onSubmit }) {
  const [place, setPlace] = useState('');
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [category, setCategory] = useState('food');

  const handleSubmit = () => {
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
      category,
      rating,
      text,
      images: [],
      tags: [],
      likes: 0,
      helpful: 0,
      replies: [],
      timestamp: 'Just now',
    };

    onSubmit(newReview);
    setPlace('');
    setRating(0);
    setText('');
    setCategory('food');
  };

  return (
    <Modal visible={visible} onClose={onClose} title="Write a Review">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Place Input */}
        <View className="mb-4">
          <Text className="mb-2 font-medium">Place</Text>
          <View className="flex-row items-center gap-2 bg-gray-100 rounded-xl px-4 py-3">
            <MapPin size={20} color="#666" />
            <TextInput
              placeholder="Search for a place..."
              value={place}
              onChangeText={setPlace}
              className="flex-1"
            />
          </View>
        </View>

        {/* Category */}
        <View className="mb-4">
          <Text className="mb-2 font-medium">Category</Text>
          <View className="flex-row gap-2">
            {['food', 'places', 'hotels'].map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setCategory(cat)}
                className="px-4 py-2 rounded-full"
                style={{
                  backgroundColor: category === cat ? '#3B82F6' : '#F3F4F6',
                }}
              >
                <Text
                  className="text-sm font-medium capitalize"
                  style={{ color: category === cat ? '#fff' : '#000' }}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Rating */}
        <View className="mb-4">
          <Text className="mb-2 font-medium">Rating</Text>
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
          <Text className="mb-2 font-medium">Your Review</Text>
          <TextInput
            placeholder="Share your experience..."
            value={text}
            onChangeText={setText}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            className="bg-gray-100 rounded-xl p-3"
          />
        </View>

        {/* Add Images */}
        <TouchableOpacity
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-2xl flex-row items-center justify-center gap-2 mb-4"
          onPress={() => Alert.alert('Coming Soon', 'Photo upload feature')}
        >
          <ImageIcon size={20} color="#666" />
          <Text className="text-gray-600">Add Photos</Text>
        </TouchableOpacity>

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
