import React from 'react'
import { Card } from '@/components/ui/card'
import { Star } from 'lucide-react'

export function ReviewsOverview() {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded bg-yellow-50">
          <Star className="h-6 w-6 text-yellow-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Reviews</h3>
          <p className="text-sm text-muted-foreground">Overview of recent reviews and ratings.</p>
        </div>
      </div>
    </Card>
  )
}

export default ReviewsOverview
