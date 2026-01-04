import React from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import Switch from '@/components/ui/switch'

export function ProfileInfo() {
  return (
    <Card className="p-6">
      <form className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name</Label>
            <Input id="businessName" defaultValue="The Grand Hotel" className="bg-secondary" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select defaultValue="hotel" className="w-full bg-secondary p-2 rounded">
              <option value="hotel">Hotel</option>
              <option value="restaurant">Restaurant</option>
              <option value="attraction">Attraction</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" defaultValue="Experience luxury and comfort at The Grand Hotel, located in the heart of the city." className="bg-secondary min-h-[120px]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" defaultValue="+1 (555) 123-4567" className="bg-secondary" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Contact Email</Label>
              <Input id="email" type="email" defaultValue="info@grandhotel.com" className="bg-secondary" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input id="website" type="url" defaultValue="https://grandhotel.com" className="bg-secondary" />
          </div>

          <div className="space-y-4 pt-4 border-t border-border">
            <h3 className="font-semibold">Operating Hours</h3>

            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
              <div key={day} className="flex items-center gap-4">
                <div className="w-32">
                  <span className="text-sm">{day}</span>
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <Input type="time" defaultValue="09:00" className="bg-secondary" />
                  <span className="text-muted-foreground">to</span>
                  <Input type="time" defaultValue="18:00" className="bg-secondary" />
                </div>
                <Switch checked />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="outline" className="bg-transparent">Cancel</Button>
          <Button>Save Changes</Button>
        </div>
      </form>
    </Card>
  )
}

export default ProfileInfo
