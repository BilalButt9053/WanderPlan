import { useState } from 'react'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import POSConnection from '@/components/pos/pos-connection'
import POSSettings from '@/components/pos/pos-settings'
import POSSyncedItems from '@/components/pos/pos-synced-items'

export default function POSPage() {
  const [tab, setTab] = useState('connection')

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">POS Integration</h1>
          <p className="text-muted-foreground mt-1">Connect your POS to keep inventory in sync.</p>
        </div>

        <div className="flex gap-2 border-b border-border">
          <button className={`px-4 py-2 ${tab === 'connection' ? 'border-b-2 border-primary' : 'text-muted-foreground'}`} onClick={() => setTab('connection')}>Connection</button>
          <button className={`px-4 py-2 ${tab === 'settings' ? 'border-b-2 border-primary' : 'text-muted-foreground'}`} onClick={() => setTab('settings')}>Settings</button>
          <button className={`px-4 py-2 ${tab === 'items' ? 'border-b-2 border-primary' : 'text-muted-foreground'}`} onClick={() => setTab('items')}>Synced Items</button>
        </div>

        <div>
          {tab === 'connection' && <POSConnection />}
          {tab === 'settings' && <POSSettings />}
          {tab === 'items' && <POSSyncedItems />}
        </div>
      </div>
    </DashboardShell>
  )
}
