import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Tag, TrendingUp, TrendingDown, Loader2, AlertCircle } from 'lucide-react'
import { useGetDealAnalyticsQuery } from '@/redux/api/businessApi'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function DealsPerformance() {
  const navigate = useNavigate()
  const { data: dealsData, isLoading } = useGetDealAnalyticsQuery('30days')

  const deals = dealsData?.data?.topDeals || []

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Deals Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px]">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Active Deals Performance</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => navigate('/deals')}>
          View All
        </Button>
      </CardHeader>
      <CardContent>
        {deals.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[200px] text-center">
            <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No active deals</p>
            <Button variant="link" onClick={() => navigate('/deals')}>
              Create a deal
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {deals.slice(0, 3).map((deal) => {
              const ctr = deal.impressions > 0 ? ((deal.clicks / deal.impressions) * 100).toFixed(1) : 0
              const previousCtr = deal.previousImpressions > 0
                ? ((deal.previousClicks / deal.previousImpressions) * 100)
                : 0
              const trend = ctr >= previousCtr ? 'up' : 'down'

              return (
                <div key={deal._id} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Tag className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{deal.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {(deal.impressions || 0).toLocaleString()} impressions
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      {trend === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-success" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-destructive" />
                      )}
                      <span className="font-medium">{ctr}%</span>
                    </div>
                    <div className="text-sm text-muted-foreground">CTR</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
