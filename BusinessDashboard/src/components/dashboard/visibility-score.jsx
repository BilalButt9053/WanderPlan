import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { TrendingUp } from 'lucide-react'

export function VisibilityScore() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Visibility Score</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-8">
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                className="text-muted stroke-current"
                strokeWidth="8"
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
              />
              <circle
                className="text-primary stroke-current"
                strokeWidth="8"
                strokeLinecap="round"
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - 0.85)}`}
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold">85</div>
                <div className="text-xs text-muted-foreground">out of 100</div>
              </div>
            </div>
          </div>
          <div className="mt-6 text-center">
            <div className="flex items-center gap-1 text-success justify-center mb-2">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">+5 this week</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your business is highly visible
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
