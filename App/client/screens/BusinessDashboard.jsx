import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {
  LineChart,
  Grid,
  YAxis,
  BarChart
} from 'react-native-svg-charts';
import * as shape from 'd3-shape';

export default function BusinessDashboard({
  onCreatePromotion,
  onManageAds,
  onViewReviews,
  onViewAnalytics
}) {
  const performanceData = [
    { date: 'Mon', impressions: 245, clicks: 42 },
    { date: 'Tue', impressions: 312, clicks: 58 },
    { date: 'Wed', impressions: 289, clicks: 51 },
    { date: 'Thu', impressions: 401, clicks: 73 },
    { date: 'Fri', impressions: 456, clicks: 89 },
    { date: 'Sat', impressions: 523, clicks: 102 },
    { date: 'Sun', impressions: 489, clicks: 94 },
  ];

  const ratingTrend = [
    { month: 'Jan', rating: 4.2 },
    { month: 'Feb', rating: 4.3 },
    { month: 'Mar', rating: 4.5 },
    { month: 'Apr', rating: 4.6 },
    { month: 'May', rating: 4.7 },
    { month: 'Jun', rating: 4.8 },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Business Dashboard</Text>
          <Text style={styles.headerSubtitle}>La Bella Cucina</Text>
        </View>
        <TouchableOpacity style={styles.headerBtn}>
          <Feather name="settings" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionBtn} onPress={onCreatePromotion}>
          <Feather name="plus" size={22} color="#fff" />
          <Text style={styles.actionText}>Create Promotion</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={onViewAnalytics}>
          <Feather name="bar-chart-2" size={22} color="#fff" />
          <Text style={styles.actionText}>View Analytics</Text>
        </TouchableOpacity>
      </View>

      {/* Metrics Overview */}
      <View style={styles.metricsGrid}>
        {[
          { icon: 'eye', label: 'Impressions', value: '3,245', change: '+12.5%' },
          { icon: 'mouse-pointer', label: 'Clicks', value: '509', change: '+8.3%' },
          { icon: 'star', label: 'Avg Rating', value: '4.8', change: '+0.2' },
          { icon: 'message-square', label: 'Reviews', value: '124', change: '+15' },
        ].map((item, index) => (
          <View key={index} style={styles.metricCard}>
            <Feather name={item.icon} size={22} color="#007bff" />
            <Text style={styles.metricValue}>{item.value}</Text>
            <Text style={styles.metricLabel}>{item.label}</Text>
            <Text style={styles.metricChange}>{item.change}</Text>
          </View>
        ))}
      </View>

      {/* Account Balance */}
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>Account Balance</Text>
          <Text style={styles.badge}>Active</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.balance}>$847.50</Text>
          <Text style={styles.balanceSub}>available</Text>
        </View>
        <Text style={styles.subText}>Next payout: $250.00 on Dec 1, 2024</Text>

        <View style={styles.rowBetween}>
          <View>
            <Text style={styles.subText}>Total Earnings</Text>
            <Text style={styles.valueText}>$2,450.00</Text>
          </View>
          <View>
            <Text style={styles.subText}>Ad Spend</Text>
            <Text style={styles.valueText}>$850.00</Text>
          </View>
        </View>
      </View>

      {/* Weekly Performance */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Weekly Performance</Text>
        <View style={styles.chartRow}>
          <YAxis
            data={performanceData.map(d => d.impressions)}
            contentInset={{ top: 20, bottom: 20 }}
            svg={{ fill: 'grey', fontSize: 10 }}
            numberOfTicks={5}
          />
          <LineChart
            style={{ height: 200, flex: 1, marginLeft: 10 }}
            data={performanceData.map(d => d.impressions)}
            svg={{ stroke: '#2F80ED' }}
            contentInset={{ top: 20, bottom: 20 }}
            curve={shape.curveNatural}
          >
            <Grid />
          </LineChart>
        </View>
      </View>

      {/* Rating Trend */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Rating Trend</Text>
        <BarChart
          style={{ height: 200, marginTop: 10 }}
          data={ratingTrend.map(r => r.rating)}
          svg={{ fill: '#27AE60' }}
          contentInset={{ top: 20, bottom: 20 }}
          spacingInner={0.4}
        >
          <Grid />
        </BarChart>
      </View>

      {/* Quick Links */}
      <TouchableOpacity style={styles.cardRow} onPress={onManageAds}>
        <Feather name="trending-up" size={24} color="#007bff" />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.sectionTitle}>Manage Promotions</Text>
          <Text style={styles.subText}>3 active campaigns</Text>
        </View>
        <Text style={styles.arrow}>→</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cardRow} onPress={onViewReviews}>
        <Feather name="message-square" size={24} color="#27AE60" />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.sectionTitle}>Customer Reviews</Text>
          <Text style={styles.subText}>5 new this week</Text>
        </View>
        <Text style={styles.arrow}>→</Text>
      </TouchableOpacity>

      {/* Recent Activity */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {[
          { text: 'New review received from Sarah M.', time: '2 hours ago' },
          { text: 'Promotion "Summer Special" reached 1000 views', time: '5 hours ago' },
          { text: 'New booking inquiry received', time: '1 day ago' },
          { text: 'Payment of $250.00 processed', time: '2 days ago' },
        ].map((item, i) => (
          <View key={i} style={styles.activityItem}>
            <View style={styles.dot} />
            <View>
              <Text style={styles.activityText}>{item.text}</Text>
              <Text style={styles.subText}>{item.time}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f8fa' },
  header: {
    backgroundColor: '#1E293B',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  headerSubtitle: { color: '#cbd5e1' },
  headerBtn: {
    width: 40,
    height: 40,
    backgroundColor: '#334155',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 16,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  actionText: { color: '#fff', fontSize: 14, marginTop: 6 },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: 12,
  },
  metricCard: {
    backgroundColor: '#fff',
    width: '47%',
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
    marginVertical: 6,
    elevation: 2,
  },
  metricValue: { fontSize: 20, fontWeight: 'bold', marginTop: 6 },
  metricLabel: { color: '#64748b', fontSize: 13 },
  metricChange: { color: '#16a34a', fontSize: 12, marginTop: 4 },
  card: {
    backgroundColor: '#fff',
    margin: 12,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    fontSize: 12,
  },
  balance: { fontSize: 28, fontWeight: 'bold' },
  balanceSub: { color: '#64748b', marginLeft: 8, marginTop: 4 },
  subText: { color: '#64748b', fontSize: 13 },
  valueText: { fontSize: 16, fontWeight: '600', marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  chartRow: { flexDirection: 'row', height: 200, marginTop: 10 },
  cardRow: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    marginBottom: 10,
  },
  arrow: { fontSize: 20, color: '#64748b' },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3b82f6',
    marginRight: 8,
    marginTop: 6,
  },
  activityText: { fontSize: 14, color: '#111827' },
});
