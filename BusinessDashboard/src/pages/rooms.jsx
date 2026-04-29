import { useState } from 'react'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { BedDouble, Plus } from 'lucide-react'

export default function RoomsPage() {
  const [showForm, setShowForm] = useState(false)

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-foreground text-3xl font-bold">Rooms</h1>
            <p className="text-muted-foreground mt-1">Manage hotel rooms, rates, and availability in PKR.</p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Room
          </Button>
        </div>

        {showForm ? (
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Room Name</Label>
                <Input placeholder="Deluxe King Room" />
              </div>
              <div className="space-y-2">
                <Label>Room Type</Label>
                <Input placeholder="Deluxe, Suite, Family" />
              </div>
              <div className="space-y-2">
                <Label>Price Per Night (PKR)</Label>
                <Input type="number" min="0" placeholder="12000" />
              </div>
              <div className="space-y-2">
                <Label>Capacity</Label>
                <Input type="number" min="1" placeholder="2" />
              </div>
              <div className="space-y-2">
                <Label>Total Rooms</Label>
                <Input type="number" min="1" placeholder="10" />
              </div>
              <div className="space-y-2">
                <Label>Available Rooms</Label>
                <Input type="number" min="0" placeholder="6" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Amenities</Label>
                <Input placeholder="WiFi, breakfast, AC" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Description</Label>
                <Textarea placeholder="Describe this room..." />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={() => setShowForm(false)}>Save Room</Button>
            </div>
          </Card>
        ) : (
          <Card className="p-12 text-center">
            <BedDouble className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold">No rooms added yet</h3>
            <p className="text-muted-foreground mt-1 mb-4">Add rooms for your hotel instead of restaurant menu items.</p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Room
            </Button>
          </Card>
        )}
      </div>
    </DashboardShell>
  )
}
