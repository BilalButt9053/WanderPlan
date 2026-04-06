import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  XCircle,
  Flag,
  Eye,
  Star,
  AlertTriangle,
  RefreshCw,
  Trash2,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { adminReviewsService } from "@/services/adminService"
import { useToast } from "@/components/ui/use-toast"

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRating, setFilterRating] = useState('all');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
  const [selectedReview, setSelectedReview] = useState(null);
  const [actionDialog, setActionDialog] = useState({ open: false, action: null, reason: '' });
  const { toast } = useToast();

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchQuery || undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined,
      };

      if (filterRating !== 'all') {
        params.minRating = parseInt(filterRating);
        params.maxRating = parseInt(filterRating);
      }

      const response = await adminReviewsService.getReviews(params);

      if (response?.success) {
        setReviews(response.data?.reviews || []);
        setPagination(prev => ({
          ...prev,
          total: response.data?.pagination?.total || 0,
          pages: response.data?.pagination?.pages || 1,
        }));
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast({
        title: "Error",
        description: "Failed to fetch reviews",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await adminReviewsService.getReviewStats();
      if (response?.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching review stats:', error);
    }
  };

  useEffect(() => {
    fetchReviews();
    fetchStats();
  }, [pagination.page, filterStatus, filterRating]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (pagination.page === 1) {
        fetchReviews();
      } else {
        setPagination(prev => ({ ...prev, page: 1 }));
      }
    }, 500);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleStatusChange = async (reviewId, status, reason = '') => {
    try {
      await adminReviewsService.updateReviewStatus(reviewId, status, reason);
      toast({
        title: "Success",
        description: `Review marked as ${status}`,
      });
      fetchReviews();
      fetchStats();
      setActionDialog({ open: false, action: null, reason: '' });
    } catch (error) {
      console.error('Error updating review status:', error);
      toast({
        title: "Error",
        description: "Failed to update review status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteReview = async (id) => {
    if (!confirm('Are you sure you want to permanently delete this review?')) return;

    try {
      await adminReviewsService.deleteReview(id);
      toast({
        title: "Success",
        description: "Review deleted successfully",
      });
      fetchReviews();
      fetchStats();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast({
        title: "Error",
        description: "Failed to delete review",
        variant: "destructive",
      });
    }
  };

  const openActionDialog = (review, action) => {
    setSelectedReview(review);
    setActionDialog({ open: true, action, reason: '' });
  };

  const statsCards = [
    { label: "Total Reviews", value: stats?.totalReviews?.toLocaleString() || '0', color: "text-blue-500" },
    { label: "Active", value: stats?.activeReviews?.toLocaleString() || '0', color: "text-green-500" },
    { label: "Flagged", value: stats?.flaggedReviews?.toLocaleString() || '0', color: "text-red-500" },
    { label: "Avg Rating", value: stats?.averageRating || '0', color: "text-yellow-500" },
  ];

  const getStatusBadge = (status, flags) => {
    if (status === 'removed') return <Badge variant="destructive">Removed</Badge>;
    if (status === 'flagged' || flags?.length > 0) return <Badge variant="destructive">Flagged</Badge>;
    return <Badge variant="default" className="bg-green-500">Active</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Reviews Moderation
          </h1>
          <p className="text-muted-foreground">
            Review and moderate user-generated content.
          </p>
        </div>
        <Button onClick={() => { fetchReviews(); fetchStats(); }} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {statsCards.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle>Review Feed ({pagination.total} total)</CardTitle>

            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search reviews..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-40">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="flagged">Flagged</SelectItem>
                  <SelectItem value="removed">Removed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterRating} onValueChange={setFilterRating}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse rounded-lg border p-4">
                  <div className="flex gap-4">
                    <div className="h-10 w-10 rounded-full bg-gray-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                      <div className="h-3 bg-gray-200 rounded w-3/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No reviews found
            </div>
          ) : (
            reviews.map((review) => (
              <div
                key={review._id}
                className={`flex items-start gap-4 rounded-lg border p-4 ${
                  review.status === 'flagged' || review.flags?.length > 0
                    ? 'border-red-200 bg-red-50 dark:bg-red-950/10'
                    : ''
                }`}
              >
                <Avatar>
                  <AvatarFallback>
                    {review.user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{review.user?.name || "Anonymous"}</span>
                        {getStatusBadge(review.status, review.flags)}
                        {review.flags?.length > 0 && (
                          <span className="text-xs text-red-500 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            {review.flags.length} report{review.flags.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {review.place} • {review.category} • {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedReview(review)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {review.status !== 'active' && (
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(review._id, 'active')}
                            className="text-green-600"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark Active
                          </DropdownMenuItem>
                        )}
                        {review.status !== 'flagged' && (
                          <DropdownMenuItem
                            onClick={() => openActionDialog(review, 'flag')}
                            className="text-yellow-600"
                          >
                            <Flag className="mr-2 h-4 w-4" />
                            Flag Review
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => openActionDialog(review, 'remove')}
                          className="text-red-600"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Remove Review
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteReview(review._id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Permanently
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating
                            ? "fill-yellow-500 text-yellow-500"
                            : "text-muted"
                        }`}
                      />
                    ))}
                  </div>

                  <p className="text-sm">{review.text}</p>

                  {review.businessReply?.text && (
                    <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <p className="text-xs text-blue-600 font-medium mb-1">Business Reply</p>
                      <p className="text-sm">{review.businessReply.text}</p>
                    </div>
                  )}

                  {review.tags && review.tags.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {review.tags.map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>👍 {review.likes || review.likedBy?.length || 0} likes</span>
                    <span>✓ {review.helpful || review.helpfulBy?.length || 0} helpful</span>
                    {review.replies?.length > 0 && <span>💬 {review.replies.length} replies</span>}
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === pagination.pages}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={actionDialog.open} onOpenChange={(open) => setActionDialog({ ...actionDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog.action === 'flag' ? 'Flag Review' : 'Remove Review'}
            </DialogTitle>
            <DialogDescription>
              {actionDialog.action === 'flag'
                ? 'This will flag the review for further investigation.'
                : 'This will hide the review from public view.'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter reason for this action (optional)..."
              value={actionDialog.reason}
              onChange={(e) => setActionDialog({ ...actionDialog, reason: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog({ open: false, action: null, reason: '' })}>
              Cancel
            </Button>
            <Button
              variant={actionDialog.action === 'flag' ? 'default' : 'destructive'}
              onClick={() => handleStatusChange(
                selectedReview?._id,
                actionDialog.action === 'flag' ? 'flagged' : 'removed',
                actionDialog.reason
              )}
            >
              {actionDialog.action === 'flag' ? 'Flag Review' : 'Remove Review'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
