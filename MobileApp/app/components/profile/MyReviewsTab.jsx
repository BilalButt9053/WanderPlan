import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../redux/slices/authSlice';
import { useGetReviewsQuery, useDeleteReviewMutation, useUpdateReviewMutation } from '../../../redux/api/reviewsApi';
import ReviewCard from '../ReviewCard';
import EditReviewModal from '../EditReviewModal';

export default function MyReviewsTab() {
  const { data, refetch, isFetching } = useGetReviewsQuery({ mine: true, sortBy: 'latest' });
  const [deleteReview] = useDeleteReviewMutation();
  const [updateReview] = useUpdateReviewMutation();
  const currentUser = useSelector(selectCurrentUser);
  const [expanded, setExpanded] = useState(new Set());
  const [editing, setEditing] = useState(null);

  const toggle = (id) => {
    const s = new Set(expanded);
    s.has(id) ? s.delete(id) : s.add(id);
    setExpanded(s);
  };

  const items = (data?.items || []).map(r => ({
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
    isSaved: false,
    replies: (r.replies || []).map(rep => ({
      id: rep._id,
      user: { name: rep.user?.name || 'User', avatar: rep.user?.avatar || 'U' },
      text: rep.text,
      timestamp: new Date(rep.createdAt).toLocaleString(),
    })),
    timestamp: new Date(r.createdAt).toLocaleString(),
  }));

  const handleDelete = async (reviewId) => {
    Alert.alert(
      'Delete Review',
      'Are you sure you want to delete this review?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteReview(reviewId).unwrap();
              Alert.alert('Success', 'Review deleted');
              refetch();
            } catch (e) {
              Alert.alert('Error', 'Could not delete review');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={{ padding: 16 }}>
      {isFetching && (
        <Text className="text-gray-600">Loading your reviews...</Text>
      )}
      {!isFetching && items.length === 0 && (
        <View className="items-center py-12">
          <Text className="text-gray-600">You haven't posted any reviews yet.</Text>
        </View>
      )}
      {items.map(review => (
        <View key={review.id} style={{ marginBottom: 16 }}>
          <ReviewCard
            review={review}
            expanded={expanded.has(review.id)}
            onToggle={toggle}
            onAddReply={undefined}
            onLike={undefined}
            onHelpful={undefined}
            onSave={undefined}
            currentUserId={currentUser?._id}
            onEdit={() => setEditing(review)}
            onDelete={() => handleDelete(review.id)}
          />
        </View>
      ))}
      {editing && (
        <EditReviewModal
          visible={!!editing}
          review={editing}
          onClose={() => setEditing(null)}
          onSubmit={async (payload) => {
            try {
              await updateReview({ id: editing.id, ...payload }).unwrap();
              setEditing(null);
              refetch();
              Alert.alert('Success', 'Review updated!');
            } catch (e) {
              Alert.alert('Error', 'Could not update review');
            }
          }}
        />
      )}
    </ScrollView>
  );
}
