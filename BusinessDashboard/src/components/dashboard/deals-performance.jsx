import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Tag, TrendingUp, TrendingDown } from 'lucide-react'

const deals = [
  { name: 'Summer Special 2024', impressions: 12453, clicks: 892, ctr: 7.2, trend: 'up' },
  { name: 'Weekend Getaway', impressions: 8921, clicks: 456, ctr: 5.1, trend: 'down' },
  { name: 'Early Bird Discount', impressions: 6734, clicks: 523, ctr: 7.8, trend: 'up' },
]

export function DealsPerformance() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Deals Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {deals.map((deal) => (
            <div key={deal.name} className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Tag className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">{deal.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {deal.impressions.toLocaleString()} impressions
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  {deal.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-success" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-destructive" />
                  )}
                  <span className="font-medium">{deal.ctr}%</span>
                </div>
                <div className="text-sm text-muted-foreground">CTR</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
