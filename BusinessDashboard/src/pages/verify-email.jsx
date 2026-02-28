import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Mountain, Loader2, Sun, Moon } from 'lucide-react'
import { 
  useVerifyBusinessEmailMutation,
  useResendOTPMutation 
} from '@/redux/api/businessApi'
import {
  selectPendingBusinessId,
  selectPendingEmail,
  clearPendingBusiness,
  loadPendingBusiness
} from '@/redux/slices/businessAuthSlice'
import { useTheme } from '@/contexts/ThemeContext'

export default function VerifyEmailPage() {
  const [otp, setOtp] = useState('')
  const [resendTimer, setResendTimer] = useState(60)
  const [canResend, setCanResend] = useState(false)
  
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { theme, toggleTheme } = useTheme()
  
  const businessId = useSelector(selectPendingBusinessId)
  const email = useSelector(selectPendingEmail)
  
  const [verifyEmail, { isLoading, error }] = useVerifyBusinessEmailMutation()
  const [resendOTP, { isLoading: isResending }] = useResendOTPMutation()

  useEffect(() => {
    // Load pending business data from sessionStorage
    dispatch(loadPendingBusiness())
  }, [dispatch])

  useEffect(() => {
    if (!businessId || !email) {
      navigate('/signup')
    }
  }, [businessId, email, navigate])

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [resendTimer])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (otp.length !== 6) {
      alert('Please enter a valid 6-digit OTP')
      return
    }

    try {
      await verifyEmail({ businessId, otp }).unwrap()
      
      dispatch(clearPendingBusiness())
      
      // Show success message and redirect to login
      alert('Email verified successfully! Your account is now pending admin approval. You will be notified once approved.')
      navigate('/login')
    } catch (err) {
      console.error('Verification failed:', err)
      alert(err?.data?.message || 'Verification failed. Please try again.')
    }
  }

  const handleResend = async () => {
    try {
      await resendOTP(businessId).unwrap()
      setResendTimer(60)
      setCanResend(false)
      alert('OTP has been resent to your email')
    } catch (err) {
      console.error('Resend failed:', err)
      alert(err?.data?.message || 'Failed to resend OTP')
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Theme Toggle Button */}
      <div className="fixed top-4 right-4">
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Mountain className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Verify Your Email</CardTitle>
          <p className="text-muted-foreground text-sm">
            We've sent a 6-digit code to<br />
            <span className="font-medium text-foreground">{email}</span>
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="otp" className="text-sm font-medium">Enter OTP</label>
              <Input
                id="otp"
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                className="text-center text-2xl tracking-widest"
                required
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                {error?.data?.message || 'Verification failed'}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading || otp.length !== 6}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Email'
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            {canResend ? (
              <Button
                variant="ghost"
                onClick={handleResend}
                disabled={isResending}
                className="text-sm"
              >
                {isResending ? 'Sending...' : 'Resend OTP'}
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">
                Resend OTP in {resendTimer}s
              </p>
            )}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-4">
            After verification, your account will be pending admin approval.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
