import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Mountain, Loader2 } from 'lucide-react'
import { useRegisterBusinessMutation } from '@/redux/api/businessApi'
import { setPendingBusiness } from '@/redux/slices/businessAuthSlice'

export default function SignupPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    businessName: '',
    email: '',
    password: '',
  })
  
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [registerBusiness, { isLoading, error }] = useRegisterBusinessMutation()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.password.length < 6) {
      alert('Password must be at least 6 characters long')
      return
    }

    try {
      // Combine firstName and lastName into ownerName for backend
      const registrationData = {
        businessName: formData.businessName,
        ownerName: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
        phone: '', // Will be collected in onboarding
        businessType: 'other', // Will be collected in onboarding
      }
      const response = await registerBusiness(registrationData).unwrap()
      
      // Store pending business info for onboarding flow
      dispatch(setPendingBusiness({
        businessId: response.businessId,
        email: response.email
      }))
      
      // Navigate to onboarding page instead of directly to OTP verification
      navigate('/onboarding')
    } catch (err) {
      console.error('Registration failed:', err)
      alert(err?.data?.message || 'Registration failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Mountain className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Create Business Account</CardTitle>
          <p className="text-muted-foreground text-sm">Join WanderPlan and grow your business</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium">First Name</label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium">Last Name</label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="businessName" className="text-sm font-medium">Business Name</label>
              <Input
                id="businessName"
                name="businessName"
                type="text"
                placeholder="My Amazing Business"
                value={formData.businessName}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="business@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLoading}
                minLength={6}
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                {error?.data?.message || 'Registration failed. Please try again.'}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Continue to Onboarding'
              )}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
