import { DashboardShell } from '@/components/dashboard/dashboard-shell'

export default function DealsPage() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Deals & Ads</h1>
          <p className="text-muted-foreground mt-1">Create and manage your promotional deals.</p>
        </div>
        <div className="bg-card border rounded-lg p-8 text-center text-muted-foreground">
          Deals page content coming soon...
        </div>
      </div>
    </DashboardShell>
  )
}
