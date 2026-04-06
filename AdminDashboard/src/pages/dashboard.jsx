import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users, Building2, MessageSquare, DollarSign,
  Trophy, Bell, MapPin, AlertTriangle, Star,
  Clock, XCircle
} from "lucide-react";
import { useGetBusinessStatsQuery } from "@/services/businessApi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { statsService } from "@/services/adminService";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: businessStats } = useGetBusinessStatsQuery();

  const [dashboardData, setDashboardData] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsResponse, activityResponse] = await Promise.all([
          statsService.getDashboardStats(),
          statsService.getRecentActivity(10)
        ]);

        if (statsResponse?.success) {
          setDashboardData(statsResponse.data);
        }

        if (activityResponse?.success) {
          setRecentActivity(activityResponse.data || []);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const overview = dashboardData?.overview || {};
  const alerts = dashboardData?.alerts || {};

  const statsCards = [
    {
      label: "Total Users",
      value: loading ? "..." : (overview.totalUsers || 0).toLocaleString(),
      subtext: `${overview.activeUsersToday || 0} active today`,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-50"
    },
    {
      label: "Businesses",
      value: loading ? "..." : (overview.totalBusinesses || 0).toLocaleString(),
      subtext: `${overview.approvedBusinesses || 0} approved`,
      icon: Building2,
      color: "text-green-500",
      bgColor: "bg-green-50"
    },
    {
      label: "Total Trips",
      value: loading ? "..." : (overview.totalTrips || 0).toLocaleString(),
      subtext: `${overview.completedTrips || 0} completed`,
      icon: MapPin,
      color: "text-purple-500",
      bgColor: "bg-purple-50"
    },
    {
      label: "Reviews",
      value: loading ? "..." : (overview.totalReviews || 0).toLocaleString(),
      subtext: `${overview.flaggedReviews || 0} flagged`,
      icon: MessageSquare,
      color: "text-yellow-500",
      bgColor: "bg-yellow-50"
    },
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'user_registered': return <Users className="h-4 w-4 text-blue-500" />;
      case 'business_registered': return <Building2 className="h-4 w-4 text-orange-500" />;
      case 'business_status_changed': return <Building2 className="h-4 w-4 text-green-500" />;
      case 'trip_created': return <MapPin className="h-4 w-4 text-purple-500" />;
      case 'review_posted': return <Star className="h-4 w-4 text-yellow-500" />;
      case 'complaint_submitted': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = Math.floor((now - time) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your admin panel statistics.</p>
      </div>

      {/* Alert Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {(alerts.pendingBusinessApprovals > 0 || businessStats?.pending > 0) && (
          <Card className="border-orange-500 bg-orange-50 dark:bg-orange-950/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-orange-100">
                    <Building2 className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-orange-900 dark:text-orange-100">
                      {alerts.pendingBusinessApprovals || businessStats?.pending || 0} Pending Businesses
                    </p>
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      Awaiting approval
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => navigate('/businesses')}
                  size="sm"
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  Review
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {alerts.flaggedReviewsCount > 0 && (
          <Card className="border-red-500 bg-red-50 dark:bg-red-950/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-red-100">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-red-900 dark:text-red-100">
                      {alerts.flaggedReviewsCount} Flagged Reviews
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      Need moderation
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => navigate('/reviews')}
                  size="sm"
                  className="bg-red-500 hover:bg-red-600"
                >
                  Review
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {alerts.pendingComplaintsCount > 0 && (
          <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-yellow-100">
                    <MessageSquare className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-yellow-900 dark:text-yellow-100">
                      {alerts.pendingComplaintsCount} Pending Complaints
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Awaiting response
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => navigate('/reports')}
                  size="sm"
                  className="bg-yellow-500 hover:bg-yellow-600"
                >
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.subtext}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats & Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Activity */}
        <Card className="col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/analytics')}>
              View All
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-4 animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-gray-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No recent activity
              </p>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="p-2 rounded-full bg-gray-100">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-none">
                        {activity.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimeAgo(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                onClick={() => navigate('/businesses')}
              >
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span className="text-sm">Pending Businesses</span>
                </div>
                <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                  {overview.pendingBusinesses || businessStats?.pending || 0}
                </Badge>
              </div>

              <div
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                onClick={() => navigate('/reviews')}
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-sm">Flagged Reviews</span>
                </div>
                <Badge variant="secondary" className="bg-red-100 text-red-700">
                  {overview.flaggedReviews || 0}
                </Badge>
              </div>

              <div
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                onClick={() => navigate('/reports')}
              >
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Pending Complaints</span>
                </div>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                  {overview.pendingComplaints || 0}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Ongoing Trips</span>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  {overview.ongoingTrips || 0}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Active Deals</span>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  {overview.activeDeals || 0}
                </Badge>
              </div>

              <div
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                onClick={() => navigate('/gamification')}
              >
                <div className="flex items-center gap-3">
                  <Trophy className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">Total Rewards</span>
                </div>
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                  {overview.totalRewards || 0}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-700">
              <XCircle className="h-5 w-5" />
              <p>Error loading dashboard data: {error}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
