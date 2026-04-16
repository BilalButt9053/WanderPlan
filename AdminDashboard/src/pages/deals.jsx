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
  Loader2,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { dealsService } from "@/services/adminService"

export default function DealsPage() {
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [type, setType] = useState("all")
  const [status, setStatus] = useState("all")

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setLoading(true)
        const response = await dealsService.getDeals({
          search: search || undefined,
          type: type === "all" ? undefined : type,
          status: status === "all" ? undefined : status,
        })
        setDeals(response?.data?.deals || [])
      } catch (_error) {
        setDeals([])
      } finally {
        setLoading(false)
      }
    }

    fetchDeals()
  }, [search, type, status])

  const stats = useMemo(() => {
    const total = deals.length
    const active = deals.filter((d) => d.status === "active").length
    const pending = deals.filter((d) => d.status === "scheduled" || d.status === "draft").length
    const totalViews = deals.reduce((sum, d) => sum + (d.analytics?.views || 0), 0)
    return [
      { label: "Total Deals", value: String(total) },
      { label: "Active Campaigns", value: String(active) },
      { label: "Pending", value: String(pending) },
      { label: "Total Views", value: totalViews.toLocaleString() },
    ]
  }, [deals])

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
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="w-full md:w-40">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="deal">Deal</SelectItem>
                  <SelectItem value="ad">Ad</SelectItem>
                </SelectContent>
              </Select>

              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : deals.map((deal) => (
                <TableRow key={deal._id}>
                  <TableCell className="font-medium">
                    {deal.title}
                  </TableCell>

                  <TableCell>{deal.business?.businessName || "N/A"}</TableCell>

                  <TableCell>
                    <Badge variant="secondary">{deal.type}</Badge>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={
                        deal.status === "active"
                          ? "default"
                          : deal.status === "scheduled" || deal.status === "draft"
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
                      {new Date(deal.startDate).toLocaleDateString()} - {new Date(deal.endDate).toLocaleDateString()}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1 text-sm">
                      <div>Views: {(deal.analytics?.views || 0).toLocaleString()}</div>
                      <div>Clicks: {(deal.analytics?.clicks || 0).toLocaleString()}</div>
                      <div>Conv: {(deal.analytics?.redemptions || 0).toLocaleString()}</div>
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

                        {(deal.status === "scheduled" || deal.status === "draft") && (
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

                        {deal.status === "active" && (
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
