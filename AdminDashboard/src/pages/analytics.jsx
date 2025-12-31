import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { TrendingUp, Users, MessageSquare, Building2 } from "lucide-react"

const userEngagementData = [
  { date: "Dec 1", activeUsers: 1200, sessions: 3400, pageViews: 8900 },
  { date: "Dec 5", activeUsers: 1350, sessions: 3800, pageViews: 9500 },
  { date: "Dec 10", activeUsers: 1500, sessions: 4200, pageViews: 10200 },
  { date: "Dec 15", activeUsers: 1650, sessions: 4600, pageViews: 11100 },
  { date: "Dec 20", activeUsers: 1800, sessions: 5000, pageViews: 12300 },
  { date: "Dec 22", activeUsers: 1900, sessions: 5200, pageViews: 12800 },
]

const reviewActivityData = [
  { month: "Jul", reviews: 980, avgRating: 4.2 },
  { month: "Aug", reviews: 1150, avgRating: 4.3 },
  { month: "Sep", reviews: 1320, avgRating: 4.4 },
  { month: "Oct", reviews: 1480, avgRating: 4.5 },
  { month: "Nov", reviews: 1620, avgRating: 4.6 },
  { month: "Dec", reviews: 1750, avgRating: 4.7 },
]

const businessPerformanceData = [
  { category: "Restaurants", count: 142, revenue: 45200 },
  { category: "Hotels", count: 87, revenue: 78900 },
  { category: "Tours", count: 63, revenue: 34500 },
  { category: "Cafes", count: 34, revenue: 12300 },
  { category: "Resorts", count: 16, revenue: 92100 },
]

const categoryDistribution = [
  { name: "Restaurants", value: 142, color: "hsl(var(--chart-1))" },
  { name: "Hotels", value: 87, color: "hsl(var(--chart-2))" },
  { name: "Tours", value: 63, color: "hsl(var(--chart-3))" },
  { name: "Cafes", value: 34, color: "hsl(var(--chart-4))" },
  { name: "Resorts", value: 16, color: "hsl(var(--chart-5))" },
]

const stats = [
  {
    label: "Total Users",
    value: "8,432",
    change: "+12.5%",
    icon: Users,
  },
  {
    label: "Active Sessions",
    value: "5,234",
    change: "+8.2%",
    icon: TrendingUp,
  },
  {
    label: "Reviews This Month",
    value: "1,750",
    change: "+15.3%",
    icon: MessageSquare,
  },
  {
    label: "Active Businesses",
    value: "298",
    change: "+5.7%",
    icon: Building2,
  },
]

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Platform performance metrics and insights.</p>
        </div>
        <Select defaultValue="monthly">
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
                <p className="text-xs text-green-500">{stat.change} from last period</p>
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
                      <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
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
                    stroke="hsl(var(--chart-1))"
                    fillOpacity={1}
                    fill="url(#colorActive)"
                    name="Active Users"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="sessions"
                    stroke="hsl(var(--chart-2))"
                    fillOpacity={1}
                    fill="url(#colorSessions)"
                    name="Sessions"
                    strokeWidth={2}
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
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
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
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-1))" }}
                    name="Total Reviews"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="avgRating"
                    stroke="hsl(var(--chart-3))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-3))" }}
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
                  <Bar dataKey="count" fill="hsl(var(--chart-1))" name="Business Count" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="revenue" fill="hsl(var(--chart-2))" name="Revenue ($)" radius={[4, 4, 0, 0]} />
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
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
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
