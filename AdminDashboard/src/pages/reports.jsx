import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, Filter, MoreVertical, CheckCircle, Ban, Trash2 } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const userReports = [
  {
    id: 1,
    reportedUser: "James Wilson",
    reportedBy: "Sarah Johnson",
    reason: "Spam Content",
    description: "User is posting promotional links in every review",
    date: "2024-12-22",
    status: "Pending",
    severity: "High",
  },
]

const reviewReports = [
  {
    id: 1,
    author: "Suspicious User",
    location: "Cafe Delight",
    reason: "Spam / Advertisement",
    date: "2024-12-22",
    status: "Pending",
    content: "Click here for amazing deals!",
  },
]

const businessReports = [
  {
    id: 1,
    business: "Fake Restaurant",
    reason: "Fraudulent Business",
    date: "2024-12-22",
    status: "Pending",
    severity: "Critical",
  },
]

const stats = [
  { label: "Total Reports", value: "47" },
  { label: "Pending Review", value: "23" },
  { label: "Under Investigation", value: "12" },
  { label: "Resolved Today", value: "8" },
]

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports & Moderation</h1>
        <p className="text-muted-foreground">
          Review and take action on reported content and users.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Reported Users</TabsTrigger>
          <TabsTrigger value="reviews">Reported Reviews</TabsTrigger>
          <TabsTrigger value="businesses">Reported Businesses</TabsTrigger>
        </TabsList>

        {/* Users */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Reported Users</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {userReports.map((r) => (
                <div key={r.id} className="flex gap-4 rounded-lg border p-4">
                  <Avatar>
                    <AvatarFallback>
                      {r.reportedUser.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between">
                      <div>
                        <span className="font-medium">{r.reportedUser}</span>
                        <div className="text-sm text-muted-foreground">
                          {r.reason} • {r.date}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <CheckCircle className="mr-2 h-4 w-4" /> Dismiss
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Ban className="mr-2 h-4 w-4" /> Suspend
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <p className="text-sm text-muted-foreground">{r.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reviews */}
        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle>Reported Reviews</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {reviewReports.map((r) => (
                <div key={r.id} className="rounded-lg border p-4">
                  <div className="font-medium">{r.author}</div>
                  <div className="text-sm text-muted-foreground">
                    {r.location} • {r.date}
                  </div>
                  <p className="text-sm mt-2">{r.content}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Businesses */}
        <TabsContent value="businesses">
          <Card>
            <CardHeader>
              <CardTitle>Reported Businesses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {businessReports.map((b) => (
                <div key={b.id} className="rounded-lg border p-4">
                  <div className="font-medium">{b.business}</div>
                  <div className="text-sm text-muted-foreground">
                    {b.reason} • {b.date}
                  </div>
                  <Badge variant="destructive">{b.severity}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
