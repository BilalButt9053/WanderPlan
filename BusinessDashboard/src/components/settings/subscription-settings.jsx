import React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Badge from '@/components/ui/badge'
import { Check } from 'lucide-react'

const plans = [
  {
    name: 'Starter',
    price: '$29',
    period: 'per month',
    features: ['Basic analytics', 'Up to 5 staff members', 'Email support', '1 location'],
    current: false,
  },
  {
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
    current: true,
  },
  {
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
    current: false,
  },
]

export function SubscriptionSettings() {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Current Plan</h3>
            <p className="text-sm text-muted-foreground">Manage your subscription</p>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card/50">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-lg font-semibold">Professional Plan</p>
                <Badge>Current</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Renews on January 15, 2025</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">$79</p>
              <p className="text-sm text-muted-foreground">per month</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.name} className={`p-6 ${plan.current ? 'border-primary' : ''}`}>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <div className="mt-4">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground ml-2">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-success flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                variant={plan.current ? 'outline' : 'default'}
                disabled={plan.current}
                {...(plan.current && { className: 'bg-transparent' })}
              >
                {plan.current ? 'Current Plan' : 'Upgrade'}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Payment Method</h3>
            <p className="text-sm text-muted-foreground">Manage your billing information</p>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card/50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-8 rounded bg-muted flex items-center justify-center">
                <span className="text-xs font-bold">VISA</span>
              </div>
              <div>
                <p className="font-medium">•••• 4242</p>
                <p className="text-sm text-muted-foreground">Expires 12/25</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="bg-transparent">
              Update
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default SubscriptionSettings
