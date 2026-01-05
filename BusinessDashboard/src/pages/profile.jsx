import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import ProfileInfo from '@/components/profile/profile-info'
import ProfileGallery from '@/components/profile/profile-gallery'
import ProfileLocation from '@/components/profile/profile-location'

export default function ProfilePage() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-white text-3xl font-bold">Business Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your business information and settings.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ProfileInfo />
            <ProfileGallery />
          </div>
          <div className="lg:col-span-1 space-y-6">
            <ProfileLocation />
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
