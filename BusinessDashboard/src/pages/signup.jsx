import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Mountain, Sun, Moon, Eye, EyeOff } from 'lucide-react'
import { setPendingBusiness } from '@/redux/slices/businessAuthSlice'
import { useTheme } from '@/contexts/ThemeContext'

export default function SignupPage() {
  const [formData, setFormData] = useState({
    ownerName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { theme, toggleTheme } = useTheme()
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).+$/

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const ownerName = formData.ownerName.trim()
    const email = formData.email.trim().toLowerCase()

    if (ownerName.length < 2) {
      setError('Owner name must be at least 2 characters.')
      return
    }

    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.')
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    if (!passwordRegex.test(formData.password)) {
      setError('Password must include at least one letter and one number.')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    // Store signup data temporarily in Redux (no API call yet)
    dispatch(setPendingBusiness({
      ownerName,
      email,
      password: formData.password,
      step: 'onboarding'
    }))
    
    // Navigate to onboarding to collect business details
    navigate('/onboarding')
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
          <CardTitle className="text-2xl">Create Business Account</CardTitle>
          <p className="text-muted-foreground text-sm">Join WanderPlan and grow your business</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="ownerName" className="text-sm font-medium">Owner Name</label>
              <Input
                id="ownerName"
                name="ownerName"
                type="text"
                placeholder="Ahmed Khan"
                value={formData.ownerName}
                onChange={handleChange}
                required
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
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Minimum 8 characters with a letter and number</p>
            </div>
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full">
              Continue to Business Details
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
