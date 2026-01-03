import { DashboardShell } from '@/components/dashboard/dashboard-shell'

export default function ProfilePage() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Business Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your business information and settings.</p>
        </div>
        <div className="bg-card border rounded-lg p-8 text-center text-muted-foreground">
          Profile page content coming soon...
        </div>
      </div>
    </DashboardShell>
  )
}
