import React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function POSConnection() {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">POS Integration</h3>
        <p className="text-sm text-muted-foreground">Connect your point-of-sale system to sync inventory and orders.</p>
        <div className="flex items-center gap-3">
          <Button>Connect POS</Button>
          <Button variant="ghost">View Settings</Button>
        </div>
      </div>
    </Card>
  )
}

export default POSConnection
