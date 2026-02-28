import React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Eye, MousePointerClick, Edit2, Trash2, TrendingUp } from 'lucide-react'

const deals = [
  {
    id: 1,
    title: 'Summer Sale - 30% Off',
    description: 'Get 30% discount on all bookings made during summer',
    status: 'active',
    views: 850,
    clicks: 245,
    conversion: 28.8,
    startDate: 'Jun 1, 2024',
    endDate: 'Aug 31, 2024',
  },
  {
    id: 2,
    title: 'Weekend Special',
    description: 'Book 2 nights, get the 3rd night free',
    status: 'active',
    views: 620,
    clicks: 180,
    conversion: 29.0,
    startDate: 'May 15, 2024',
    endDate: 'Dec 31, 2024',
  },
  {
    id: 3,
    title: 'Early Bird Discount',
    description: '15% off for bookings made 30 days in advance',
    status: 'scheduled',
    views: 0,
    clicks: 0,
    conversion: 0,
    startDate: 'Jul 1, 2024',
    endDate: 'Sep 30, 2024',
  },
]

export function DealsList() {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        {deals.map((deal) => (
          <div key={deal.id} className="p-4 rounded-lg border border-border bg-card/50 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold">{deal.title}</h3>
                  <Badge variant={deal.status === 'active' ? 'default' : 'secondary'}>
                    {deal.status === 'active' ? 'Active' : 'Scheduled'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{deal.description}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {deal.startDate} - {deal.endDate}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="icon" variant="ghost">
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {deal.status === 'active' && (
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Eye className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{deal.views}</p>
                    <p className="text-xs text-muted-foreground">Views</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <MousePointerClick className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{deal.clicks}</p>
                    <p className="text-xs text-muted-foreground">Clicks</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{deal.conversion}%</p>
                    <p className="text-xs text-muted-foreground">Conversion</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}

export default DealsList
