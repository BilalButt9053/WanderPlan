import React, { useState } from 'react'
import { 
  useGetDealsQuery, 
  useDeleteDealMutation, 
  useToggleDealStatusMutation 
} from '@/redux/api/businessApi'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Eye, 
  MousePointerClick, 
  Edit2, 
  Trash2, 
  TrendingUp, 
  Plus, 
  Loader2,
  Pause,
  Play,
  Tag,
  Megaphone,
  Calendar,
  MoreVertical
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import DealForm from './deal-form'
import DealDetailModal from './deal-detail-modal'

export function DealsList() {
  const { data, isLoading, error } = useGetDealsQuery({})
  const [deleteDeal, { isLoading: isDeleting }] = useDeleteDealMutation()
  const [toggleStatus, { isLoading: isToggling }] = useToggleDealStatusMutation()
  
  const [showForm, setShowForm] = useState(false)
  const [editingDeal, setEditingDeal] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [filter, setFilter] = useState('all')
  const [selectedDeal, setSelectedDeal] = useState(null)

  const deals = data?.deals || []
  
  const filteredDeals = deals.filter(deal => {
    if (filter === 'all') return true
    if (filter === 'deals') return deal.type === 'deal'
    if (filter === 'ads') return deal.type === 'ad'
    return deal.status === filter
  })

  const handleEdit = (deal) => {
    setEditingDeal(deal)
    setShowForm(true)
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    try {
      await deleteDeal(deleteConfirm._id).unwrap()
      setDeleteConfirm(null)
    } catch (err) {
      console.error('Delete failed:', err)
      alert('Failed to delete deal')
    }
  }

  const handleToggleStatus = async (deal) => {
    const newStatus = deal.status === 'active' ? 'paused' : 'active'
    try {
      await toggleStatus({ id: deal._id, status: newStatus }).unwrap()
    } catch (err) {
      console.error('Toggle failed:', err)
      alert(err?.data?.message || 'Failed to update status')
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusVariant = (status) => {
    switch (status) {
      case 'active': return 'default'
      case 'scheduled': return 'secondary'
      case 'paused': return 'outline'
      case 'expired': return 'destructive'
      default: return 'secondary'
    }
  }

  const getStatusLabel = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  if (showForm) {
    return (
      <DealForm 
        deal={editingDeal} 
        onClose={() => {
          setShowForm(false)
          setEditingDeal(null)
        }} 
      />
    )
  }

  if (isLoading) {
    return (
      <Card className="p-12 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-destructive">
          <p>Failed to load deals</p>
          <p className="text-sm text-muted-foreground mt-1">
            {error?.data?.message || 'Please try again later'}
          </p>
        </div>
      </Card>
    )
  }

  return (
    <>
      <Card className="p-6">
        {/* Header with filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button 
              variant={filter === 'all' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('all')}
            >
              All ({deals.length})
            </Button>
            <Button 
              variant={filter === 'deals' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('deals')}
            >
              <Tag className="h-4 w-4 mr-1" />
              Deals
            </Button>
            <Button 
              variant={filter === 'ads' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('ads')}
            >
              <Megaphone className="h-4 w-4 mr-1" />
              Ads
            </Button>
            <Button 
              variant={filter === 'active' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('active')}
            >
              Active
            </Button>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Deal
          </Button>
        </div>

        {/* Deals List */}
        {filteredDeals.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
              <Tag className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-1">No deals found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {filter === 'all' 
                ? 'Create your first deal to attract more customers'
                : `No ${filter} deals at the moment`
              }
            </p>
            {filter === 'all' && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Deal
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDeals.map((deal) => (
              <div 
                key={deal._id} 
                className="p-4 rounded-lg border border-border bg-card/50 space-y-4 cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => setSelectedDeal(deal)}
              >
                <div className="flex items-start gap-4">
                  {/* Deal Image */}
                  {deal.image?.url && (
                    <div className="w-20 h-20 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                      <img 
                        src={deal.image.url} 
                        alt={deal.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  {/* Deal Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {deal.type === 'ad' ? (
                          <><Megaphone className="h-3 w-3 mr-1" /> Ad</>
                        ) : (
                          <><Tag className="h-3 w-3 mr-1" /> Deal</>
                        )}
                      </Badge>
                      <Badge variant={getStatusVariant(deal.status)}>
                        {getStatusLabel(deal.status)}
                      </Badge>
                      {deal.isFeatured && (
                        <Badge variant="secondary">Featured</Badge>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold truncate">{deal.title}</h3>
                    {deal.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {deal.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(deal.startDate)} - {formatDate(deal.endDate)}
                      </span>
                      {deal.code && (
                        <span className="font-mono bg-muted px-2 py-0.5 rounded">
                          {deal.code}
                        </span>
                      )}
                      {deal.discountValue > 0 && deal.type === 'deal' && (
                        <span className="text-primary font-medium">
                          {deal.discountType === 'percentage' 
                            ? `${deal.discountValue}% OFF`
                            : deal.discountType === 'fixed'
                            ? `$${deal.discountValue} OFF`
                            : deal.discountType === 'buyOneGetOne'
                            ? 'BOGO'
                            : 'Free Item'
                          }
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(deal)}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        {deal.status !== 'expired' && (
                          <DropdownMenuItem 
                          onClick={() => handleToggleStatus(deal)}
                          disabled={isToggling}
                        >
                          {deal.status === 'active' ? (
                            <>
                              <Pause className="h-4 w-4 mr-2" />
                              Pause
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => setDeleteConfirm(deal)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Analytics */}
                {(deal.status === 'active' || deal.analytics?.views > 0) && (
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Eye className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{deal.analytics?.views || 0}</p>
                        <p className="text-xs text-muted-foreground">Views</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                        <MousePointerClick className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{deal.analytics?.clicks || 0}</p>
                        <p className="text-xs text-muted-foreground">Clicks</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-success" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{deal.analytics?.redemptions || 0}</p>
                        <p className="text-xs text-muted-foreground">Redemptions</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Deal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteConfirm?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Deal Detail Modal */}
      <DealDetailModal 
        deal={selectedDeal}
        open={!!selectedDeal}
        onClose={() => setSelectedDeal(null)}
        onEdit={(deal) => {
          setSelectedDeal(null)
          handleEdit(deal)
        }}
      />
    </>
  )
}

export default DealsList
