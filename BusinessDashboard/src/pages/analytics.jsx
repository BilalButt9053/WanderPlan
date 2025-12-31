import { DashboardShell } from '@/components/dashboard/dashboard-shell'

export default function AnalyticsPage() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-1">View detailed analytics and insights.</p>
        </div>
        <div className="bg-card border rounded-lg p-8 text-center text-muted-foreground">
          Analytics page content coming soon...
        </div>
      </div>
    </DashboardShell>
  )
}
