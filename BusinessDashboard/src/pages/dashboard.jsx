import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { EngagementChart } from '@/components/dashboard/engagement-chart'
import { DealsPerformance } from '@/components/dashboard/deals-performance'
import { TopReviews } from '@/components/dashboard/top-reviews'
import { VisibilityScore } from '@/components/dashboard/visibility-score'

export default function DashboardPage() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's your business overview.</p>
        </div>

        <StatsCards />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <EngagementChart />
          </div>
          <div>
            <VisibilityScore />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DealsPerformance />
          <TopReviews />
        </div>
      </div>
    </DashboardShell>
  )
}
