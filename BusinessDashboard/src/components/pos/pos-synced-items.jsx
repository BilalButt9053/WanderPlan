import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Badge from '@/components/ui/badge'
import { Search, RefreshCw, Package, AlertCircle, CheckCircle } from 'lucide-react'

const items = [
  { id: 1, name: 'Deluxe Room', sku: 'ROOM-DLX-001', stock: 'In Stock', status: 'synced', lastSync: '2 min ago' },
  { id: 2, name: 'Standard Room', sku: 'ROOM-STD-001', stock: 'In Stock', status: 'synced', lastSync: '2 min ago' },
  { id: 3, name: 'Suite', sku: 'ROOM-STE-001', stock: 'Limited', status: 'synced', lastSync: '2 min ago' },
  { id: 4, name: 'Breakfast Package', sku: 'PKG-BRFST-001', stock: 'Available', status: 'synced', lastSync: '2 min ago' },
  { id: 5, name: 'Spa Treatment', sku: 'SRV-SPA-001', stock: 'Available', status: 'error', lastSync: '1 hour ago' },
  { id: 6, name: 'Airport Transfer', sku: 'SRV-TRANS-001', stock: 'Available', status: 'synced', lastSync: '2 min ago' },
]

export function POSSyncedItems() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search items..." className="pl-9 bg-secondary border-0" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-[140px] bg-secondary p-2 rounded">
              <option value="all">All Status</option>
              <option value="synced">Synced</option>
              <option value="error">Error</option>
            </select>
            <Button variant="outline" className="gap-2 bg-transparent"><RefreshCw className="h-4 w-4" />Sync All</Button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-border bg-card/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center"><Package className="h-6 w-6 text-muted-foreground" /></div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{item.sku}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium">{item.stock}</p>
                  <p className="text-xs text-muted-foreground">Stock Status</p>
                </div>

                <div className="flex items-center gap-2">
                  {item.status === 'synced' ? (
                    <Badge variant="outline" className="gap-1"><CheckCircle className="h-3 w-3" />Synced</Badge>
                  ) : (
                    <Badge variant="destructive" className="gap-1"><AlertCircle className="h-3 w-3" />Error</Badge>
                  )}
                </div>

                <p className="text-xs text-muted-foreground min-w-[80px] text-right">{item.lastSync}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4"><div className="text-center"><p className="text-2xl font-bold">127</p><p className="text-sm text-muted-foreground mt-1">Total Items</p></div></Card>
        <Card className="p-4"><div className="text-center"><p className="text-2xl font-bold text-success">126</p><p className="text-sm text-muted-foreground mt-1">Synced</p></div></Card>
        <Card className="p-4"><div className="text-center"><p className="text-2xl font-bold text-destructive">1</p><p className="text-sm text-muted-foreground mt-1">Errors</p></div></Card>
      </div>
    </div>
  )
}

export default POSSyncedItems
