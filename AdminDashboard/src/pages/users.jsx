import React, { useEffect, useState } from "react"
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
import { usersService } from "@/services/adminService"
import { useToast } from "@/components/ui/use-toast"

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        toast({
          title: "Error",
          description: "Please login first",
          variant: "destructive",
        });
        window.location.href = '/sign-in';
        return;
      }
      
      const data = await usersService.getUsers();
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch users";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      // If unauthorized, redirect to login
      if (error.response?.status === 401) {
        setTimeout(() => {
          window.location.href = '/sign-in';
        }, 1500);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await usersService.deleteUser(id);
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const handleMakeAdmin = async (id) => {
    if (!confirm('Are you sure you want to make this user an admin?')) return;
    
    try {
      await usersService.makeAdmin(id);
      toast({
        title: "Success",
        description: "User granted admin privileges",
      });
      fetchUsers();
    } catch (error) {
      console.error('Error making admin:', error);
      toast({
        title: "Error",
        description: "Failed to grant admin privileges",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || 
                       (filterRole === 'admin' && user.isAdmin) ||
                       (filterRole === 'user' && !user.isAdmin);
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && user.isVerified) ||
                         (filterStatus === 'suspended' && !user.isVerified);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const stats = [
    { label: "Total Users", value: users.length.toLocaleString() },
    { label: "Active Today", value: users.filter(u => u.isVerified).length.toLocaleString() },
    { label: "Admins", value: users.filter(u => u.isAdmin).length.toLocaleString() },
    { label: "Regular Users", value: users.filter(u => !u.isAdmin).length.toLocaleString() },
  ];
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
                <Input 
                  placeholder="Search users..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="md:w-40">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
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
                <TableHead>Status</TableHead>
                <TableHead>Verified</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {user.fullName
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.fullName || "Unknown"}</div>
                          <div className="text-sm text-muted-foreground">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={user.isAdmin ? "default" : "secondary"}
                      >
                        {user.isAdmin ? "Admin" : "User"}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={user.isVerified ? "default" : "destructive"}
                      >
                        {user.isVerified ? "Active" : "Unverified"}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      {user.isVerified ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Ban className="h-4 w-4 text-red-500" />
                      )}
                    </TableCell>

                    <TableCell>
                      {new Date(user.createdAt || Date.now()).toLocaleDateString()}
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
                            View Profile
                          </DropdownMenuItem>
                          {!user.isAdmin && (
                            <DropdownMenuItem onClick={() => handleMakeAdmin(user._id)}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Make Admin
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDeleteUser(user._id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
