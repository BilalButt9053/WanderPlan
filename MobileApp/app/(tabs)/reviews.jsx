import React, { useState } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';

const reviewsData = [
  {
    id: '1',
    user: {
      name: 'Sarah Martinez',
      avatar: 'SM',
      isVerified: true,
      role: 'Top Contributor',
    },
    place: 'La Bella Cucina',
    category: 'food',
    rating: 5,
    text: 'Absolutely amazing experience! The pasta was fresh and cooked to perfection. The ambiance is cozy and romantic. Perfect for a date night! 🍝✨',
    images: [
      'https://images.unsplash.com/photo-1676471932681-45fa972d848a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwZm9vZCUyMGRpbmluZ3xlbnwxfHx8fDE3NjAyNTkyMzd8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1667388968964-4aa652df0a9b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwaW50ZXJpb3IlMjBkaW5pbmd8ZW58MXx8fHwxNzYwMzc0Mjc2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    tags: ['#localfood', '#datenight', '#italian'],
    likes: 234,
    helpful: 89,
    replies: [
      {
        id: 'r1',
        user: { name: 'John Smith', avatar: 'JS' },
        text: 'Thanks for the recommendation! Going there this weekend 🙌',
        timestamp: '2 hours ago',
      },
    ],
    timestamp: '5 hours ago',
  },
  {
    id: '2',
    user: {
      name: 'Alex Chen',
      avatar: 'AC',
      isVerified: true,
      role: 'Local Guide',
    },
    place: 'Modern Art Museum',
    category: 'places',
    rating: 4.5,
    text: 'Great collection of contemporary art. Spent 3 hours here and could have stayed longer. The new exhibition is a must-see!',
    images: [
      'https://images.unsplash.com/photo-1631168524494-3711bece9c09?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNldW0lMjBhcnQlMjBnYWxsZXJ5fGVufDF8fHx8MTc2MDMxMjIwM3ww&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    tags: ['#art', '#museum', '#culture'],
    likes: 156,
    helpful: 45,
    replies: [],
    timestamp: '1 day ago',
  },
  {
    id: '3',
    user: {
      name: 'Emma Wilson',
      avatar: 'EW',
      isVerified: false,
    },
    place: 'Secret Garden Cafe',
    category: 'food',
    rating: 5,
    text: 'Hidden gem alert! 💎 This place has the best coffee in town and the outdoor seating is gorgeous. Budget-friendly too!',
    images: [
      'https://images.unsplash.com/photo-1629096668246-524da904215c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWZlJTIwY29mZmVlJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzYwMzc1ODExfDA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    tags: ['#budgettrip', '#coffee', '#hiddengem'],
    likes: 89,
    helpful: 32,
    replies: [
      {
        id: 'r2',
        user: { name: 'Sarah Martinez', avatar: 'SM' },
        text: 'Been there! The lavender latte is amazing ☕',
        timestamp: '3 hours ago',
      },
      {
        id: 'r3',
        user: { name: 'Mike Johnson', avatar: 'MJ' },
        text: 'Adding this to my list!',
        timestamp: '2 hours ago',
      },
    ],
    timestamp: '2 days ago',
  },
  {
    id: '4',
    user: {
      name: 'David Lee',
      avatar: 'DL',
      isVerified: true,
      role: 'Travel Expert',
    },
    place: 'Grand Hotel',
    category: 'hotels',
    rating: 4,
    text: 'Solid hotel with great location. Rooms are clean and modern. Service was excellent. A bit pricey but worth it for the convenience.',
    images: [
      'https://images.unsplash.com/photo-1729605411476-defbdab14c54?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMGx1eHVyeSUyMHJvb218ZW58MXx8fHwxNzYwMzc0MzI0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    tags: ['#hotel', '#luxury', '#travel'],
    likes: 178,
    helpful: 67,
    replies: [],
    timestamp: '3 days ago',
  },
];

const Reviews = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [reviewsList, setReviewsList] = useState(reviewsData);
  const [expandedReplies, setExpandedReplies] = useState(new Set());

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'food', label: 'Food' },
    { id: 'places', label: 'Places' },
    { id: 'hotels', label: 'Hotels' },
  ];

  const filteredReviews = activeCategory === 'all' 
    ? reviewsList 
    : reviewsList.filter(r => r.category === activeCategory);

  const handleLike = (reviewId) => {
    setReviewsList(reviewsList.map(review => {
      if (review.id === reviewId) {
        return {
          ...review,
          isLiked: !review.isLiked,
          likes: review.isLiked ? review.likes - 1 : review.likes + 1,
        };
      }
      return review;
    }));
  };

  const handleHelpful = (reviewId) => {
    setReviewsList(reviewsList.map(review => {
      if (review.id === reviewId) {
        return {
          ...review,
          isHelpful: !review.isHelpful,
          helpful: review.isHelpful ? review.helpful - 1 : review.helpful + 1,
        };
      }
      return review;
    }));
  };

  const handleSave = (reviewId) => {
    setReviewsList(reviewsList.map(review => {
      if (review.id === reviewId) {
        Alert.alert('Success', review.isSaved ? 'Removed from saved' : 'Review saved!');
        return {
          ...review,
          isSaved: !review.isSaved,
        };
      }
      return review;
    }));
  };

  const toggleReplies = (reviewId) => {
    const newExpanded = new Set(expandedReplies);
    if (newExpanded.has(reviewId)) {
      newExpanded.delete(reviewId);
    } else {
      newExpanded.add(reviewId);
    }
    setExpandedReplies(newExpanded);
  };

  const reviewsNeeded = 2;
  const totalReviews = 3;
  const progress = (totalReviews / (totalReviews + reviewsNeeded)) * 100;

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="border-b border-gray-200">
        <View className="px-4 py-4">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-2xl font-bold">Reviews</Text>
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
              isExpanded={expandedReplies.has(review.id)}
              onLike={() => handleLike(review.id)}
              onHelpful={() => handleHelpful(review.id)}
              onSave={() => handleSave(review.id)}
              onToggleReplies={() => toggleReplies(review.id)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Create Review Modal */}
      {showCreateModal && (
        <CreateReviewModal
          visible={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={(newReview) => {
            setReviewsList([newReview, ...reviewsList]);
            setShowCreateModal(false);
            Alert.alert('Success', 'Review posted! 🎉');
          }}
        />
      )}
    </SafeAreaView>
  );
};

export default Reviews;