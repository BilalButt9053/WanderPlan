import React from "react"
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
import { Search, Filter, MoreVertical, Eye, CheckCircle, Ban, Trash2 } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const users = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    role: "Contributor",
    level: "Level 3",
    status: "Active",
    joinedDate: "2024-01-15",
    contributions: 127,
  },
  {
    id: 2,
    name: "Mike Chen",
    email: "mike.chen@email.com",
    role: "Contributor",
    level: "Level 5",
    status: "Active",
    joinedDate: "2023-11-20",
    contributions: 243,
  },
  {
    id: 3,
    name: "Emma Davis",
    email: "emma.d@email.com",
    role: "Tourist",
    level: "Level 1",
    status: "Active",
    joinedDate: "2024-06-10",
    contributions: 12,
  },
  {
    id: 4,
    name: "James Wilson",
    email: "james.w@email.com",
    role: "Contributor",
    level: "Level 4",
    status: "Suspended",
    joinedDate: "2023-09-05",
    contributions: 189,
  },
  {
    id: 5,
    name: "Lisa Anderson",
    email: "lisa.a@email.com",
    role: "Tourist",
    level: "Level 2",
    status: "Active",
    joinedDate: "2024-03-22",
    contributions: 34,
  },
  {
    id: 6,
    name: "David Martinez",
    email: "david.m@email.com",
    role: "Contributor",
    level: "Level 3",
    status: "Active",
    joinedDate: "2024-02-18",
    contributions: 98,
  },
  {
    id: 7,
    name: "Sophie Taylor",
    email: "sophie.t@email.com",
    role: "Tourist",
    level: "Level 1",
    status: "Active",
    joinedDate: "2024-07-01",
    contributions: 8,
  },
  {
    id: 8,
    name: "Ryan Brown",
    email: "ryan.b@email.com",
    role: "Contributor",
    level: "Level 5",
    status: "Active",
    joinedDate: "2023-08-12",
    contributions: 312,
  },
]

const stats = [
  { label: "Total Users", value: "8,432" },
  { label: "Active Today", value: "1,234" },
  { label: "Contributors", value: "1,420" },
  { label: "Tourists", value: "7,012" },
]

export default function UsersPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Users Management</h1>
        <p className="text-muted-foreground">
          Manage user accounts, roles, and permissions.
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

      {/* Filters + Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle>All Users</CardTitle>

            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <div className="relative md:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search users..." className="pl-10" />
              </div>

              <Select defaultValue="all">
                <SelectTrigger className="md:w-40">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="contributor">Contributor</SelectItem>
                  <SelectItem value="tourist">Tourist</SelectItem>
                </SelectContent>
              </Select>

              <Select defaultValue="all">
                <SelectTrigger className="md:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Contributions</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={
                        user.role === "Contributor" ? "default" : "secondary"
                      }
                    >
                      {user.role}
                    </Badge>
                  </TableCell>

                  <TableCell>{user.level}</TableCell>

                  <TableCell>
                    <Badge
                      variant={
                        user.status === "Active"
                          ? "default"
                          : "destructive"
                      }
                    >
                      {user.status}
                    </Badge>
                  </TableCell>

                  <TableCell>{user.contributions}</TableCell>
                  <TableCell>{user.joinedDate}</TableCell>

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
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approve Contributor
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Ban className="mr-2 h-4 w-4" />
                          Suspend User
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete User
                        </DropdownMenuItem>
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
