import React, { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Trophy, Award, Star, Zap, Target, Crown,
  Gift, Users, RefreshCw, Plus, Search
} from "lucide-react"
import { rewardsService, statsService, usersService } from "@/services/adminService"
import { useToast } from "@/components/ui/use-toast"

export default function GamificationPage() {
  const [config, setConfig] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [rewardStats, setRewardStats] = useState(null);
  const [recentRewards, setRecentRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [awardDialog, setAwardDialog] = useState({ open: false, type: null });
  const [selectedUser, setSelectedUser] = useState(null);
  const [userSearch, setUserSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [awardForm, setAwardForm] = useState({ points: 100, badge: '', reason: '' });
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [configRes, leaderboardRes, statsRes] = await Promise.all([
        rewardsService.getGamificationConfig(),
        statsService.getLeaderboard(10),
        rewardsService.getRewardStats()
      ]);

      if (configRes?.success) setConfig(configRes.data);
      if (leaderboardRes?.success) setLeaderboard(leaderboardRes.data || []);
      if (statsRes?.success) {
        setRewardStats(statsRes.data);
        setRecentRewards(statsRes.data?.recentRewards || []);
      }
    } catch (error) {
      console.error('Error fetching gamification data:', error);
      toast({
        title: "Error",
        description: "Failed to load gamification data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const searchUsers = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const response = await usersService.getUsersList({ search: query, limit: 5 });
      if (response?.success) {
        setSearchResults(response.data?.users || []);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => searchUsers(userSearch), 300);
    return () => clearTimeout(debounce);
  }, [userSearch]);

  const handleAwardPoints = async () => {
    if (!selectedUser || !awardForm.points) {
      toast({ title: "Error", description: "Please select a user and enter points", variant: "destructive" });
      return;
    }
    try {
      await rewardsService.awardPoints(selectedUser._id, awardForm.points, awardForm.reason);
      toast({ title: "Success", description: `${awardForm.points} points awarded to ${selectedUser.fullName}` });
      setAwardDialog({ open: false, type: null });
      setSelectedUser(null);
      setAwardForm({ points: 100, badge: '', reason: '' });
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to award points", variant: "destructive" });
    }
  };

  const handleAwardBadge = async () => {
    if (!selectedUser || !awardForm.badge) {
      toast({ title: "Error", description: "Please select a user and badge", variant: "destructive" });
      return;
    }
    const badge = config?.availableBadges?.find(b => b.name === awardForm.badge);
    if (!badge) return;

    try {
      await rewardsService.awardBadge(selectedUser._id, badge, awardForm.reason);
      toast({ title: "Success", description: `"${badge.name}" badge awarded to ${selectedUser.fullName}` });
      setAwardDialog({ open: false, type: null });
      setSelectedUser(null);
      setAwardForm({ points: 100, badge: '', reason: '' });
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: error?.response?.data?.message || "Failed to award badge", variant: "destructive" });
    }
  };

  const getLevelIcon = (level) => {
    switch (level) {
      case 'legend': return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'expert': return <Award className="h-4 w-4 text-purple-500" />;
      case 'advanced': return <Zap className="h-4 w-4 text-green-500" />;
      case 'intermediate': return <Target className="h-4 w-4 text-blue-500" />;
      default: return <Star className="h-4 w-4 text-gray-500" />;
    }
  };

  const levelThresholds = config?.levelThresholds || {
    beginner: 0,
    intermediate: 500,
    advanced: 1000,
    expert: 2000,
    legend: 5000
  };

  const pointsSettings = [
    { label: "Points per Review", value: config?.pointsPerReview || 10 },
    { label: "Points per Trip", value: config?.pointsPerTrip || 50 },
    { label: "Points per Like", value: config?.pointsPerLike || 1 },
    { label: "Points per Helpful", value: config?.pointsPerHelpful || 2 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gamification Management</h1>
          <p className="text-muted-foreground">
            Manage rewards, leaderboard, and gamification settings.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => setAwardDialog({ open: true, type: 'points' })}>
            <Plus className="mr-2 h-4 w-4" />
            Award Points
          </Button>
          <Button variant="secondary" onClick={() => setAwardDialog({ open: true, type: 'badge' })}>
            <Award className="mr-2 h-4 w-4" />
            Award Badge
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Rewards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {rewardStats?.totalRewards?.toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Used Rewards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {rewardStats?.usedRewards?.toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unused Rewards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {rewardStats?.unusedRewards?.toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Leaderboard Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {leaderboard.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Top Contributors
            </CardTitle>
            <CardDescription>Users with the most points</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-gray-200" />
                    <div className="flex-1 h-4 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            ) : leaderboard.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No leaderboard data</p>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((user, index) => (
                  <div key={user._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      index === 0 ? 'bg-yellow-100 text-yellow-700' :
                      index === 1 ? 'bg-gray-100 text-gray-700' :
                      index === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-50 text-blue-700'
                    }`}>
                      {user.rank}
                    </div>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{user.fullName?.charAt(0) || '?'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{user.fullName}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        {getLevelIcon(user.level)}
                        <span className="capitalize">{user.level}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{user.points?.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">points</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Badges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-500" />
              Available Badges
            </CardTitle>
            <CardDescription>Badges that can be awarded to users</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : !config?.availableBadges?.length ? (
              <p className="text-center text-muted-foreground py-8">No badges configured</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {config.availableBadges.map((badge) => (
                  <div key={badge.name} className="p-3 rounded-lg border hover:border-primary transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{badge.icon}</span>
                      <p className="font-medium text-sm">{badge.name}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{badge.description}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Level Thresholds & Points Settings */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Level Thresholds</CardTitle>
            <CardDescription>Points required for each level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(levelThresholds).map(([level, points]) => (
                <div key={level} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    {getLevelIcon(level)}
                    <span className="font-medium capitalize">{level}</span>
                  </div>
                  <Badge variant="outline">{points.toLocaleString()}+ points</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Points Configuration</CardTitle>
            <CardDescription>How users earn points</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pointsSettings.map((setting) => (
                <div key={setting.label} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm">{setting.label}</span>
                  <Badge className="bg-primary">{setting.value} pts</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Rewards */}
      {recentRewards.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-green-500" />
              Recent Rewards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentRewards.slice(0, 5).map((reward) => (
                <div key={reward._id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{reward.user?.fullName?.charAt(0) || '?'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{reward.user?.fullName || 'Unknown User'}</p>
                      <p className="text-sm text-muted-foreground">{reward.title}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={reward.isUsed ? 'secondary' : 'default'}>
                      {reward.isUsed ? 'Used' : 'Active'}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(reward.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Award Dialog */}
      <Dialog open={awardDialog.open} onOpenChange={(open) => setAwardDialog({ ...awardDialog, open })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {awardDialog.type === 'points' ? 'Award Points' : 'Award Badge'}
            </DialogTitle>
            <DialogDescription>
              {awardDialog.type === 'points'
                ? 'Award bonus points to a user'
                : 'Award a badge to a user'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* User Search */}
            <div className="space-y-2">
              <Label>Select User</Label>
              {selectedUser ? (
                <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{selectedUser.fullName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedUser.fullName}</p>
                      <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)}>
                    Change
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      className="pl-10"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                    />
                  </div>
                  {searchResults.length > 0 && (
                    <div className="border rounded-lg max-h-40 overflow-y-auto">
                      {searchResults.map((user) => (
                        <div
                          key={user._id}
                          className="flex items-center gap-2 p-2 hover:bg-muted cursor-pointer"
                          onClick={() => {
                            setSelectedUser(user);
                            setUserSearch('');
                            setSearchResults([]);
                          }}
                        >
                          <Avatar className="h-6 w-6">
                            <AvatarFallback>{user.fullName?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{user.fullName}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {awardDialog.type === 'points' ? (
              <div className="space-y-2">
                <Label>Points to Award</Label>
                <Input
                  type="number"
                  value={awardForm.points}
                  onChange={(e) => setAwardForm({ ...awardForm, points: parseInt(e.target.value) || 0 })}
                  min={1}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Select Badge</Label>
                <Select
                  value={awardForm.badge}
                  onValueChange={(value) => setAwardForm({ ...awardForm, badge: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a badge" />
                  </SelectTrigger>
                  <SelectContent>
                    {config?.availableBadges?.map((badge) => (
                      <SelectItem key={badge.name} value={badge.name}>
                        <span className="flex items-center gap-2">
                          <span>{badge.icon}</span>
                          <span>{badge.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Reason (optional)</Label>
              <Textarea
                placeholder="Why are you awarding this?"
                value={awardForm.reason}
                onChange={(e) => setAwardForm({ ...awardForm, reason: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setAwardDialog({ open: false, type: null });
              setSelectedUser(null);
              setAwardForm({ points: 100, badge: '', reason: '' });
            }}>
              Cancel
            </Button>
            <Button onClick={awardDialog.type === 'points' ? handleAwardPoints : handleAwardBadge}>
              {awardDialog.type === 'points' ? 'Award Points' : 'Award Badge'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
