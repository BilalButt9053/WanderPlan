import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import ReviewsOverview from '@/components/reviews/reviews-overview'

export default function ReviewsPage() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-white text-3xl font-bold">Reviews</h1>
          <p className="text-muted-foreground mt-1">View and respond to customer reviews.</p>
        </div>
        <ReviewsOverview />
      </div>
    </DashboardShell>
  )
}
