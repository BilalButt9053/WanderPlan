import { DashboardShell } from '@/components/dashboard/dashboard-shell'

export default function ReviewsPage() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Reviews</h1>
          <p className="text-muted-foreground mt-1">View and respond to customer reviews.</p>
        </div>
        <div className="bg-card border rounded-lg p-8 text-center text-muted-foreground">
          Reviews page content coming soon...
        </div>
      </div>
    </DashboardShell>
  )
}
