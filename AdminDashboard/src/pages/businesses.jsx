import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, Filter, MoreVertical, Eye, CheckCircle, XCircle, Ban, BarChart3, Loader2, AlertCircle } from "lucide-react"
import { 
  useGetAllBusinessesQuery, 
  useGetBusinessStatsQuery,
  useApproveBusinessMutation,
  useRejectBusinessMutation,
  useSuspendBusinessMutation,
  useDeleteBusinessMutation
} from "@/services/businessApi"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function BusinessesPage() {
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedBusiness, setSelectedBusiness] = useState(null)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [suspensionReason, setSuspensionReason] = useState("")

  // API Queries
  const { data: businessResponse, isLoading, error } = useGetAllBusinessesQuery({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
    search: searchQuery || undefined
  }, { pollingInterval: 30000 })

  const businesses = businessResponse?.businesses || []
  const { data: stats } = useGetBusinessStatsQuery()

  // API Mutations
  const [approveBusiness, { isLoading: isApproving }] = useApproveBusinessMutation()
  const [rejectBusiness, { isLoading: isRejecting }] = useRejectBusinessMutation()
  const [suspendBusiness, { isLoading: isSuspending }] = useSuspendBusinessMutation()
  const [deleteBusiness, { isLoading: isDeleting }] = useDeleteBusinessMutation()

  const handleApprove = async (businessId) => {
    if (window.confirm('Are you sure you want to approve this business?')) {
      try {
        await approveBusiness(businessId).unwrap()
        alert('Business approved successfully!')
      } catch (err) {
        alert(err?.data?.message || 'Failed to approve business')
      }
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection')
      return
    }
    try {
      await rejectBusiness({ 
        id: selectedBusiness._id, 
        reason: rejectionReason 
      }).unwrap()
      alert('Business rejected successfully!')
      setRejectDialogOpen(false)
      setRejectionReason("")
      setSelectedBusiness(null)
    } catch (err) {
      alert(err?.data?.message || 'Failed to reject business')
    }
  }

  const handleSuspend = async () => {
    if (!suspensionReason.trim()) {
      alert('Please provide a reason for suspension')
      return
    }
    try {
      await suspendBusiness({ 
        id: selectedBusiness._id, 
        reason: suspensionReason 
      }).unwrap()
      alert('Business suspended successfully!')
      setSuspendDialogOpen(false)
      setSuspensionReason("")
      setSelectedBusiness(null)
    } catch (err) {
      alert(err?.data?.message || 'Failed to suspend business')
    }
  }

  const handleDelete = async (businessId) => {
    if (window.confirm('Are you sure you want to delete this business? This action cannot be undone.')) {
      try {
        await deleteBusiness(businessId).unwrap()
        alert('Business deleted successfully!')
      } catch (err) {
        alert(err?.data?.message || 'Failed to delete business')
      }
    }
  }

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'approved':
        return 'default'
      case 'pending':
        return 'secondary'
      case 'rejected':
        return 'destructive'
      case 'suspended':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Business Owners</h1>
        <p className="text-muted-foreground">Manage business accounts and onboarding approvals.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Businesses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.approved || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{stats?.pending || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Suspended</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats?.suspended || 0}</div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error?.data?.message || 'Failed to load businesses'}
          </AlertDescription>
        </Alert>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle>All Businesses</CardTitle>
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  type="search" 
                  placeholder="Search businesses..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="restaurant">Restaurant</SelectItem>
                  <SelectItem value="hotel">Hotel</SelectItem>
                  <SelectItem value="tour">Tour Operator</SelectItem>
                  <SelectItem value="activity">Activity</SelectItem>
                  <SelectItem value="transport">Transport</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="approved">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : businesses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No businesses found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {businesses.map((business) => (
                  <TableRow key={business._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{business.businessName}</div>
                        <div className="text-sm text-muted-foreground">{business.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{business.businessType}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{business.ownerName}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(business.status)}>
                        {business.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{business.phone || 'N/A'}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{formatDate(business.createdAt)}</span>
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
                          <DropdownMenuItem>
                            <BarChart3 className="mr-2 h-4 w-4" />
                            View Analytics
                          </DropdownMenuItem>
                          {business.status === "pending" && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleApprove(business._id)}
                                disabled={isApproving}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Approve Business
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => {
                                  setSelectedBusiness(business)
                                  setRejectDialogOpen(true)
                                }}
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Reject Application
                              </DropdownMenuItem>
                            </>
                          )}
                          {business.status === "approved" && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => {
                                  setSelectedBusiness(business)
                                  setSuspendDialogOpen(true)
                                }}
                              >
                                <Ban className="mr-2 h-4 w-4" />
                                Suspend Business
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDelete(business._id)}
                            disabled={isDeleting}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Delete Business
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Business Application</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting {selectedBusiness?.businessName}. The business owner will be notified via email.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialogOpen(false)
                setRejectionReason("")
                setSelectedBusiness(null)
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isRejecting || !rejectionReason.trim()}
            >
              {isRejecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reject Business
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend Dialog */}
      <Dialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend Business</DialogTitle>
            <DialogDescription>
              Please provide a reason for suspending {selectedBusiness?.businessName}. The business owner will be notified via email.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Enter suspension reason..."
              value={suspensionReason}
              onChange={(e) => setSuspensionReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSuspendDialogOpen(false)
                setSuspensionReason("")
                setSelectedBusiness(null)
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleSuspend}
              disabled={isSuspending || !suspensionReason.trim()}
            >
              {isSuspending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Suspend Business
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
