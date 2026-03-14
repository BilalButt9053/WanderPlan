import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet } from "react-native";

/**
 * Animated skeleton loading component for WanderPlan
 * Provides shimmer effect while content is loading
 */

// Base skeleton with shimmer animation
export const Skeleton = ({ width, height, borderRadius = 4, style }) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: "#E5E7EB",
          opacity,
        },
        style,
      ]}
    />
  );
};

// Skeleton for business/place cards
export const CardSkeleton = ({ style }) => {
  return (
    <View style={[styles.card, style]}>
      {/* Image placeholder */}
      <Skeleton width="100%" height={150} borderRadius={12} />
      
      {/* Content */}
      <View style={styles.cardContent}>
        {/* Title */}
        <Skeleton width="70%" height={20} borderRadius={4} />
        
        {/* Subtitle/location */}
        <Skeleton width="50%" height={14} borderRadius={4} style={styles.mt8} />
        
        {/* Rating row */}
        <View style={styles.row}>
          <Skeleton width={60} height={14} borderRadius={4} />
          <Skeleton width={80} height={14} borderRadius={4} style={styles.ml12} />
        </View>
      </View>
    </View>
  );
};

// Skeleton for list items (businesses, menu items, etc.)
export const ListItemSkeleton = ({ showImage = true, style }) => {
  return (
    <View style={[styles.listItem, style]}>
      {showImage && (
        <Skeleton width={60} height={60} borderRadius={8} />
      )}
      <View style={[styles.listItemContent, !showImage && { marginLeft: 0 }]}>
        <Skeleton width="80%" height={18} borderRadius={4} />
        <Skeleton width="60%" height={14} borderRadius={4} style={styles.mt6} />
        <Skeleton width="40%" height={12} borderRadius={4} style={styles.mt6} />
      </View>
    </View>
  );
};

// Skeleton for profile screen
export const ProfileSkeleton = () => {
  return (
    <View style={styles.profileContainer}>
      {/* Avatar */}
      <Skeleton width={100} height={100} borderRadius={50} style={styles.centered} />
      
      {/* Name */}
      <Skeleton width={150} height={24} borderRadius={4} style={[styles.centered, styles.mt16]} />
      
      {/* Email */}
      <Skeleton width={200} height={16} borderRadius={4} style={[styles.centered, styles.mt8]} />
      
      {/* Stats row */}
      <View style={[styles.row, styles.mt24, styles.statsRow]}>
        <View style={styles.statItem}>
          <Skeleton width={40} height={24} borderRadius={4} />
          <Skeleton width={60} height={14} borderRadius={4} style={styles.mt4} />
        </View>
        <View style={styles.statItem}>
          <Skeleton width={40} height={24} borderRadius={4} />
          <Skeleton width={60} height={14} borderRadius={4} style={styles.mt4} />
        </View>
        <View style={styles.statItem}>
          <Skeleton width={40} height={24} borderRadius={4} />
          <Skeleton width={60} height={14} borderRadius={4} style={styles.mt4} />
        </View>
      </View>
    </View>
  );
};

// Skeleton for trip cards
export const TripCardSkeleton = ({ style }) => {
  return (
    <View style={[styles.tripCard, style]}>
      {/* Cover image */}
      <Skeleton width="100%" height={180} borderRadius={16} />
      
      {/* Content overlay */}
      <View style={styles.tripCardContent}>
        <Skeleton width="60%" height={22} borderRadius={4} />
        <View style={[styles.row, styles.mt8]}>
          <Skeleton width={80} height={14} borderRadius={4} />
          <Skeleton width={60} height={14} borderRadius={4} style={styles.ml12} />
        </View>
      </View>
    </View>
  );
};

// Skeleton for deal cards (horizontal)
export const DealCardSkeleton = ({ style }) => {
  return (
    <View style={[styles.dealCard, style]}>
      <Skeleton width={100} height={100} borderRadius={12} />
      <View style={styles.dealContent}>
        <Skeleton width="90%" height={16} borderRadius={4} />
        <Skeleton width="70%" height={14} borderRadius={4} style={styles.mt6} />
        <View style={[styles.row, styles.mt8]}>
          <Skeleton width={60} height={20} borderRadius={4} />
          <Skeleton width={50} height={14} borderRadius={4} style={styles.ml8} />
        </View>
      </View>
    </View>
  );
};

// Skeleton for review items
export const ReviewSkeleton = ({ style }) => {
  return (
    <View style={[styles.reviewItem, style]}>
      <View style={styles.row}>
        <Skeleton width={40} height={40} borderRadius={20} />
        <View style={styles.ml12}>
          <Skeleton width={100} height={16} borderRadius={4} />
          <Skeleton width={80} height={12} borderRadius={4} style={styles.mt4} />
        </View>
      </View>
      <Skeleton width="100%" height={14} borderRadius={4} style={styles.mt12} />
      <Skeleton width="80%" height={14} borderRadius={4} style={styles.mt4} />
    </View>
  );
};

// Full page skeleton for loading states
export const PageSkeleton = ({ type = "list", count = 3 }) => {
  const items = Array(count).fill(0);
  
  switch (type) {
    case "cards":
      return (
        <View style={styles.pageContainer}>
          {items.map((_, index) => (
            <CardSkeleton key={index} style={styles.mb16} />
          ))}
        </View>
      );
    case "trips":
      return (
        <View style={styles.pageContainer}>
          {items.map((_, index) => (
            <TripCardSkeleton key={index} style={styles.mb16} />
          ))}
        </View>
      );
    case "deals":
      return (
        <View style={styles.pageContainer}>
          {items.map((_, index) => (
            <DealCardSkeleton key={index} style={styles.mb12} />
          ))}
        </View>
      );
    case "reviews":
      return (
        <View style={styles.pageContainer}>
          {items.map((_, index) => (
            <ReviewSkeleton key={index} style={styles.mb16} />
          ))}
        </View>
      );
    default:
      return (
        <View style={styles.pageContainer}>
          {items.map((_, index) => (
            <ListItemSkeleton key={index} style={styles.mb12} />
          ))}
        </View>
      );
  }
};

const styles = StyleSheet.create({
  // Card skeleton
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    padding: 12,
  },
  
  // List item skeleton
  listItem: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
  },
  listItemContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  
  // Profile skeleton
  profileContainer: {
    padding: 20,
    alignItems: "center",
  },
  centered: {
    alignSelf: "center",
  },
  statsRow: {
    justifyContent: "space-around",
    width: "100%",
  },
  statItem: {
    alignItems: "center",
  },
  
  // Trip card skeleton
  tripCard: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
  tripCardContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  
  // Deal card skeleton
  dealCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dealContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  
  // Review skeleton
  reviewItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
  },
  
  // Page container
  pageContainer: {
    padding: 16,
  },
  
  // Spacing utilities
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  mt4: { marginTop: 4 },
  mt6: { marginTop: 6 },
  mt8: { marginTop: 8 },
  mt12: { marginTop: 12 },
  mt16: { marginTop: 16 },
  mt24: { marginTop: 24 },
  ml8: { marginLeft: 8 },
  ml12: { marginLeft: 12 },
  mb12: { marginBottom: 12 },
  mb16: { marginBottom: 16 },
});

export default Skeleton;
