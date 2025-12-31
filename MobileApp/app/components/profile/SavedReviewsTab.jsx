import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../redux/slices/authSlice';
import { useGetReviewsQuery, useToggleSaveMutation, useDeleteReviewMutation, useUpdateReviewMutation } from '../../../redux/api/reviewsApi';
import ReviewCard from '../ReviewCard';
import EditReviewModal from '../EditReviewModal';

export default function SavedReviewsTab() {
  const currentUser = useSelector(selectCurrentUser);
  const { data, refetch, isFetching } = useGetReviewsQuery({ limit: 100 });
  const [toggleSave] = useToggleSaveMutation();
  const [deleteReview] = useDeleteReviewMutation();
  const [updateReview] = useUpdateReviewMutation();
  const [expanded, setExpanded] = useState(new Set());
  const [editing, setEditing] = useState(null);

  const toggle = (id) => {
    const s = new Set(expanded);
    s.has(id) ? s.delete(id) : s.add(id);
    setExpanded(s);
  };

  // Filter only saved reviews (where isSaved is true)
  const savedItems = ((data?.items || []).filter(r => r.isSaved || r.savedBy?.includes(currentUser?._id))).map(r => ({
    id: r._id,
    user: {
      _id: r.user?._id,
      name: r.user?.name || 'User',
      avatar: r.user?.avatar || 'U',
      isVerified: !!r.user?.isVerified,
      role: r.user?.role,
    },
    place: r.place,
    category: r.category,
    rating: r.rating,
    text: r.text,
    images: r.images || [],
    tags: r.tags || [],
    likes: r.likes ?? (r.likedBy?.length || 0),
    helpful: r.helpful ?? (r.helpfulBy?.length || 0),
    isLiked: r.isLiked || false,
    isHelpful: r.isHelpful || false,
    isSaved: r.isSaved || r.savedBy?.includes(currentUser?._id) || false,
    replies: (r.replies || []).map(rep => ({
      id: rep._id,
      user: { name: rep.user?.name || 'User', avatar: rep.user?.avatar || 'U' },
      text: rep.text,
      timestamp: new Date(rep.createdAt).toLocaleString(),
    })),
    timestamp: new Date(r.createdAt).toLocaleString(),
  }));

  const handleSave = async (reviewId) => {
    try {
      await toggleSave(reviewId).unwrap();
      refetch();
    } catch (e) {
      Alert.alert('Error', 'Could not save/unsave review');
    }
  };

  return (
    <ScrollView style={{ padding: 16 }}>
      {isFetching && (
        <Text className="text-gray-600">Loading saved reviews...</Text>
      )}
      {!isFetching && savedItems.length === 0 && (
        <View className="items-center py-12">
          <Text className="text-gray-600">You haven't saved any reviews yet.</Text>
        </View>
      )}
      {savedItems.map(review => (
        <View key={review.id} style={{ marginBottom: 16 }}>
          <ReviewCard
            review={review}
            expanded={expanded.has(review.id)}
            onToggle={toggle}
            onAddReply={undefined}
            onLike={undefined}
            onHelpful={undefined}
            onSave={() => handleSave(review.id)}
            currentUserId={currentUser?._id}
            onEdit={undefined}
            onDelete={undefined}
          />
        </View>
      ))}
    </ScrollView>
  );
}
