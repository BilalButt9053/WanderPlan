import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Search,
  Filter,
  MoreVertical,
  Eye,
  CheckCircle,
  Ban,
  Trash2,
  ShieldCheck,
  Loader2,
  UserX,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Users,
  UserCog,
  AlertTriangle
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { usersService } from "@/services/adminService"
import { useToast } from "@/components/ui/use-toast"

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [actionLoading, setActionLoading] = useState(null);
  const { toast } = useToast();

  // Dialog states
  const [blockDialog, setBlockDialog] = useState({ open: false, user: null });
  const [blockReason, setBlockReason] = useState('');
  const [viewDialog, setViewDialog] = useState({ open: false, user: null });
  const [userDetails, setUserDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

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

      const response = await usersService.getUsersList({
        page,
        limit: 15,
        search: searchQuery || undefined,
        role: filterRole !== 'all' ? filterRole : undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined,
      });

      setUsers(response?.data?.users || response || []);
      setPagination(response?.data?.pagination || { total: response?.length || 0, pages: 1 });
    } catch (error) {
      console.error('Error fetching users:', error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch users";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });

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
  }, [page, searchQuery, filterRole, filterStatus]);

  const handleBlockUser = async () => {
    if (!blockDialog.user) return;

    try {
      setActionLoading(blockDialog.user._id);
      await usersService.blockUser(blockDialog.user._id, blockReason);
      toast({
        title: "Success",
        description: "User has been blocked",
      });
      setBlockDialog({ open: false, user: null });
      setBlockReason('');
      fetchUsers();
    } catch (error) {
      console.error('Error blocking user:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to block user",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnblockUser = async (id) => {
    try {
      setActionLoading(id);
      await usersService.unblockUser(id);
      toast({
        title: "Success",
        description: "User has been unblocked",
      });
      fetchUsers();
    } catch (error) {
      console.error('Error unblocking user:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to unblock user",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      setActionLoading(id);
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
        description: error.response?.data?.message || "Failed to delete user",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleMakeAdmin = async (id) => {
    if (!confirm('Are you sure you want to make this user an admin?')) return;

    try {
      setActionLoading(id);
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
        description: error.response?.data?.message || "Failed to grant admin privileges",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewUser = async (user) => {
    setViewDialog({ open: true, user });
    setDetailsLoading(true);
    try {
      const response = await usersService.getUserDetails(user._id);
      setUserDetails(response?.data || response);
    } catch (error) {
      console.error('Error fetching user details:', error);
      setUserDetails(user);
    } finally {
      setDetailsLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' ||
                       (filterRole === 'admin' && user.isAdmin) ||
                       (filterRole === 'user' && !user.isAdmin);
    const matchesStatus = filterStatus === 'all' ||
                         (filterStatus === 'active' && user.isVerified && !user.isBlocked) ||
                         (filterStatus === 'blocked' && user.isBlocked) ||
                         (filterStatus === 'unverified' && !user.isVerified);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const stats = [
    {
      label: "Total Users",
      value: pagination.total || users.length,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-50"
    },
    {
      label: "Active Users",
      value: users.filter(u => u.isVerified && !u.isBlocked).length,
      icon: UserCheck,
      color: "text-green-500",
      bgColor: "bg-green-50"
    },
    {
      label: "Blocked",
      value: users.filter(u => u.isBlocked).length,
      icon: UserX,
      color: "text-red-500",
      bgColor: "bg-red-50"
    },
    {
      label: "Admins",
      value: users.filter(u => u.isAdmin).length,
      icon: UserCog,
      color: "text-purple-500",
      bgColor: "bg-purple-50"
    },
  ];

  const getUserStatus = (user) => {
    if (user.isBlocked) return { label: 'Blocked', variant: 'destructive' };
    if (!user.isVerified) return { label: 'Unverified', variant: 'secondary' };
    return { label: 'Active', variant: 'default' };
  };

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
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
              </CardContent>
            </Card>
          );
        })}
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
                  <SelectItem value="blocked">Blocked</SelectItem>
                  <SelectItem value="unverified">Unverified</SelectItem>
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
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Loading users...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => {
                  const status = getUserStatus(user);
                  return (
                    <TableRow key={user._id} className={user.isBlocked ? 'bg-red-50/50' : ''}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={user.profilePhoto} />
                            <AvatarFallback>
                              {user.fullName
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {user.fullName || "Unknown"}
                              {user.isBlocked && (
                                <Ban className="h-4 w-4 text-red-500" />
                              )}
                            </div>
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
                        <Badge variant={status.variant}>
                          {status.label}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        {user.isVerified ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        )}
                      </TableCell>

                      <TableCell>
                        {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                      </TableCell>

                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" disabled={actionLoading === user._id}>
                              {actionLoading === user._id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <MoreVertical className="h-4 w-4" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleViewUser(user)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {!user.isAdmin && (
                              <DropdownMenuItem onClick={() => handleMakeAdmin(user._id)}>
                                <ShieldCheck className="mr-2 h-4 w-4" />
                                Make Admin
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {user.isBlocked ? (
                              <DropdownMenuItem onClick={() => handleUnblockUser(user._id)}>
                                <UserCheck className="mr-2 h-4 w-4 text-green-500" />
                                <span className="text-green-500">Unblock User</span>
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => setBlockDialog({ open: true, user })}>
                                <UserX className="mr-2 h-4 w-4 text-orange-500" />
                                <span className="text-orange-500">Block User</span>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDeleteUser(user._id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Page {page} of {pagination.pages} ({pagination.total} total)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Block User Dialog */}
      <Dialog open={blockDialog.open} onOpenChange={(open) => !open && setBlockDialog({ open: false, user: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Block User</DialogTitle>
            <DialogDescription>
              Are you sure you want to block {blockDialog.user?.fullName || 'this user'}?
              They will no longer be able to access their account.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium">Reason for blocking (optional)</label>
            <Textarea
              placeholder="Enter reason for blocking this user..."
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              className="mt-2"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBlockDialog({ open: false, user: null })}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBlockUser}
              disabled={actionLoading === blockDialog.user?._id}
            >
              {actionLoading === blockDialog.user?._id && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Block User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View User Details Dialog */}
      <Dialog open={viewDialog.open} onOpenChange={(open) => !open && setViewDialog({ open: false, user: null })}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {detailsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : userDetails ? (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={userDetails.profilePhoto} />
                  <AvatarFallback className="text-lg">
                    {userDetails.fullName?.split(" ").map(n => n[0]).join("").toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{userDetails.fullName || 'Unknown User'}</h3>
                  <p className="text-muted-foreground">{userDetails.email}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant={userDetails.isAdmin ? "default" : "secondary"}>
                      {userDetails.isAdmin ? "Admin" : "User"}
                    </Badge>
                    <Badge variant={getUserStatus(userDetails).variant}>
                      {getUserStatus(userDetails).label}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{userDetails.phone || 'Not provided'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Joined</p>
                  <p className="font-medium">
                    {new Date(userDetails.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Trips</p>
                  <p className="font-medium">{userDetails.tripCount || 0}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Reviews</p>
                  <p className="font-medium">{userDetails.reviewCount || 0}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Level</p>
                  <p className="font-medium">{userDetails.level || 1}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Points</p>
                  <p className="font-medium">{userDetails.points || 0}</p>
                </div>
              </div>

              {userDetails.isBlocked && (
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2 text-red-700">
                    <Ban className="h-5 w-5" />
                    <span className="font-medium">User is blocked</span>
                  </div>
                  {userDetails.blockReason && (
                    <p className="text-sm text-red-600 mt-2">
                      Reason: {userDetails.blockReason}
                    </p>
                  )}
                  {userDetails.blockedAt && (
                    <p className="text-sm text-red-600">
                      Blocked on: {new Date(userDetails.blockedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialog({ open: false, user: null })}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
