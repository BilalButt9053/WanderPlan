import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import Switch from '@/components/ui/switch'

export function NotificationSettings() {
  const [state, setState] = useState({
    newReviews: true,
    newMessages: true,
    bookingNotifications: true,
    dealPerformance: false,
    marketingUpdates: false,
    urgentMessages: true,
    dailySummary: true,
  })

  const toggle = (key) => (val) => setState(s => ({ ...s, [key]: val }))

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold">Email Notifications</h3>
            <p className="text-sm text-muted-foreground">Choose what updates you receive via email</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>New Reviews</Label>
                <p className="text-sm text-muted-foreground">Get notified when customers leave reviews</p>
              </div>
              <Switch checked={state.newReviews} onChange={toggle('newReviews')} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>New Messages</Label>
                <p className="text-sm text-muted-foreground">Receive alerts for customer messages</p>
              </div>
              <Switch checked={state.newMessages} onChange={toggle('newMessages')} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Booking Notifications</Label>
                <p className="text-sm text-muted-foreground">Updates about new bookings and cancellations</p>
              </div>
              <Switch checked={state.bookingNotifications} onChange={toggle('bookingNotifications')} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Deal Performance</Label>
                <p className="text-sm text-muted-foreground">Weekly reports on your active deals</p>
              </div>
              <Switch checked={state.dealPerformance} onChange={toggle('dealPerformance')} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Marketing Updates</Label>
                <p className="text-sm text-muted-foreground">Tips and news from WanderPlan</p>
              </div>
              <Switch checked={state.marketingUpdates} onChange={toggle('marketingUpdates')} />
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold">Push Notifications</h3>
            <p className="text-sm text-muted-foreground">Manage mobile app notifications</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Urgent Messages</Label>
                <p className="text-sm text-muted-foreground">Priority customer communications</p>
              </div>
              <Switch checked={state.urgentMessages} onChange={toggle('urgentMessages')} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Daily Summary</Label>
                <p className="text-sm text-muted-foreground">Daily performance snapshot</p>
              </div>
              <Switch checked={state.dailySummary} onChange={toggle('dailySummary')} />
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button>Save Preferences</Button>
      </div>
    </div>
  )
}

export default NotificationSettings
