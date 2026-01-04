import { useState } from 'react'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import AccountSettings from '@/components/settings/account-settings'
import NotificationSettings from '@/components/settings/notification-settings'
import SubscriptionSettings from '@/components/settings/subscription-settings'

export default function SettingsPage() {
  const [tab, setTab] = useState('account')

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">Business and account settings.</p>
        </div>

        <div className="flex gap-2 border-b border-border">
          <button className={`px-4 py-2 ${tab === 'account' ? 'border-b-2 border-primary' : 'text-muted-foreground'}`} onClick={() => setTab('account')}>Account</button>
          <button className={`px-4 py-2 ${tab === 'notifications' ? 'border-b-2 border-primary' : 'text-muted-foreground'}`} onClick={() => setTab('notifications')}>Notifications</button>
          <button className={`px-4 py-2 ${tab === 'subscription' ? 'border-b-2 border-primary' : 'text-muted-foreground'}`} onClick={() => setTab('subscription')}>Subscription</button>
        </div>

        <div>
          {tab === 'account' && <AccountSettings />}
          {tab === 'notifications' && <NotificationSettings />}
          {tab === 'subscription' && <SubscriptionSettings />}
        </div>
      </div>
    </DashboardShell>
  )
}
