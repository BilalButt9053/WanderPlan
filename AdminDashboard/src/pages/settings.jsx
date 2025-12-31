import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const categories = ["Restaurants", "Hotels", "Tours", "Cafes", "Resorts", "Attractions", "Shopping", "Nightlife"]

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage platform configurations and system settings.</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Platform Information</CardTitle>
                <CardDescription>Basic settings and platform information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="platform-name">Platform Name</Label>
                  <Input id="platform-name" defaultValue="WanderPlan" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="platform-description">Platform Description</Label>
                  <Textarea
                    id="platform-description"
                    defaultValue="Your ultimate travel companion for discovering and sharing amazing experiences"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email">Contact Email</Label>
                  <Input id="contact-email" type="email" defaultValue="admin@wanderplan.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="support-email">Support Email</Label>
                  <Input id="support-email" type="email" defaultValue="support@wanderplan.com" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Regional Settings</CardTitle>
                <CardDescription>Configure regional and localization settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Default Timezone</Label>
                  <Select defaultValue="utc">
                    <SelectTrigger id="timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="utc">UTC</SelectItem>
                      <SelectItem value="est">Eastern Time (EST)</SelectItem>
                      <SelectItem value="pst">Pacific Time (PST)</SelectItem>
                      <SelectItem value="cet">Central European Time (CET)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Default Currency</Label>
                  <Select defaultValue="usd">
                    <SelectTrigger id="currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usd">USD ($)</SelectItem>
                      <SelectItem value="eur">EUR (€)</SelectItem>
                      <SelectItem value="gbp">GBP (£)</SelectItem>
                      <SelectItem value="jpy">JPY (¥)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Default Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger id="language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button variant="outline">Cancel</Button>
              <Button>Save Changes</Button>
            </div>
        </TabsContent>

        {/* Categories */}
        <TabsContent value="categories" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Manage Categories</CardTitle>
                <CardDescription>Add, edit, or remove business categories</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {categories.map((category, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <span className="font-medium">{category}</span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="destructive" size="sm">Remove</Button>
                    </div>
                  </div>
                ))}
                <div className="flex gap-2 pt-2">
                  <Input placeholder="New category name..." />
                  <Button>Add Category</Button>
                </div>
              </CardContent>
            </Card>
        </TabsContent>

        {/* Features */}
        <TabsContent value="features" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Feature Toggles</CardTitle>
                <CardDescription>Enable or disable platform features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { id: "user-registration", label: "User Registration", description: "Allow new users to register on the platform", defaultChecked: true },
                  { id: "business-registration", label: "Business Registration", description: "Allow businesses to register and create profiles", defaultChecked: true },
                  { id: "reviews", label: "User Reviews", description: "Enable users to post reviews", defaultChecked: true },
                  { id: "photo-uploads", label: "Photo Uploads", description: "Allow users to upload photos", defaultChecked: true },
                  { id: "gamification", label: "Gamification System", description: "Enable levels, badges, and rewards", defaultChecked: true },
                  { id: "deals", label: "Deals & Promotions", description: "Enable businesses to create deals", defaultChecked: true },
                  { id: "maintenance-mode", label: "Maintenance Mode", description: "Put platform in maintenance mode", defaultChecked: false },
                ].map((feature) => (
                  <div key={feature.id} className="flex items-center justify-between border-b border-border pb-4">
                    <div className="space-y-1">
                      <Label htmlFor={feature.id}>{feature.label}</Label>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                    <Switch id={feature.id} defaultChecked={feature.defaultChecked} />
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button variant="outline">Cancel</Button>
              <Button>Save Changes</Button>
            </div>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
                <CardDescription>Configure email notification preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { id: "new-user-email", label: "New User Registration", description: "Send email when new user registers", defaultChecked: true },
                  { id: "business-pending", label: "Business Approval Pending", description: "Notify when business needs approval", defaultChecked: true },
                  { id: "review-flagged", label: "Flagged Content", description: "Alert when content is flagged", defaultChecked: true },
                  { id: "daily-summary", label: "Daily Summary", description: "Receive daily platform summary", defaultChecked: true },
                  { id: "critical-alerts", label: "Critical Alerts", description: "High-priority system alerts", defaultChecked: true },
                  { id: "user-reports", label: "User Reports", description: "Notify on new user reports", defaultChecked: true },
                ].map((notif) => (
                  <div key={notif.id} className="flex items-center justify-between border-b border-border pb-4">
                    <div className="space-y-1">
                      <Label htmlFor={notif.id}>{notif.label}</Label>
                      <p className="text-sm text-muted-foreground">{notif.description}</p>
                    </div>
                    <Switch id={notif.id} defaultChecked={notif.defaultChecked} />
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button variant="outline">Cancel</Button>
              <Button>Save Changes</Button>
            </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
