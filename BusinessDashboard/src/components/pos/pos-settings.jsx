import React from 'react'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import Switch from '@/components/ui/switch'
import { Button } from '@/components/ui/button'

export function POSSettings() {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold">Sync Settings</h3>
            <p className="text-sm text-muted-foreground">Configure how your POS data syncs</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto Sync</Label>
                <p className="text-sm text-muted-foreground">Automatically sync changes from your POS</p>
              </div>
              <Switch checked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Real-time Updates</Label>
                <p className="text-sm text-muted-foreground">Push updates instantly to WanderPlan</p>
              </div>
              <Switch checked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Sync Inventory</Label>
                <p className="text-sm text-muted-foreground">Keep stock levels synchronized</p>
              </div>
              <Switch checked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Sync Pricing</Label>
                <p className="text-sm text-muted-foreground">Update prices automatically</p>
              </div>
              <Switch checked />
            </div>

            <div className="space-y-2 pt-4">
              <Label>Sync Frequency</Label>
              <select className="w-[140px] bg-secondary p-2 rounded">
                <option value="realtime">Real-time</option>
                <option value="1min">Every 1 minute</option>
                <option value="5min" selected>Every 5 minutes</option>
                <option value="15min">Every 15 minutes</option>
                <option value="30min">Every 30 minutes</option>
                <option value="1hour">Every hour</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold">Notification Settings</h3>
            <p className="text-sm text-muted-foreground">Get notified about sync events</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Sync Errors</Label>
                <p className="text-sm text-muted-foreground">Alert when sync fails</p>
              </div>
              <Switch checked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Daily Summary</Label>
                <p className="text-sm text-muted-foreground">Receive daily sync report</p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Low Stock Alerts</Label>
                <p className="text-sm text-muted-foreground">Notify when items run low</p>
              </div>
              <Switch checked />
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 border-destructive/50">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-destructive">Danger Zone</h3>
            <p className="text-sm text-muted-foreground">Irreversible actions</p>
          </div>

          <div className="flex items-center justify-between py-3 border-t border-border">
            <div>
              <p className="font-medium">Clear Sync History</p>
              <p className="text-sm text-muted-foreground">Remove all sync logs</p>
            </div>
            <Button variant="outline" className="bg-transparent">Clear</Button>
          </div>

          <div className="flex items-center justify-between py-3 border-t border-border">
            <div>
              <p className="font-medium">Disconnect POS</p>
              <p className="text-sm text-muted-foreground">Remove POS integration completely</p>
            </div>
            <Button variant="destructive">Disconnect</Button>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button>Save Settings</Button>
      </div>
    </div>
  )
}

export default POSSettings
