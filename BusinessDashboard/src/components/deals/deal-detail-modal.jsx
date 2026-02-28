import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Eye, 
  MousePointerClick, 
  TrendingUp, 
  Calendar,
  Tag,
  Megaphone,
  Clock,
  Ticket,
  Users,
  Edit2,
  ExternalLink
} from 'lucide-react'

export default function DealDetailModal({ deal, open, onClose, onEdit }) {
  if (!deal) return null

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
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

  const getDiscountDisplay = () => {
    if (!deal.discountValue || deal.discountValue === 0) return null
    switch (deal.discountType) {
      case 'percentage': return `${deal.discountValue}% OFF`
      case 'fixed': return `$${deal.discountValue} OFF`
      case 'buyOneGetOne': return 'Buy One Get One'
      case 'freeItem': return 'Free Item'
      default: return null
    }
  }

  const daysRemaining = () => {
    const end = new Date(deal.endDate)
    const now = new Date()
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24))
    if (diff < 0) return 'Expired'
    if (diff === 0) return 'Expires today'
    if (diff === 1) return '1 day left'
    return `${diff} days left`
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">{deal.title}</DialogTitle>
            <Button variant="secondary" size="sm" onClick={() => onEdit(deal)}>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Deal Image */}
          {deal.image?.url && (
            <div className="w-full h-48 rounded-lg bg-muted overflow-hidden">
              <img 
                src={deal.image.url} 
                alt={deal.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Status & Type Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline">
              {deal.type === 'ad' ? (
                <><Megaphone className="h-3 w-3 mr-1" /> Advertisement</>
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
            {getDiscountDisplay() && (
              <Badge variant="success">
                {getDiscountDisplay()}
              </Badge>
            )}
          </div>

          {/* Description */}
          {deal.description && (
            <div>
              <h4 className="font-medium mb-2 text-foreground">Description</h4>
              <p className="text-sm text-muted-foreground">{deal.description}</p>
            </div>
          )}

          {/* Date & Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-muted/50 border">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Duration</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {formatDate(deal.startDate)}
              </p>
              <p className="text-sm text-muted-foreground">
                to {formatDate(deal.endDate)}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 border">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Time Remaining</span>
              </div>
              <p className={`text-sm font-medium ${deal.status === 'expired' ? 'text-destructive' : 'text-primary'}`}>
                {daysRemaining()}
              </p>
            </div>
          </div>

          {/* Promo Code */}
          {deal.code && (
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Ticket className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Promo Code</span>
                </div>
                <code className="px-3 py-1 rounded bg-background font-mono text-lg font-bold text-foreground">
                  {deal.code}
                </code>
              </div>
              {deal.usageLimit && (
                <p className="text-xs text-muted-foreground mt-2">
                  Usage: {deal.usedCount || 0} / {deal.usageLimit}
                </p>
              )}
            </div>
          )}

          {/* Linked Menu Items */}
          {deal.menuItems && deal.menuItems.length > 0 && (
            <div>
              <h4 className="font-medium mb-2 text-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Applies to Items ({deal.menuItems.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {deal.menuItems.map((item) => (
                  <Badge key={item._id || item} variant="outline">
                    {item.name || 'Item'}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Terms & Conditions */}
          {deal.terms && (
            <div>
              <h4 className="font-medium mb-2 text-foreground">Terms & Conditions</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {deal.terms}
              </p>
            </div>
          )}

          {/* Analytics */}
          <div>
            <h4 className="font-medium mb-3 text-foreground">Analytics</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-muted/50 border text-center">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <Eye className="h-5 w-5 text-primary" />
                </div>
                <p className="text-2xl font-bold text-foreground">{deal.analytics?.views || 0}</p>
                <p className="text-xs text-muted-foreground">Views</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 border text-center">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mx-auto mb-2">
                  <MousePointerClick className="h-5 w-5 text-accent" />
                </div>
                <p className="text-2xl font-bold text-foreground">{deal.analytics?.clicks || 0}</p>
                <p className="text-xs text-muted-foreground">Clicks</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 border text-center">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="h-5 w-5 text-success" />
                </div>
                <p className="text-2xl font-bold text-foreground">{deal.analytics?.redemptions || 0}</p>
                <p className="text-xs text-muted-foreground">Redemptions</p>
              </div>
            </div>
          </div>

          {/* Conversion Rate */}
          {(deal.analytics?.views > 0) && (
            <div className="p-4 rounded-lg bg-muted/50 border">
              <p className="text-sm text-muted-foreground">Conversion Rate</p>
              <p className="text-2xl font-bold text-foreground">
                {((deal.analytics?.redemptions || 0) / deal.analytics.views * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {deal.analytics.redemptions || 0} redemptions from {deal.analytics.views} views
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
