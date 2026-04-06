import { Card } from '@/components/ui/card'
import { Eye, MousePointerClick, MessageSquare, Star, TrendingUp, TrendingDown, Loader2 } from 'lucide-react'
import { useGetDashboardAnalyticsQuery } from '@/redux/api/businessApi'

export function StatsCards() {
  const { data: analytics, isLoading, error } = useGetDashboardAnalyticsQuery()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6">
            <div className="flex items-center justify-center h-24">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          </Card>
        ))}
      </div>
    )
  }

  const data = analytics?.data || {}

  const stats = [
    {
      label: 'Total Views',
      value: (data.totalViews || 0).toLocaleString(),
      change: data.viewsChange ? `${data.viewsChange > 0 ? '+' : ''}${data.viewsChange}%` : '0%',
      trend: (data.viewsChange || 0) >= 0 ? 'up' : 'down',
      icon: Eye,
    },
    {
      label: 'Total Clicks',
      value: (data.totalClicks || 0).toLocaleString(),
      change: data.clicksChange ? `${data.clicksChange > 0 ? '+' : ''}${data.clicksChange}%` : '0%',
      trend: (data.clicksChange || 0) >= 0 ? 'up' : 'down',
      icon: MousePointerClick,
    },
    {
      label: 'Total Reviews',
      value: (data.totalReviews || 0).toLocaleString(),
      change: data.reviewsChange ? `${data.reviewsChange > 0 ? '+' : ''}${data.reviewsChange}%` : '0%',
      trend: (data.reviewsChange || 0) >= 0 ? 'up' : 'down',
      icon: MessageSquare,
    },
    {
      label: 'Average Rating',
      value: (data.averageRating || 0).toFixed(1),
      change: data.ratingChange ? `${data.ratingChange > 0 ? '+' : ''}${data.ratingChange}` : '0',
      trend: (data.ratingChange || 0) >= 0 ? 'up' : 'down',
      icon: Star,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown

        return (
          <Card key={stat.label} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div
                className={`flex items-center gap-1 text-xs font-medium ${
                  stat.trend === 'up' ? 'text-success' : 'text-destructive'
                }`}
              >
                <TrendIcon className="h-3 w-3" />
                {stat.change}
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
