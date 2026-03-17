import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
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
import api from "@/services/api"
import { setComplaints, setLoading, setError, setStats, setFilters } from "@/redux/slices/reportsSlice"

function mapStatusToVariant(status) {
  switch (status) {
    case "pending":
      return "outline"
    case "in_review":
      return "secondary"
    case "resolved":
      return "default"
    case "rejected":
      return "destructive"
    default:
      return "outline"
  }
}

export default function ReportsPage() {
  const dispatch = useDispatch()
  const { complaints, loading, stats, filters } = useSelector((state) => state.reports)

  useEffect(() => {
    const fetchComplaints = async () => {
      dispatch(setLoading(true))
      try {
        const params = {}
        if (filters.status && filters.status !== "all") params.status = filters.status
        if (filters.priority && filters.priority !== "all") params.priority = filters.priority

        const res = await api.get("/admin/complaints", { params })
        const items = res.data?.complaints || []
        dispatch(setComplaints(items))

        const pending = items.filter((c) => c.status === "pending").length
        const resolved = items.filter((c) => c.status === "resolved").length
        dispatch(
          setStats({
            pending,
            resolved,
            total: items.length,
          })
        )
      } catch (error) {
        dispatch(setError(error.message || "Failed to load complaints"))
      }
    }

    fetchComplaints()
  }, [dispatch, filters.status, filters.priority])

  const handleUpdateStatus = async (id, updates) => {
    try {
      const res = await api.patch(`/admin/complaints/${id}`, updates)
      const updated = res.data?.complaint
      if (!updated) return
      dispatch(
        setComplaints(
          complaints.map((c) => (c._id === updated._id ? { ...c, ...updated } : c))
        )
      )
    } catch (error) {
      console.error("Failed to update complaint:", error)
    }
  }

  const safeStats = stats || { total: 0, pending: 0, resolved: 0 }

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
        {[
          { label: "Total Complaints", value: safeStats.total.toString() },
          { label: "Pending Review", value: safeStats.pending.toString() },
          { label: "Resolved", value: safeStats.resolved.toString() },
        ].map((stat) => (
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

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span>Filter complaints</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {/* Status filter */}
          <Select
            value={filters.status}
            onValueChange={(value) => dispatch(setFilters({ status: value }))}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_review">In Review</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          {/* Priority filter */}
          <Select
            value={filters.priority}
            onValueChange={(value) => dispatch(setFilters({ priority: value }))}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
              <CardTitle>User Complaints</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading && (
                <div className="text-sm text-muted-foreground">Loading complaints...</div>
              )}
              {!loading &&
                complaints
                  .filter((c) => c.type === "bug" || c.type === "abuse" || c.type === "other")
                  .map((c) => (
                    <div key={c._id} className="flex gap-4 rounded-lg border p-4">
                      <Avatar>
                        <AvatarFallback>
                          {c.userId?.fullName
                            ? c.userId.fullName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                            : "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between">
                          <div>
                            <span className="font-medium">{c.subject}</span>
                            <div className="text-sm text-muted-foreground">
                              {c.type} •{" "}
                              {new Date(c.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  handleUpdateStatus(c._id, { status: "resolved" })
                                }
                              >
                                <CheckCircle className="mr-2 h-4 w-4" /> Mark
                                Resolved
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleUpdateStatus(c._id, { status: "in_review" })
                                }
                              >
                                <Ban className="mr-2 h-4 w-4" /> Mark In Review
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() =>
                                  handleUpdateStatus(c._id, { status: "rejected" })
                                }
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Reject
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {c.description}
                        </p>
                        <div className="flex gap-2 items-center">
                          <Badge variant={mapStatusToVariant(c.status)}>
                            {c.status}
                          </Badge>
                          <Badge variant="outline">{c.priority}</Badge>
                        </div>
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
              <CardTitle>Review-related Complaints</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!loading &&
                complaints
                  .filter((c) => c.type === "review")
                  .map((c) => (
                    <div key={c._id} className="rounded-lg border p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-medium">{c.subject}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(c.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <Badge variant={mapStatusToVariant(c.status)}>
                          {c.status}
                        </Badge>
                      </div>
                      <p className="text-sm mt-2">{c.description}</p>
                    </div>
                  ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Businesses */}
        <TabsContent value="businesses">
          <Card>
            <CardHeader>
              <CardTitle>Business Complaints</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!loading &&
                complaints
                  .filter((c) => c.type === "business")
                  .map((c) => (
                    <div key={c._id} className="rounded-lg border p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-medium">{c.subject}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(c.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <Badge variant="destructive">{c.priority}</Badge>
                      </div>
                      <p className="text-sm mt-2">{c.description}</p>
                    </div>
                  ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
