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
  CheckCircle,
  XCircle,
  Flag,
  Eye,
  Star,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const reviews = [
  {
    id: 1,
    user: "Sarah Johnson",
    userInitials: "SJ",
    location: "Mountain View Hotel",
    rating: 5,
    content:
      "Amazing experience! The staff was incredibly friendly and the views were breathtaking.",
    date: "2024-12-22",
    status: "Pending",
    reports: 0,
    flagged: false,
  },
  {
    id: 2,
    user: "Mike Chen",
    userInitials: "MC",
    location: "Sunset Restaurant",
    rating: 4,
    content:
      "Great food and ambiance. The sunset view from the terrace is spectacular.",
    date: "2024-12-21",
    status: "Approved",
    reports: 0,
    flagged: false,
  },
  {
    id: 3,
    user: "Anonymous User",
    userInitials: "AU",
    location: "Cafe Delight",
    rating: 1,
    content: "Terrible service and overpriced.",
    date: "2024-12-20",
    status: "Flagged",
    reports: 3,
    flagged: true,
  },
]

const stats = [
  { label: "Total Reviews", value: "12,854" },
  { label: "Pending Approval", value: "47" },
  { label: "Flagged Content", value: "12" },
  { label: "Approved Today", value: "156" },
]

export default function ReviewsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Reviews & Content Moderation
        </h1>
        <p className="text-muted-foreground">
          Review and moderate user-generated content.
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
            <CardTitle>Review Feed</CardTitle>

            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search reviews..."
                  className="pl-10"
                />
              </div>

              <Select defaultValue="all">
                <SelectTrigger className="w-full md:w-40">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="flagged">Flagged</SelectItem>
                </SelectContent>
              </Select>

              <Select defaultValue="all">
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="flex items-start gap-4 rounded-lg border p-4"
            >
              <Avatar>
                <AvatarFallback>{review.userInitials}</AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{review.user}</span>
                      <Badge
                        variant={
                          review.status === "Approved"
                            ? "default"
                            : review.status === "Flagged"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {review.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {review.location} • {review.date}
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
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <XCircle className="mr-2 h-4 w-4" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < review.rating
                          ? "fill-yellow-500 text-yellow-500"
                          : "text-muted"
                      }`}
                    />
                  ))}
                </div>

                <p className="text-sm">{review.content}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
