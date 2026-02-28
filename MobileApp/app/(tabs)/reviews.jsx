import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Plus,
  Award,
} from 'lucide-react-native';
import ReviewCard from '../components/ReviewCard';
import CreateReviewModal from '../components/CreateReviewModal';
import EditReviewModal from '../components/EditReviewModal';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { useGetReviewsQuery, useCreateReviewMutation, useToggleLikeMutation, useToggleHelpfulMutation, useAddCommentMutation, useDeleteReviewMutation, useUpdateReviewMutation, useUploadImagesMutation, useToggleSaveMutation } from '../../redux/api/reviewsApi';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectCurrentUser } from '../../redux/slices/authSlice';

// Data now comes from API

const Reviews = () => {
  const { colors } = useTheme();
  const [activeCategory, setActiveCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [expandedReplies, setExpandedReplies] = useState(new Set());
  
  const isAuthed = useSelector(selectIsAuthenticated);
  const currentUser = useSelector(selectCurrentUser);
  const { data, refetch, isFetching } = useGetReviewsQuery({ category: 'all' });
  const [createReview, { isLoading: isCreating }] = useCreateReviewMutation();
  const [toggleLike] = useToggleLikeMutation();
  const [toggleHelpful] = useToggleHelpfulMutation();
  const [toggleSave] = useToggleSaveMutation();
  const [addComment] = useAddCommentMutation();
  const [deleteReview] = useDeleteReviewMutation();
  const [updateReview] = useUpdateReviewMutation();
  const [uploadImages] = useUploadImagesMutation();

  const reviewsList = useMemo(() => (data?.items || []).map(r => ({
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
  })), [data]);

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'food', label: 'Food' },
    { id: 'places', label: 'Places' },
    { id: 'hotels', label: 'Hotels' },
  ];

  const filteredReviews = activeCategory === 'all' 
    ? reviewsList 
    : reviewsList.filter(r => r.category === activeCategory);

  const handleLike = async (reviewId) => {
    if (!isAuthed) return Alert.alert('Login required', 'Please sign in to like reviews');
    try {
      await toggleLike(reviewId).unwrap();
    } catch (e) {
      Alert.alert('Error', 'Could not update like');
    }
  };

  const handleHelpful = async (reviewId) => {
    if (!isAuthed) return Alert.alert('Login required', 'Please sign in to mark helpful');
    try {
      await toggleHelpful(reviewId).unwrap();
    } catch (e) {
      Alert.alert('Error', 'Could not update helpful');
    }
  };

  const handleSave = async (reviewId) => {
    if (!isAuthed) return Alert.alert('Login required', 'Please sign in');
    try {
      await toggleSave(reviewId).unwrap();
      refetch();
    } catch (e) {
      Alert.alert('Error', 'Could not save/unsave review');
    }
  };

  const handleEdit = (review) => {
    setEditingReview(review);
    setShowEditModal(true);
  };

  const handleDelete = async (reviewId) => {
    if (!isAuthed) return Alert.alert('Login required', 'Please sign in');
    try {
      await deleteReview(reviewId).unwrap();
      Alert.alert('Success', 'Review deleted');
    } catch (e) {
      Alert.alert('Error', 'Could not delete review');
    }
  };

  const toggleReplies = (reviewId) => {
    const next = new Set(expandedReplies);
    next.has(reviewId) ? next.delete(reviewId) : next.add(reviewId);
    setExpandedReplies(next);
  };

  const handleAddComment = async (reviewId, text) => {
    if (!isAuthed) return Alert.alert('Login required', 'Please sign in to comment');
    try {
      await addComment({ id: reviewId, text }).unwrap();
      refetch();
    } catch {
      Alert.alert('Error', 'Could not add comment');
    }
  };

  const reviewsNeeded = 2;
  const totalReviews = 3;
  const progress = (totalReviews / (totalReviews + reviewsNeeded)) * 100;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ borderBottomColor: colors.border }} className="border-b">
        <View className="px-4 py-4">
          <View className="flex-row items-center justify-between mb-4">
            <Text style={{ color: colors.text }} className="text-2xl font-bold">Reviews</Text>
            <TouchableOpacity
              onPress={() => setShowCreateModal(true)}
              className="w-12 h-12 rounded-full items-center justify-center"
              style={{
                backgroundColor: '#3B82F6',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
              }}
            >
              <Plus size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Category Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row gap-2"
            contentContainerStyle={{ gap: 8 }}
          >
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setActiveCategory(cat.id)}
                className="px-4 py-2 rounded-full"
                style={{
                  backgroundColor: activeCategory === cat.id ? '#3B82F6' : '#F3F4F6',
                }}
              >
                <Text
                  className="text-sm font-medium"
                  style={{ color: activeCategory === cat.id ? '#fff' : '#000' }}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Gamification Card */}
        <View className="p-4">
          <View
            className="rounded-2xl p-4"
            style={{
              background: 'linear-gradient(to right, rgba(251, 146, 60, 0.1), rgba(59, 130, 246, 0.1))',
              backgroundColor: '#FEF3C7',
            }}
          >
            <View className="flex-row items-center gap-3">
              <View
                className="w-12 h-12 rounded-full items-center justify-center"
                style={{ backgroundColor: 'rgba(251, 146, 60, 0.2)' }}
              >
                <Award size={24} color="#F59E0B" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold mb-1">Almost there!</Text>
                <Text className="text-sm text-gray-600 mb-2">
                  {reviewsNeeded} reviews left to unlock 10% hotel coupon
                </Text>
                <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <View
                    className="h-full rounded-full"
                    style={{
                      width: `${progress}%`,
                      background: 'linear-gradient(to right, #F59E0B, #3B82F6)',
                      backgroundColor: '#3B82F6',
                    }}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Reviews Feed */}
        <View className="px-4 pb-4" style={{ gap: 16 }}>
          {filteredReviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              expanded={expandedReplies.has(review.id)}
              onToggle={toggleReplies}
              onAddReply={handleAddComment}
              onLike={() => handleLike(review.id)}
              onHelpful={() => handleHelpful(review.id)}
              onSave={() => handleSave(review.id)}
              currentUserId={currentUser?._id}
              onEdit={() => handleEdit(review)}
              onDelete={() => handleDelete(review.id)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Create Review Modal */}
      {showCreateModal && (
        <CreateReviewModal
          visible={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={async (newReview) => {
            if (!isAuthed) {
              Alert.alert('Login required', 'Please sign in to post a review');
              return;
            }
            try {
              let imageUrls = [];
              if (newReview.images && newReview.images.length > 0) {
                const formData = new FormData();
                newReview.images.forEach((uri, idx) => {
                  const name = uri.split('/').pop() || `photo_${idx}.jpg`;
                  formData.append('images', { uri, name, type: 'image/jpeg' });
                });
                const res = await uploadImages(formData).unwrap();
                imageUrls = res?.urls || [];
              }

              await createReview({
                place: newReview.place,
                category: newReview.category,
                rating: newReview.rating,
                text: newReview.text,
                images: imageUrls,
                tags: newReview.tags,
              }).unwrap();
              setShowCreateModal(false);
              Alert.alert('Success', 'Review posted! 🎉');
            } catch (e) {
              Alert.alert('Error', 'Could not post review');
            }
          }}
        />
      )}

      {/* Edit Review Modal */}
      {showEditModal && editingReview && (
        <EditReviewModal
          visible={showEditModal}
          review={editingReview}
          onClose={() => {
            setShowEditModal(false);
            setEditingReview(null);
          }}
          onSubmit={async (updatedData) => {
            try {
              await updateReview({
                id: editingReview.id,
                ...updatedData,
              }).unwrap();
              setShowEditModal(false);
              setEditingReview(null);
              Alert.alert('Success', 'Review updated! ✨');
            } catch (e) {
              Alert.alert('Error', 'Could not update review');
            }
          }}
        />
      )}
    </SafeAreaView>
  );
};

export default Reviews;