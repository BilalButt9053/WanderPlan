import { useState } from 'react'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Ticket } from 'lucide-react'

export default function ActivitiesPage() {
  const [showForm, setShowForm] = useState(false)

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-foreground text-3xl font-bold">Activities & Packages</h1>
            <p className="text-muted-foreground mt-1">Manage tickets, packages, and activities in PKR.</p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Activity
          </Button>
        </div>

        {showForm ? (
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input placeholder="Guided City Tour" />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Input placeholder="Ticket, Package, Tour" />
              </div>
              <div className="space-y-2">
                <Label>Price (PKR)</Label>
                <Input type="number" min="0" placeholder="2500" />
              </div>
              <div className="space-y-2">
                <Label>Duration</Label>
                <Input placeholder="3 hours" />
              </div>
              <div className="space-y-2">
                <Label>Capacity</Label>
                <Input type="number" min="0" placeholder="20" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Description</Label>
                <Textarea placeholder="Describe this activity or package..." />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={() => setShowForm(false)}>Save Activity</Button>
            </div>
          </Card>
        ) : (
          <Card className="p-12 text-center">
            <Ticket className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold">No activities added yet</h3>
            <p className="text-muted-foreground mt-1 mb-4">Add tickets or packages for your attraction/activity business.</p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Activity
            </Button>
          </Card>
        )}
      </div>
    </DashboardShell>
  )
}
