import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Star } from 'lucide-react'

const reviews = [
  {
    author: 'Sarah Johnson',
    rating: 5,
    comment: 'Amazing experience! The tour was well organized and the guide was knowledgeable.',
    date: '2 days ago',
  },
  {
    author: 'Michael Chen',
    rating: 4,
    comment: 'Great value for money. Would definitely recommend to friends.',
    date: '5 days ago',
  },
  {
    author: 'Emma Williams',
    rating: 5,
    comment: 'Exceeded expectations! The attention to detail was impressive.',
    date: '1 week ago',
  },
]

export function TopReviews() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Reviews</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reviews.map((review, index) => (
            <div key={index} className="border-b last:border-0 pb-4 last:pb-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-medium">{review.author}</div>
                  <div className="flex items-center gap-1 mt-1">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">{review.date}</span>
              </div>
              <p className="text-sm text-muted-foreground">{review.comment}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
