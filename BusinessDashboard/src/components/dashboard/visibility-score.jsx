import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react'
import { useGetDashboardAnalyticsQuery } from '@/redux/api/businessApi'

export function VisibilityScore() {
  const { data: analytics, isLoading } = useGetDashboardAnalyticsQuery()

  const data = analytics?.data || {}
  const score = data.visibilityScore || 0
  const scoreChange = data.visibilityChange || 0

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Visibility Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const getScoreMessage = (score) => {
    if (score >= 80) return 'Your business is highly visible'
    if (score >= 60) return 'Good visibility, room for improvement'
    if (score >= 40) return 'Average visibility'
    return 'Low visibility - consider adding more content'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visibility Score</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-8">
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                className="text-muted stroke-current"
                strokeWidth="8"
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
              />
              <circle
                className="text-primary stroke-current"
                strokeWidth="8"
                strokeLinecap="round"
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - score / 100)}`}
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold">{Math.round(score)}</div>
                <div className="text-xs text-muted-foreground">out of 100</div>
              </div>
            </div>
          </div>
          <div className="mt-6 text-center">
            <div className={`flex items-center gap-1 justify-center mb-2 ${scoreChange >= 0 ? 'text-success' : 'text-destructive'}`}>
              {scoreChange >= 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span className="text-sm font-medium">
                {scoreChange >= 0 ? '+' : ''}{scoreChange} this week
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {getScoreMessage(score)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
