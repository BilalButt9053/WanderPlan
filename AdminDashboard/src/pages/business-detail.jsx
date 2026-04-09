import { useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Building2, Mail, Phone, User, Globe, CalendarDays, ShieldCheck } from "lucide-react"
import { useGetBusinessByIdQuery } from "@/services/businessApi"
import { Alert, AlertDescription } from "@/components/ui/alert"

const statusVariant = {
  approved: "default",
  pending: "secondary",
  rejected: "destructive",
  suspended: "outline",
}

export default function BusinessDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: business, isLoading, error } = useGetBusinessByIdQuery(id, {
    skip: !id,
  })

  const createdAt = useMemo(() => {
    if (!business?.createdAt) return "N/A"
    return new Date(business.createdAt).toLocaleString()
  }, [business?.createdAt])

  const updatedAt = useMemo(() => {
    if (!business?.updatedAt) return "N/A"
    return new Date(business.updatedAt).toLocaleString()
  }, [business?.updatedAt])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate('/businesses')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Businesses
        </Button>
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">Loading business profile...</CardContent>
        </Card>
      </div>
    )
  }

  if (error || !business) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate('/businesses')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Businesses
        </Button>
        <Alert variant="destructive">
          <AlertDescription>{error?.data?.message || "Failed to load business profile"}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/businesses')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Businesses
        </Button>
        <Button onClick={() => navigate('/analytics')}>Open Platform Analytics</Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">{business.businessName}</h1>
        <p className="text-muted-foreground">Business profile and account details</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={statusVariant[business.status] || "secondary"}>{business.status || "unknown"}</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Verification</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            <span>{business.isVerified ? "Verified" : "Unverified"}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Category</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span>{business.businessType || "N/A"}</span>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{business.ownerName || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{business.email || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{business.phone || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span>{business.website || "N/A"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <span>Created: {createdAt}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <span>Updated: {updatedAt}</span>
            </div>
            <div>
              <span className="font-medium">Approved At: </span>
              <span>{business.approvedAt ? new Date(business.approvedAt).toLocaleString() : "N/A"}</span>
            </div>
            {business.rejectionReason ? (
              <div>
                <span className="font-medium">Reason: </span>
                <span>{business.rejectionReason}</span>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{business.description || "No description provided."}</p>
        </CardContent>
      </Card>
    </div>
  )
}
