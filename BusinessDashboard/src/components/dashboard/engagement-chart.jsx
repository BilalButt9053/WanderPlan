import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export function EngagementChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Engagement Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
          Chart will be displayed here
        </div>
      </CardContent>
    </Card>
  )
}
