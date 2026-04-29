import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AlertCircle, Loader2, LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { logout, selectCurrentBusiness, setCredentials } from '@/redux/slices/businessAuthSlice'
import { useSubmitAppealMutation } from '@/redux/api/businessApi'

export default function SuspendedAccount() {
  const dispatch = useDispatch()
  const business = useSelector(selectCurrentBusiness)
  const [message, setMessage] = useState('')
  const [submitAppeal, { isLoading }] = useSubmitAppealMutation()

  const handleSubmit = async (event) => {
    event.preventDefault()
    const trimmed = message.trim()

    if (trimmed.length < 20) {
      toast.error('Appeal message must be at least 20 characters.')
      return
    }

    try {
      const response = await submitAppeal({ message: trimmed }).unwrap()
      dispatch(setCredentials({ business: response.business }))
      setMessage('')
      toast.success('Your appeal has been submitted for review.')
    } catch (err) {
      toast.error(err?.data?.message || 'Unable to submit appeal right now.')
    }
  }

  const handleLogout = () => {
    dispatch(logout())
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto flex min-h-screen max-w-2xl items-center">
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-destructive" />
              <CardTitle>Your business account has been suspended</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
              <p className="font-medium">Reason</p>
              <p>{business?.suspensionReason || 'Please contact WanderPlan support for more information.'}</p>
            </div>

            {business?.appealStatus === 'pending' ? (
              <div className="rounded-lg bg-muted p-4 text-sm">
                Your appeal is under review.
              </div>
            ) : business?.appealStatus === 'rejected' ? (
              <div className="rounded-lg bg-muted p-4 text-sm">
                <p className="font-medium">Appeal rejected</p>
                {business?.appealAdminResponse && <p className="mt-1 text-muted-foreground">{business.appealAdminResponse}</p>}
              </div>
            ) : null}

            {business?.appealStatus !== 'pending' && (
              <form onSubmit={handleSubmit} className="space-y-3">
                <Textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Explain why your business should be reactivated..."
                  className="min-h-[140px]"
                  maxLength={1000}
                />
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-muted-foreground">Minimum 20 characters.</p>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit Appeal
                  </Button>
                </div>
              </form>
            )}

            <Button type="button" variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
