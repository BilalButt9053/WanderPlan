import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, MessageSquare, TrendingUp, DollarSign, Trophy, Bell, ArrowRight } from "lucide-react";
import { useGetBusinessStatsQuery } from "@/services/businessApi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { usersService, businessesService, reviewsService } from "@/services/adminService";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: businessStats } = useGetBusinessStatsQuery();
  const hasPendingBusinesses = businessStats?.pending > 0;

  const [stats, setStats] = useState({
    totalUsers: 0,
    businesses: 0,
    reviews: 0,
    activeDeals: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [users, businesses, reviews] = await Promise.all([
          usersService.getUsers(),
          businessesService.getBusinesses(),
          reviewsService.getReviews({ limit: 1000 }),
        ]);

        setStats({
          totalUsers: users?.length || 0,
          businesses: businesses?.count || 0,
          reviews: reviews?.items?.length || 0,
          activeDeals: businessStats?.byStatus?.approved || 0,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [businessStats]);

  const statsCards = [
    { 
      label: "Total Users", 
      value: loading ? "..." : stats.totalUsers.toLocaleString(),
      change: "+12.5%",
      icon: Users,
      color: "text-blue-500"
    },
    { 
      label: "Businesses", 
      value: loading ? "..." : stats.businesses.toLocaleString(),
      change: "+8.2%",
      icon: Building2,
      color: "text-green-500"
    },
    { 
      label: "Reviews", 
      value: loading ? "..." : stats.reviews.toLocaleString(),
      change: "+15.3%",
      icon: MessageSquare,
      color: "text-purple-500"
    },
    { 
      label: "Active Deals", 
      value: loading ? "..." : stats.activeDeals.toLocaleString(),
      change: "+5.1%",
      icon: DollarSign,
      color: "text-yellow-500"
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your admin panel statistics.</p>
      </div>

      {/* Pending Business Alert */}
      {hasPendingBusinesses && (
        <Card className="border-orange-500 bg-orange-50 dark:bg-orange-950/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-orange-500 animate-pulse" />
                <div>
                  <p className="font-semibold text-orange-900 dark:text-orange-100">
                    {businessStats.pending} {businessStats.pending === 1 ? 'Business' : 'Businesses'} Pending Approval
                  </p>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    New business applications are waiting for your review
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => navigate('/businesses')}
                variant="default"
                className="bg-orange-500 hover:bg-orange-600"
              >
                Review Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">{stat.change}</span> from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">New user registered</p>
                  <p className="text-sm text-muted-foreground">Sarah Johnson joined 5 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">Business verified</p>
                  <p className="text-sm text-muted-foreground">Ocean View Resort was verified</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">New review posted</p>
                  <p className="text-sm text-muted-foreground">Mike Chen reviewed Sunset Cafe</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Pending Reviews</span>
                <span className="text-sm font-bold">23</span>
              </div>
              <div className="flex items-center justify-between cursor-pointer hover:bg-muted p-2 rounded transition-colors" onClick={() => navigate('/businesses')}>
                <span className="text-sm">Pending Businesses</span>
                <Badge variant="secondary" className="bg-orange-500 text-white">
                  {businessStats?.pending || 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Active Challenges</span>
                <span className="text-sm font-bold">8</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Reports to Review</span>
                <span className="text-sm font-bold">5</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
