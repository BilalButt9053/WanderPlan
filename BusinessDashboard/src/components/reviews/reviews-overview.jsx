import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Star,
  Search,
  Loader2,
  MessageCircle,
  Reply,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import {
  useGetBusinessReviewsQuery,
  useGetReviewStatsQuery,
  useReplyToReviewMutation,
  useUpdateReviewReplyMutation,
  useDeleteReviewReplyMutation,
} from '@/redux/api/businessApi'
import { toast } from 'sonner'

export function ReviewsOverview() {
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [ratingFilter, setRatingFilter] = useState('all')
  const [replyFilter, setReplyFilter] = useState('all')
  const [replyDialog, setReplyDialog] = useState({ open: false, review: null, isEdit: false })
  const [replyText, setReplyText] = useState('')
  const [deleteDialog, setDeleteDialog] = useState({ open: false, reviewId: null })

  const { data: reviewsData, isLoading, refetch } = useGetBusinessReviewsQuery({
    page,
    limit: 10,
    rating: ratingFilter !== 'all' ? ratingFilter : undefined,
    hasReply: replyFilter === 'replied' ? true : replyFilter === 'unreplied' ? false : undefined,
    search: searchQuery || undefined,
  })

  const { data: statsData } = useGetReviewStatsQuery()
  const [replyToReview, { isLoading: isReplying }] = useReplyToReviewMutation()
  const [updateReply, { isLoading: isUpdating }] = useUpdateReviewReplyMutation()
  const [deleteReply, { isLoading: isDeleting }] = useDeleteReviewReplyMutation()

  const reviews = reviewsData?.data?.reviews || []
  const pagination = reviewsData?.data?.pagination || {}
  const stats = statsData?.data || {}

  const formatTimeAgo = (timestamp) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diff = Math.floor((now - time) / 1000)

    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`
    return new Date(timestamp).toLocaleDateString()
  }

  const handleOpenReplyDialog = (review, isEdit = false) => {
    setReplyDialog({ open: true, review, isEdit })
    setReplyText(isEdit ? review.businessReply?.text || '' : '')
  }

  const handleSubmitReply = async () => {
    if (!replyText.trim()) {
      toast.error('Please enter a reply')
      return
    }

    try {
      if (replyDialog.isEdit) {
        await updateReply({ id: replyDialog.review._id, text: replyText }).unwrap()
        toast.success('Reply updated successfully')
      } else {
        await replyToReview({ id: replyDialog.review._id, text: replyText }).unwrap()
        toast.success('Reply posted successfully')
      }
      setReplyDialog({ open: false, review: null, isEdit: false })
      setReplyText('')
      refetch()
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to submit reply')
    }
  }

  const handleDeleteReply = async () => {
    try {
      await deleteReply(deleteDialog.reviewId).unwrap()
      toast.success('Reply deleted successfully')
      setDeleteDialog({ open: false, reviewId: null })
      refetch()
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to delete reply')
    }
  }

  const renderStars = (rating) => (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'
          }`}
        />
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Reviews</p>
              <p className="text-2xl font-bold">{stats.totalReviews || 0}</p>
            </div>
            <MessageCircle className="h-8 w-8 text-primary/20" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Average Rating</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">{(stats.averageRating || 0).toFixed(1)}</p>
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              </div>
            </div>
            {stats.ratingTrend >= 0 ? (
              <TrendingUp className="h-8 w-8 text-green-500/40" />
            ) : (
              <TrendingDown className="h-8 w-8 text-red-500/40" />
            )}
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Replied</p>
              <p className="text-2xl font-bold">{stats.repliedCount || 0}</p>
            </div>
            <Reply className="h-8 w-8 text-green-500/20" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending Reply</p>
              <p className="text-2xl font-bold">{stats.pendingReplyCount || 0}</p>
            </div>
            <Badge variant="secondary" className="bg-orange-100 text-orange-700">
              Action needed
            </Badge>
          </div>
        </Card>
      </div>

      {/* Rating Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Rating Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.ratingDistribution?.[rating] || 0
              const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0
              return (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-16">
                    <span className="text-sm">{rating}</span>
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  </div>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-12">{count}</span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-[150px]">
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
            <Select value={replyFilter} onValueChange={setReplyFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Reply Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reviews</SelectItem>
                <SelectItem value="replied">Replied</SelectItem>
                <SelectItem value="unreplied">Not Replied</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <CardTitle>Reviews ({pagination.total || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No reviews found</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review._id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={review.user?.profilePhoto} />
                        <AvatarFallback>
                          {review.user?.fullName?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {review.user?.fullName || 'Anonymous User'}
                          </span>
                          {review.businessReply && (
                            <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                              Replied
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {renderStars(review.rating)}
                          <span className="text-sm text-muted-foreground">
                            {formatTimeAgo(review.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 text-sm">{review.comment}</p>

                  {review.images?.length > 0 && (
                    <div className="flex gap-2 mt-3">
                      {review.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`Review image ${idx + 1}`}
                          className="w-20 h-20 object-cover rounded"
                        />
                      ))}
                    </div>
                  )}

                  {/* Business Reply */}
                  {review.businessReply?.text ? (
                    <div className="mt-4 ml-4 p-3 bg-muted rounded-lg border-l-2 border-primary">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Your Reply</span>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenReplyDialog(review, true)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteDialog({ open: true, reviewId: review._id })}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{review.businessReply.text}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatTimeAgo(review.businessReply.repliedAt)}
                        {review.businessReply.updatedAt !== review.businessReply.repliedAt && ' (edited)'}
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenReplyDialog(review, false)}
                      >
                        <Reply className="h-4 w-4 mr-2" />
                        Reply to Review
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.pages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reply Dialog */}
      <Dialog open={replyDialog.open} onOpenChange={(open) => !open && setReplyDialog({ open: false, review: null, isEdit: false })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{replyDialog.isEdit ? 'Edit Reply' : 'Reply to Review'}</DialogTitle>
            <DialogDescription>
              {replyDialog.review && (
                <div className="mt-2 p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    {renderStars(replyDialog.review.rating)}
                    <span className="text-sm">
                      by {replyDialog.review.user?.fullName || 'Anonymous'}
                    </span>
                  </div>
                  <p className="text-sm">{replyDialog.review.comment}</p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Write your reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReplyDialog({ open: false, review: null, isEdit: false })}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitReply} disabled={isReplying || isUpdating}>
              {(isReplying || isUpdating) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {replyDialog.isEdit ? 'Update Reply' : 'Post Reply'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false, reviewId: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Reply</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete your reply? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, reviewId: null })}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteReply} disabled={isDeleting}>
              {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ReviewsOverview
