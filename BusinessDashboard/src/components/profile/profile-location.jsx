import React from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { MapPin } from 'lucide-react'

export function ProfileLocation() {
  return (
    <Card className="p-6">
      <form className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold">Business Location</h3>
          <p className="text-sm text-muted-foreground mt-1">Update your business address and map location</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Street Address</Label>
            <Input id="address" defaultValue="123 Main Street" className="bg-secondary" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" defaultValue="New York" className="bg-secondary" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input id="state" defaultValue="NY" className="bg-secondary" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="zip">ZIP Code</Label>
              <Input id="zip" defaultValue="10001" className="bg-secondary" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input id="country" defaultValue="United States" className="bg-secondary" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Map Preview</Label>
            <div className="w-full h-80 rounded-lg bg-muted flex items-center justify-center border border-border">
              <div className="text-center space-y-3">
                <MapPin className="h-16 w-16 text-muted-foreground mx-auto" />
                <div>
                  <p className="font-medium">Interactive Map</p>
                  <p className="text-sm text-muted-foreground">Drag the pin to adjust your exact location</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-muted/50 border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              Coordinates: <span className="font-mono">40.7128° N, 74.0060° W</span>
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="outline" className="bg-transparent">Cancel</Button>
          <Button>Save Location</Button>
        </div>
      </form>
    </Card>
  )
}

export default ProfileLocation
