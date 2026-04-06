import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useGetEngagementTrendQuery } from '@/redux/api/businessApi'
import { Loader2, Eye, MousePointerClick } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState } from 'react'

export function EngagementChart() {
  const [period, setPeriod] = useState('30days')
  const { data: engagement, isLoading } = useGetEngagementTrendQuery(period)

  const trends = engagement?.data?.trends || []

  const maxViews = Math.max(...trends.map(t => t.views || 0), 1)
  const maxClicks = Math.max(...trends.map(t => t.clicks || 0), 1)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Engagement Overview</CardTitle>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 Days</SelectItem>
            <SelectItem value="30days">Last 30 Days</SelectItem>
            <SelectItem value="90days">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[300px] flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : trends.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No engagement data available
          </div>
        ) : (
          <div className="h-[300px]">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-sm text-muted-foreground">Views</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary/50" />
                <span className="text-sm text-muted-foreground">Clicks</span>
              </div>
            </div>
            <div className="flex items-end justify-between h-[220px] gap-1">
              {trends.slice(-14).map((trend, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col gap-1 items-center">
                    <div
                      className="w-full max-w-[20px] bg-primary rounded-t"
                      style={{ height: `${(trend.views / maxViews) * 180}px` }}
                      title={`Views: ${trend.views}`}
                    />
                    <div
                      className="w-full max-w-[20px] bg-primary/50 rounded-t"
                      style={{ height: `${(trend.clicks / maxClicks) * 100}px` }}
                      title={`Clicks: ${trend.clicks}`}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground rotate-45 origin-left">
                    {new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-8 pt-4 border-t">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">
                    {trends.reduce((sum, t) => sum + (t.views || 0), 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Views</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MousePointerClick className="h-4 w-4 text-primary/70" />
                <div>
                  <p className="text-sm font-medium">
                    {trends.reduce((sum, t) => sum + (t.clicks || 0), 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Clicks</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
