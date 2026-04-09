import { useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate, useSearchParams } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { TrendingUp, Users, MessageSquare, Building2, Loader2, AlertCircle, X } from "lucide-react"
import { statsService } from "@/services/adminService"
import { useGetAllBusinessesQuery } from "@/services/businessApi"

const CHART_THEME = {
  primary: "#2563EB",
  secondary: "#0EA5E9",
  accent: "#14B8A6",
  purple: "#8B5CF6",
  amber: "#F59E0B",
  rose: "#F43F5E",
}

const COLORS = [
  CHART_THEME.primary,
  CHART_THEME.secondary,
  CHART_THEME.accent,
  CHART_THEME.purple,
  CHART_THEME.amber,
]

const formatDateLabel = (value) => {
  if (!value) return "-"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return "-"
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

const toPeriodParam = (range) => {
  if (range === "weekly") return "7days"
  if (range === "quarterly") return "90days"
  if (range === "yearly") return "365days"
  return "30days"
}

export default function AnalyticsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [timeRange, setTimeRange] = useState("monthly")
  const [selectedBusinessId, setSelectedBusinessId] = useState(searchParams.get("businessId") || "all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [dashboard, setDashboard] = useState(null)
  const [userTrends, setUserTrends] = useState([])
  const [reviewTrends, setReviewTrends] = useState([])
  const [businessTrends, setBusinessTrends] = useState({ byCategory: [] })
  const { data: businessesResponse } = useGetAllBusinessesQuery({}, { pollingInterval: 60000 })
  const businesses = businessesResponse?.businesses || []

  useEffect(() => {
    const navBusinessId = location.state?.businessId
    if (navBusinessId) {
      setSelectedBusinessId(navBusinessId)
      setSearchParams({ businessId: navBusinessId }, { replace: true })
    }
  }, [location.state, setSearchParams])

  const effectiveBusinessId = selectedBusinessId !== "all" ? selectedBusinessId : undefined

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true)
      setError("")
      try {
        const period = toPeriodParam(timeRange)
        const [dashboardRes, usersRes, reviewsRes, businessesRes] = await Promise.all([
          statsService.getDashboardStats(effectiveBusinessId),
          statsService.getUserTrends(period, effectiveBusinessId),
          statsService.getReviewTrends(period, effectiveBusinessId),
          statsService.getBusinessTrends(period, effectiveBusinessId),
        ])

        setDashboard(dashboardRes?.data || null)
        setUserTrends(usersRes?.data || [])
        setReviewTrends(reviewsRes?.data?.recentTrend || [])
        setBusinessTrends(businessesRes?.data || { byCategory: [] })
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || "Failed to load analytics")
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [timeRange, effectiveBusinessId])

  const selectedBusiness = useMemo(() => {
    if (!effectiveBusinessId) return null
    return businesses.find((b) => b._id === effectiveBusinessId) || null
  }, [effectiveBusinessId, businesses])

  const clearBusinessFilter = () => {
    setSelectedBusinessId("all")
    setSearchParams({}, { replace: true })
    navigate("/analytics", { replace: true, state: null })
  }

  const userEngagementData = useMemo(() => {
    let runningUsers = 0
    const mapped = userTrends.map((item) => {
      const count = item?.count || 0
      runningUsers += count
      return {
        date: formatDateLabel(item?.date),
        activeUsers: count,
        cumulativeUsers: runningUsers,
      }
    })

    return mapped.length > 0
      ? mapped
      : [{ date: "No data", activeUsers: 0, cumulativeUsers: 0 }]
  }, [userTrends])

  const reviewActivityData = useMemo(() => {
    const mapped = reviewTrends.map((item) => ({
      date: formatDateLabel(item?.date),
      reviews: item?.count || 0,
      avgRating: Number(item?.avgRating || 0),
    }))

    return mapped.length > 0
      ? mapped
      : [{ date: "No data", reviews: 0, avgRating: 0 }]
  }, [reviewTrends])

  const businessPerformanceData = useMemo(() => {
    const mapped = (businessTrends?.byCategory || []).map((entry) => ({
      category: entry?.category || "other",
      count: entry?.count || 0,
    }))

    return mapped.length > 0
      ? mapped
      : [{ category: "No data", count: 0 }]
  }, [businessTrends])

  const categoryDistribution = useMemo(() => {
    const mapped = (businessTrends?.byCategory || []).map((entry, index) => ({
      name: entry?.category || "other",
      value: entry?.count || 0,
      color: COLORS[index % COLORS.length],
    }))

    return mapped.length > 0
      ? mapped
      : [{ name: "No data", value: 1, color: "#CBD5E1" }]
  }, [businessTrends])

  const overview = dashboard?.overview || {}
  const stats = [
    {
      label: "Total Users",
      value: (overview.totalUsers || 0).toLocaleString(),
      change: `${overview.userGrowth || 0}% user growth`,
      icon: Users,
    },
    {
      label: "Active Users Today",
      value: (overview.activeUsersToday || 0).toLocaleString(),
      change: "Live activity",
      icon: TrendingUp,
    },
    {
      label: "Total Reviews",
      value: (overview.totalReviews || 0).toLocaleString(),
      change: `${overview.flaggedReviews || 0} flagged`,
      icon: MessageSquare,
    },
    {
      label: "Approved Businesses",
      value: (overview.approvedBusinesses || 0).toLocaleString(),
      change: `${overview.pendingBusinesses || 0} pending approvals`,
      icon: Building2,
    },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Platform performance metrics and insights.</p>
        </div>
        <Card>
          <CardContent className="py-16">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading analytics...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Platform performance metrics and insights.</p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={selectedBusinessId}
            onValueChange={(value) => {
              setSelectedBusinessId(value)
              if (value === "all") {
                setSearchParams({}, { replace: true })
                navigate("/analytics", { replace: true, state: null })
              } else {
                setSearchParams({ businessId: value }, { replace: true })
              }
            }}
          >
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Select Business" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Businesses</SelectItem>
              {businesses.map((business) => (
                <SelectItem key={business._id} value={business._id}>{business.businessName}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedBusiness ? (
          <Alert>
            <div className="flex items-center justify-between gap-3">
              <AlertDescription>Filtered by business: {selectedBusiness.businessName}</AlertDescription>
              <Button type="button" variant="outline" size="sm" onClick={clearBusinessFilter}>
                <X className="mr-1 h-3.5 w-3.5" />
                Remove Filter
              </Button>
            </div>
          </Alert>
        ) : null}

        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-green-500">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
            <CardHeader>
              <CardTitle>User Engagement</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={userEngagementData}>
                  <defs>
                    <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_THEME.primary} stopOpacity={0.45} />
                      <stop offset="95%" stopColor={CHART_THEME.primary} stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_THEME.secondary} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={CHART_THEME.secondary} stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="activeUsers"
                    stroke={CHART_THEME.primary}
                    fillOpacity={1}
                    fill="url(#colorActive)"
                    name="New Users"
                    strokeWidth={2}
                    activeDot={{ r: 5 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="cumulativeUsers"
                    stroke={CHART_THEME.secondary}
                    fillOpacity={1}
                    fill="url(#colorSessions)"
                    name="Cumulative Users"
                    strokeWidth={2}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Review Activity</CardTitle>
          </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={reviewActivityData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                  <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" />
                  <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" domain={[0, 5]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="reviews"
                    stroke={CHART_THEME.purple}
                    strokeWidth={2}
                    dot={{ fill: CHART_THEME.purple, r: 3 }}
                    name="Total Reviews"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="avgRating"
                    stroke={CHART_THEME.accent}
                    strokeWidth={2}
                    dot={{ fill: CHART_THEME.accent, r: 3 }}
                    name="Avg Rating"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
              <CardTitle>Business Performance by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={businessPerformanceData}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CHART_THEME.primary} stopOpacity={0.95} />
                      <stop offset="100%" stopColor={CHART_THEME.secondary} stopOpacity={0.9} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="category" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="count" fill="url(#barGradient)" name="Business Count" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
        </Card>

        <Card>
          <CardHeader>
              <CardTitle>Category Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    innerRadius={55}
                    outerRadius={98}
                    fill="#8884d8"
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
        </Card>
      </div>
    </div>
  )
}
