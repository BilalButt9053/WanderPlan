import { Card } from '@/components/ui/card'
import { Eye, MousePointerClick, Calendar, Star, TrendingUp, TrendingDown } from 'lucide-react'

const stats = [
  {
    label: 'Total Views',
    value: '12,458',
    change: '+12.5%',
    trend: 'up',
    icon: Eye,
  },
  {
    label: 'Clicks',
    value: '3,421',
    change: '+8.2%',
    trend: 'up',
    icon: MousePointerClick,
  },
  {
    label: 'Bookings',
    value: '284',
    change: '-2.4%',
    trend: 'down',
    icon: Calendar,
  },
  {
    label: 'Average Rating',
    value: '4.8',
    change: '+0.2',
    trend: 'up',
    icon: Star,
  },
]

export function StatsCards() {
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
