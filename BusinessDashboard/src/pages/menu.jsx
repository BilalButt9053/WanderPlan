import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import MenuItemsList from '@/components/menu/menu-items-list'

export default function MenuPage() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-foreground text-3xl font-bold">Menu Items</h1>
          <p className="text-muted-foreground mt-1">Manage your products and services for sale.</p>
        </div>
        <MenuItemsList />
      </div>
    </DashboardShell>
  )
}
