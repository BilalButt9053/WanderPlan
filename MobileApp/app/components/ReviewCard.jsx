import React, { useEffect, useRef, useState } from 'react';
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
  MoreVertical,
  Edit,
  Trash2,
} from 'lucide-react-native';
import { WanderCard } from './wander-card';
import { WanderChip } from './wander-chip';
import { ImageWithFallback } from './ImageWithFallback';

const ReviewCard = ({ review, expanded, onToggle, onAddReply, onEdit, onDelete, onLike, onHelpful, onSave, currentUserId }) => {
  const [replyText, setReplyText] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [localLiked, setLocalLiked] = useState(review.isLiked);
  const [localHelpful, setLocalHelpful] = useState(review.isHelpful);
  const [localSaved, setLocalSaved] = useState(review.isSaved);
  const [localLikes, setLocalLikes] = useState(review.likes);
  const [localHelpfulCount, setLocalHelpfulCount] = useState(review.helpful);
  const replyInputRef = useRef(null);
  const [shouldFocusReply, setShouldFocusReply] = useState(false);
  
  const isOwner = currentUserId && review?.user?._id === currentUserId;

  useEffect(() => {
    if (expanded && shouldFocusReply) {
      setTimeout(() => replyInputRef.current?.focus?.(), 0);
      setShouldFocusReply(false);
    }
  }, [expanded, shouldFocusReply]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this review of ${review.place}: ${review.text}`,
      });
    } catch (error) {
      Alert.alert('Success', 'Link copied to clipboard!');
    }
  };

  const handleLike = () => {
    // Optimistic update
    setLocalLiked(!localLiked);
    setLocalLikes(localLiked ? localLikes - 1 : localLikes + 1);
    onLike?.();
  };

  const handleHelpful = () => {
    // Optimistic update
    setLocalHelpful(!localHelpful);
    setLocalHelpfulCount(localHelpful ? localHelpfulCount - 1 : localHelpfulCount + 1);
    onHelpful?.();
  };

  const handleSave = () => {
    // Optimistic update
    setLocalSaved(!localSaved);
    onSave?.();
  };

  const handleMenuAction = (action) => {
    setShowMenu(false);
    if (action === 'edit') {
      onEdit?.();
    } else if (action === 'delete') {
      Alert.alert(
        'Delete Review',
        'Are you sure you want to delete this review?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => onDelete?.() },
        ]
      );
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

        {/* 3-Dots Menu */}
        {isOwner && (
          <View>
            <TouchableOpacity
              onPress={() => setShowMenu(!showMenu)}
              className="w-8 h-8 rounded-full items-center justify-center"
            >
              <MoreVertical size={20} color="#666" />
            </TouchableOpacity>
            
            {showMenu && (
              <View className="absolute right-0 top-10 bg-white rounded-xl shadow-lg border border-gray-200 z-50" style={{ minWidth: 140 }}>
                <TouchableOpacity
                  onPress={() => handleMenuAction('edit')}
                  className="flex-row items-center gap-2 px-4 py-3 border-b border-gray-100"
                >
                  <Edit size={16} color="#3B82F6" />
                  <Text className="text-sm text-gray-700">Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleMenuAction('delete')}
                  className="flex-row items-center gap-2 px-4 py-3"
                >
                  <Trash2 size={16} color="#EF4444" />
                  <Text className="text-sm text-red-600">Delete</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
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
          onPress={handleLike}
          className="flex-row items-center gap-1"
        >
          <Heart
            size={18}
            color={localLiked ? '#EF4444' : '#666'}
            fill={localLiked ? '#EF4444' : 'transparent'}
          />
          <Text className={localLiked ? 'text-red-500' : 'text-gray-600'}>
            {localLikes}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleHelpful}
          className="flex-row items-center gap-1"
        >
          <ThumbsUp
            size={18}
            color={localHelpful ? '#F59E0B' : '#666'}
            fill={localHelpful ? '#F59E0B' : 'transparent'}
          />
          <Text className={localHelpful ? 'text-orange-500' : 'text-gray-600'}>
            {localHelpfulCount}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            onToggle?.(review.id);
            setShouldFocusReply(true);
          }}
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
          onPress={handleSave}
          className="ml-auto"
        >
          <Bookmark
            size={18}
            color={localSaved ? '#3B82F6' : '#666'}
            fill={localSaved ? '#3B82F6' : 'transparent'}
          />
        </TouchableOpacity>
      </View>

      {/* Replies */}
      {expanded && (
        <View className="mt-3">
          {review.replies.map((reply) => (
            <View key={reply.id} className="flex-row gap-2 mt-1 mb-1">
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
              ref={replyInputRef}
              placeholder="Write a reply..."
              className="flex-1 px-3 py-2 bg-gray-100 rounded-xl text-sm"
              value={replyText}
              onChangeText={setReplyText}
            />
            <TouchableOpacity
              className="w-10 h-10 rounded-xl items-center justify-center"
              style={{ backgroundColor: '#3B82F6' }}
              onPress={() => {
                if (onAddReply && replyText.trim()) {
                  onAddReply(review.id, replyText.trim());
                  setReplyText('');
                }
              }}
            >
              <Send size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </WanderCard>
  );
}

export default ReviewCard;

// Focus reply input when expanded via comment icon
// no-op export placeholder removed
