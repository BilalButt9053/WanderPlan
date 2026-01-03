import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  LayoutDashboard,
  Building2,
  Tag,
  Star,
  CreditCard,
  BarChart3,
  Users,
  MessageSquare,
  Bell,
  Settings,
  Search,
  Menu,
  X,
  Mountain,
  LogOut,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { logout, selectCurrentBusiness } from '@/redux/slices/businessAuthSlice'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Business Profile', href: '/dashboard/profile', icon: Building2 },
  { name: 'Deals & Ads', href: '/dashboard/deals', icon: Tag },
  { name: 'Reviews', href: '/dashboard/reviews', icon: Star },
  { name: 'POS Integration', href: '/dashboard/pos', icon: CreditCard },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Staff', href: '/dashboard/staff', icon: Users },
  { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function DashboardShell({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const business = useSelector(selectCurrentBusiness)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const notifications = 3

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const getInitials = () => {
    if (business?.businessName) {
      return business.businessName.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase()
    }
    return 'BU'
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - Desktop */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 border-r border-sidebar-border bg-sidebar hidden lg:block overflow-y-auto">
        <div className="p-6 border-b border-sidebar-border">
          <Link to="/dashboard" className="flex items-center gap-2">
            <Mountain className="h-8 w-8 text-sidebar-primary" />
            <span className="text-xl font-bold text-sidebar-foreground">WanderPlan</span>
          </Link>
        </div>

        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.href

            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
                )}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Navigation */}
        <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {/* Search */}
            <div className="flex-1 flex items-center gap-4 max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="pl-9 h-9"
                />
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notifications > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={business?.logo} alt={business?.businessName} />
                      <AvatarFallback>{getInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{business?.businessName}</p>
                      <p className="text-xs leading-none text-muted-foreground">{business?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/dashboard/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/dashboard/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-b border-border bg-sidebar">
            <nav className="p-4 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.href

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        )}

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
