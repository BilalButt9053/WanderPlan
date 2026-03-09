import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import Switch from '@/components/ui/switch'
import { Loader2 } from 'lucide-react'
import { 
  useGetBusinessProfileQuery,
  useUpdateNotificationSettingsMutation 
} from '@/redux/api/businessApi'

export function NotificationSettings() {
  const { data: profile, isLoading: isLoadingProfile } = useGetBusinessProfileQuery()
  const [updateSettings, { isLoading: isSaving }] = useUpdateNotificationSettingsMutation()

  const [state, setState] = useState({
    newReviews: true,
    newMessages: true,
    bookingNotifications: true,
    dealPerformance: false,
    marketingUpdates: false,
    urgentMessages: true,
    dailySummary: true,
  })

  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (profile?.settings?.notifications) {
      setState({
        newReviews: profile.settings.notifications.newReviews ?? true,
        newMessages: profile.settings.notifications.newMessages ?? true,
        bookingNotifications: profile.settings.notifications.bookingNotifications ?? true,
        dealPerformance: profile.settings.notifications.dealPerformance ?? false,
        marketingUpdates: profile.settings.notifications.marketingUpdates ?? false,
        urgentMessages: profile.settings.notifications.urgentMessages ?? true,
        dailySummary: profile.settings.notifications.dailySummary ?? true,
      })
    }
  }, [profile])

  const toggle = (key) => (val) => {
    setState(s => ({ ...s, [key]: val }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    try {
      await updateSettings(state).unwrap()
      alert('Notification preferences saved!')
      setHasChanges(false)
    } catch (err) {
      console.error('Save failed:', err)
      alert(err?.data?.message || 'Failed to save preferences')
    }
  }

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Email Notifications</h3>
            <p className="text-sm text-muted-foreground">Choose what updates you receive via email</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-foreground">New Reviews</Label>
                <p className="text-sm text-muted-foreground">Get notified when customers leave reviews</p>
              </div>
              <Switch checked={state.newReviews} onChange={toggle('newReviews')} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-foreground">New Messages</Label>
                <p className="text-sm text-muted-foreground">Receive alerts for customer messages</p>
              </div>
              <Switch checked={state.newMessages} onChange={toggle('newMessages')} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-foreground">Booking Notifications</Label>
                <p className="text-sm text-muted-foreground">Updates about new bookings and cancellations</p>
              </div>
              <Switch checked={state.bookingNotifications} onChange={toggle('bookingNotifications')} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-foreground">Deal Performance</Label>
                <p className="text-sm text-muted-foreground">Weekly reports on your active deals</p>
              </div>
              <Switch checked={state.dealPerformance} onChange={toggle('dealPerformance')} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-foreground">Marketing Updates</Label>
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
            <h3 className="text-lg font-semibold text-foreground">Push Notifications</h3>
            <p className="text-sm text-muted-foreground">Manage mobile app notifications</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-foreground">Urgent Messages</Label>
                <p className="text-sm text-muted-foreground">Priority customer communications</p>
              </div>
              <Switch checked={state.urgentMessages} onChange={toggle('urgentMessages')} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-foreground">Daily Summary</Label>
                <p className="text-sm text-muted-foreground">Daily performance snapshot</p>
              </div>
              <Switch checked={state.dailySummary} onChange={toggle('dailySummary')} />
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving || !hasChanges}>
          {isSaving ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
          ) : (
            'Save Preferences'
          )}
        </Button>
      </div>
    </div>
  )
}

export default NotificationSettings
