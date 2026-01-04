import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import DealsList from '@/components/deals/deals-list'

export default function DealsPage() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Deals & Ads</h1>
          <p className="text-muted-foreground mt-1">Create and manage your promotional deals.</p>
        </div>
        <DealsList />
      </div>
    </DashboardShell>
  )
}
