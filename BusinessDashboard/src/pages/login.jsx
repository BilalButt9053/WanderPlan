import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Mountain, Loader2, AlertCircle, Clock, XCircle } from 'lucide-react'
import { useLoginBusinessMutation } from '@/redux/api/businessApi'
import { setCredentials, selectIsAuthenticated, setPendingBusiness } from '@/redux/slices/businessAuthSlice'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [statusMessage, setStatusMessage] = useState(null)
  
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  
  const [loginBusiness, { isLoading, error }] = useLoginBusinessMutation()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatusMessage(null)

    try {
      const response = await loginBusiness({ email, password }).unwrap()
      
      // If login successful (status is approved)
      dispatch(setCredentials({
        business: response.business,
        token: response.token
      }))
      
      navigate('/dashboard')
    } catch (err) {
      console.error('Login failed:', err)
      
      // Handle unverified email - redirect to verification page
      if (err?.data?.businessId && err?.status === 403) {
        dispatch(setPendingBusiness({
          businessId: err.data.businessId,
          email: email
        }))
        navigate('/verify-email')
        return
      }
      
      // Handle different status responses
      const status = err?.data?.status
      const message = err?.data?.message
      const reason = err?.data?.reason
      
      if (status === 'pending') {
        setStatusMessage({
          type: 'pending',
          message: message || 'Your account is pending admin approval. You will be notified once approved.',
          icon: Clock
        })
      } else if (status === 'rejected') {
        setStatusMessage({
          type: 'rejected',
          message: message || 'Your application was rejected.',
          reason: reason,
          icon: XCircle
        })
      } else if (status === 'suspended') {
        setStatusMessage({
          type: 'suspended',
          message: message || 'Your account has been suspended. Please contact support.',
          icon: AlertCircle
        })
      } else {
        setStatusMessage({
          type: 'error',
          message: message || 'Invalid email or password',
          icon: AlertCircle
        })
      }
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Mountain className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome to WanderPlan</CardTitle>
          <p className="text-muted-foreground text-sm">Sign in to your business dashboard</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            {statusMessage && (
              <div className={`p-4 rounded-lg flex items-start gap-3 ${
                statusMessage.type === 'pending' ? 'bg-warning/10 text-warning' :
                statusMessage.type === 'rejected' ? 'bg-destructive/10 text-destructive' :
                statusMessage.type === 'suspended' ? 'bg-destructive/10 text-destructive' :
                'bg-destructive/10 text-destructive'
              }`}>
                <statusMessage.icon className="h-5 w-5 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{statusMessage.message}</p>
                  {statusMessage.reason && (
                    <p className="text-xs mt-1 opacity-90">Reason: {statusMessage.reason}</p>
                  )}
                </div>
              </div>
            )}

            {error && !statusMessage && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                {error?.data?.message || 'Login failed. Please try again.'}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
