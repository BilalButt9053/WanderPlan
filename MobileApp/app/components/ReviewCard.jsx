import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  Share,
} from 'react-native';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Star,
  MapPin,
  BadgeCheck,
  ThumbsUp,
  Send,
} from 'lucide-react-native';
import { WanderCard } from './wander-card';
import { WanderChip } from './wander-chip';
import { ImageWithFallback } from './ImageWithFallback';

export default function ReviewCard({ 
  review, 
  isExpanded,
  onLike, 
  onHelpful,
  onSave,
  onToggleReplies
}) {
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this review of ${review.place}: ${review.text}`,
      });
    } catch (error) {
      Alert.alert('Success', 'Link copied to clipboard!');
    }
  };

  return (
    <WanderCard>
      {/* User Info */}
      <View className="flex-row items-start gap-3 mb-3">
        <View
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{
            background: 'linear-gradient(to bottom right, #3B82F6, #F59E0B)',
            backgroundColor: '#3B82F6',
          }}
        >
          <Text className="text-white font-semibold">{review.user.avatar}</Text>
        </View>
        <View className="flex-1">
          <View className="flex-row items-center gap-2 mb-1">
            <Text className="font-semibold" numberOfLines={1}>{review.user.name}</Text>
            {review.user.isVerified && (
              <BadgeCheck size={16} color="#3B82F6" />
            )}
          </View>
          {review.user.role && (
            <WanderChip variant="primary" style={{ alignSelf: 'flex-start', marginBottom: 8 }}>
              <Text className="text-xs text-blue-600">{review.user.role}</Text>
            </WanderChip>
          )}
          <View className="flex-row items-center gap-2">
            <MapPin size={12} color="#666" />
            <Text className="text-sm text-gray-600">{review.place}</Text>
            <Text className="text-sm text-gray-600">•</Text>
            <Text className="text-sm text-gray-600">{review.timestamp}</Text>
          </View>
        </View>
      </View>

      {/* Rating */}
      <View className="flex-row items-center gap-1 mb-3">
        {[...Array(5)].map((_, idx) => (
          <Star
            key={idx}
            size={16}
            color={idx < Math.floor(review.rating) ? '#F59E0B' : '#D1D5DB'}
            fill={idx < Math.floor(review.rating) ? '#F59E0B' : 'transparent'}
          />
        ))}
        <Text className="text-sm ml-1">{review.rating}</Text>
      </View>

      {/* Review Text */}
      <Text className="mb-3 text-gray-800">{review.text}</Text>

      {/* Images */}
      {review.images.length > 0 && (
        <View
          className="mb-3"
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          {review.images.slice(0, 4).map((img, idx) => (
            <View
              key={idx}
              className="rounded-xl overflow-hidden"
              style={{
                width: review.images.length === 1 ? '100%' : 
                       review.images.length === 2 ? '48%' :
                       review.images.length === 3 && idx === 0 ? '100%' : '48%',
                aspectRatio: 16 / 9,
              }}
            >
              <ImageWithFallback
                source={{ uri: img }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
              {review.images.length > 4 && idx === 3 && (
                <View
                  className="absolute inset-0 items-center justify-center"
                  style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                >
                  <Text className="text-white text-lg font-bold">
                    +{review.images.length - 4}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Tags */}
      <View className="flex-row flex-wrap gap-2 mb-3">
        {review.tags.map((tag) => (
          <WanderChip key={tag} variant="secondary">
            <Text className="text-xs text-gray-700">{tag}</Text>
          </WanderChip>
        ))}
      </View>

      {/* Action Buttons */}
      <View className="flex-row items-center gap-4 border-t border-gray-200 pt-3">
        <TouchableOpacity
          onPress={onLike}
          className="flex-row items-center gap-1"
        >
          <Heart
            size={18}
            color={review.isLiked ? '#EF4444' : '#666'}
            fill={review.isLiked ? '#EF4444' : 'transparent'}
          />
          <Text className={review.isLiked ? 'text-red-500' : 'text-gray-600'}>
            {review.likes}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onHelpful}
          className="flex-row items-center gap-1"
        >
          <ThumbsUp
            size={18}
            color={review.isHelpful ? '#F59E0B' : '#666'}
            fill={review.isHelpful ? '#F59E0B' : 'transparent'}
          />
          <Text className={review.isHelpful ? 'text-orange-500' : 'text-gray-600'}>
            {review.helpful}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onToggleReplies}
          className="flex-row items-center gap-1"
        >
          <MessageCircle size={18} color="#666" />
          <Text className="text-gray-600">{review.replies.length}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleShare}
          className="flex-row items-center gap-1"
        >
          <Share2 size={18} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onSave}
          className="ml-auto"
        >
          <Bookmark
            size={18}
            color={review.isSaved ? '#3B82F6' : '#666'}
            fill={review.isSaved ? '#3B82F6' : 'transparent'}
          />
        </TouchableOpacity>
      </View>

      {/* Replies */}
      {isExpanded && review.replies.length > 0 && (
        <View className="mt-4 pl-4 border-l-2 border-blue-200" style={{ gap: 12 }}>
          {review.replies.map((reply) => (
            <View key={reply.id} className="flex-row gap-2">
              <View
                className="w-8 h-8 rounded-full items-center justify-center"
                style={{ backgroundColor: '#F3F4F6' }}
              >
                <Text className="text-sm font-semibold">{reply.user.avatar}</Text>
              </View>
              <View className="flex-1 bg-gray-100 rounded-xl p-3">
                <View className="flex-row items-center gap-2 mb-1">
                  <Text className="text-sm font-semibold">{reply.user.name}</Text>
                  <Text className="text-xs text-gray-500">{reply.timestamp}</Text>
                </View>
                <Text className="text-sm text-gray-800">{reply.text}</Text>
              </View>
            </View>
          ))}

          {/* Reply Input */}
          <View className="flex-row gap-2">
            <TextInput
              placeholder="Write a reply..."
              className="flex-1 px-3 py-2 bg-gray-100 rounded-xl text-sm"
            />
            <TouchableOpacity
              className="w-10 h-10 rounded-xl items-center justify-center"
              style={{ backgroundColor: '#3B82F6' }}
            >
              <Send size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </WanderCard>
  );
}
