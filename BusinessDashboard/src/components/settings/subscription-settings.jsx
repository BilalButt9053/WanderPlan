import React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Badge from '@/components/ui/badge'
import { Check, Loader2 } from 'lucide-react'
import { useGetBusinessProfileQuery } from '@/redux/api/businessApi'

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$29',
    period: 'per month',
    features: ['Basic analytics', 'Up to 5 staff members', 'Email support', '1 location'],
  },
  {
    id: 'professional',
    name: 'Professional',
    price: '$79',
    period: 'per month',
    features: [
      'Advanced analytics',
      'Up to 20 staff members',
      'Priority support',
      '5 locations',
      'POS integration',
      'Custom branding',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '$199',
    period: 'per month',
    features: [
      'Full analytics suite',
      'Unlimited staff',
      '24/7 phone support',
      'Unlimited locations',
      'API access',
      'Dedicated account manager',
    ],
  },
]

const planDetails = {
  free: { name: 'Free', price: '$0' },
  starter: { name: 'Starter', price: '$29' },
  professional: { name: 'Professional', price: '$79' },
  enterprise: { name: 'Enterprise', price: '$199' },
}

export function SubscriptionSettings() {
  const { data: profile, isLoading } = useGetBusinessProfileQuery()

  const currentPlan = profile?.subscription?.plan || 'free'
  const currentPlanDetails = planDetails[currentPlan] || planDetails.free

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Current Plan</h3>
            <p className="text-sm text-muted-foreground">Manage your subscription</p>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card/50">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-lg font-semibold text-foreground">{currentPlanDetails.name} Plan</p>
                <Badge>Current</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {profile?.subscription?.endDate 
                  ? `Renews on ${formatDate(profile.subscription.endDate)}`
                  : 'No renewal date'
                }
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-foreground">{currentPlanDetails.price}</p>
              <p className="text-sm text-muted-foreground">per month</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlan
          return (
            <Card key={plan.name} className={`p-6 ${isCurrent ? 'border-primary border-2' : ''}`}>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                  <div className="mt-4">
                    <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground ml-2">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-foreground">
                      <Check className="h-4 w-4 text-success flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={isCurrent ? 'outline' : 'default'}
                  disabled={isCurrent}
                >
                  {isCurrent ? 'Current Plan' : 'Upgrade'}
                </Button>
              </div>
            </Card>
          )
        })}
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Payment Method</h3>
            <p className="text-sm text-muted-foreground">Manage your billing information</p>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card/50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-8 rounded bg-muted flex items-center justify-center">
                <span className="text-xs font-bold text-foreground">VISA</span>
              </div>
              <div>
                <p className="font-medium text-foreground">•••• 4242</p>
                <p className="text-sm text-muted-foreground">Expires 12/25</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Update
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Note: Payment integration coming soon. Contact support to upgrade your plan.
          </p>
        </div>
      </Card>
    </div>
  )
}

export default SubscriptionSettings
