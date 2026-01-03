import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  Filter,
  MoreVertical,
  Eye,
  CheckCircle,
  XCircle,
  Ban,
  Calendar,
} from "lucide-react"

const deals = [
  {
    id: 1,
    title: "Summer Sale - 50% Off",
    business: "Sunset Restaurant",
    type: "Seasonal Promotion",
    status: "Active",
    startDate: "2024-12-01",
    endDate: "2024-12-31",
    impressions: 12450,
    clicks: 890,
    conversions: 234,
  },
  {
    id: 2,
    title: "Weekend Getaway Package",
    business: "Mountain View Hotel",
    type: "Package Deal",
    status: "Active",
    startDate: "2024-11-15",
    endDate: "2025-01-15",
    impressions: 28900,
    clicks: 2100,
    conversions: 567,
  },
  {
    id: 3,
    title: "Holiday Special Tour",
    business: "Adventure Tours",
    type: "Limited Time Offer",
    status: "Pending",
    startDate: "2024-12-24",
    endDate: "2025-01-05",
    impressions: 0,
    clicks: 0,
    conversions: 0,
  },
  {
    id: 4,
    title: "Buy One Get One Free",
    business: "Cafe Delight",
    type: "Promotional",
    status: "Expired",
    startDate: "2024-11-01",
    endDate: "2024-11-30",
    impressions: 8340,
    clicks: 670,
    conversions: 145,
  },
  {
    id: 5,
    title: "Early Bird Discount",
    business: "Beach Resort",
    type: "Seasonal Promotion",
    status: "Active",
    startDate: "2024-12-01",
    endDate: "2025-02-28",
    impressions: 45200,
    clicks: 3890,
    conversions: 1023,
  },
  {
    id: 6,
    title: "New Year's Eve Dinner",
    business: "Urban Bistro",
    type: "Event Special",
    status: "Pending",
    startDate: "2024-12-31",
    endDate: "2024-12-31",
    impressions: 0,
    clicks: 0,
    conversions: 0,
  },
]

const stats = [
  { label: "Total Deals", value: "87" },
  { label: "Active Campaigns", value: "43" },
  { label: "Pending Approval", value: "8" },
  { label: "Total Revenue", value: "$124.5K" },
]

export default function DealsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Deals & Ads Management
        </h1>
        <p className="text-muted-foreground">
          Manage sponsored deals and advertising campaigns.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle>All Deals & Campaigns</CardTitle>

            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search deals..."
                  className="pl-10"
                />
              </div>

              <Select defaultValue="all">
                <SelectTrigger className="w-full md:w-40">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="seasonal">Seasonal</SelectItem>
                  <SelectItem value="package">Package Deal</SelectItem>
                  <SelectItem value="promotional">Promotional</SelectItem>
                  <SelectItem value="event">Event Special</SelectItem>
                </SelectContent>
              </Select>

              <Select defaultValue="all">
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Deal Title</TableHead>
                <TableHead>Business</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {deals.map((deal) => (
                <TableRow key={deal.id}>
                  <TableCell className="font-medium">
                    {deal.title}
                  </TableCell>

                  <TableCell>{deal.business}</TableCell>

                  <TableCell>
                    <Badge variant="secondary">{deal.type}</Badge>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={
                        deal.status === "Active"
                          ? "default"
                          : deal.status === "Pending"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {deal.status}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {deal.startDate} - {deal.endDate}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1 text-sm">
                      <div>Views: {deal.impressions.toLocaleString()}</div>
                      <div>Clicks: {deal.clicks.toLocaleString()}</div>
                      <div>Conv: {deal.conversions.toLocaleString()}</div>
                    </div>
                  </TableCell>

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>

                        {deal.status === "Pending" && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Approve Deal
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <XCircle className="mr-2 h-4 w-4" />
                              Reject Deal
                            </DropdownMenuItem>
                          </>
                        )}

                        {deal.status === "Active" && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Ban className="mr-2 h-4 w-4" />
                              Disable Deal
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
