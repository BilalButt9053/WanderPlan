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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  XCircle,
  Flag,
  Eye,
  Star,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { reviewsService } from "@/services/adminService"
import { useToast } from "@/components/ui/use-toast"

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRating, setFilterRating] = useState('all');
  const { toast } = useToast();

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await reviewsService.getReviews({ limit: 100 });
      setReviews(data?.items || []);
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

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDeleteReview = async (id) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    
    try {
      await reviewsService.deleteReview(id);
      toast({
        title: "Success",
        description: "Review deleted successfully",
      });
      fetchReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast({
        title: "Error",
        description: "Failed to delete review",
        variant: "destructive",
      });
    }
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.place?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         review.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.text?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'flagged' && (review.status === 'flagged' || review.flags?.length > 0)) ||
                         (filterStatus === 'active' && review.status === 'active');
    const matchesRating = filterRating === 'all' || review.rating === parseInt(filterRating);
    return matchesSearch && matchesStatus && matchesRating;
  });

  const stats = [
    { label: "Total Reviews", value: reviews.length.toLocaleString() },
    { label: "Pending Approval", value: "0" },
    { label: "Flagged Content", value: reviews.filter(r => r.status === 'flagged' || r.flags?.length > 0).length.toLocaleString() },
    { label: "Active Reviews", value: reviews.filter(r => r.status === 'active').length.toLocaleString() },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Reviews & Content Moderation
        </h1>
        <p className="text-muted-foreground">
          Review and moderate user-generated content.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle>Review Feed</CardTitle>

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
            <div className="text-center py-8">Loading reviews...</div>
          ) : filteredReviews.length === 0 ? (
            <div className="text-center py-8">No reviews found</div>
          ) : (
            filteredReviews.map((review) => (
              <div
                key={review._id}
                className="flex items-start gap-4 rounded-lg border p-4"
              >
                <Avatar>
                  <AvatarFallback>{review.user?.avatar || review.user?.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{review.user?.name || "Anonymous"}</span>
                        <Badge
                          variant={
                            review.status === "active"
                              ? "default"
                              : review.status === "flagged" || review.flags?.length > 0
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {review.flags?.length > 0 ? "Flagged" : review.status}
                        </Badge>
                        {review.flags?.length > 0 && (
                          <span className="text-xs text-muted-foreground">
                            ({review.flags.length} report{review.flags.length !== 1 ? 's' : ''})
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
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleDeleteReview(review._id)}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Remove
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
                    <span>👍 {review.likes || 0} likes</span>
                    <span>✓ {review.helpful || 0} helpful</span>
                    {review.replies && <span>💬 {review.replies.length} replies</span>}
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
