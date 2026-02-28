import { Bell, Search, Menu, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useGetBusinessStatsQuery } from "@/services/businessApi";

export function AdminHeader({ toggleSidebar, darkMode, toggleDarkMode }) {
  const navigate = useNavigate();
  const { data: businessStats } = useGetBusinessStatsQuery();
  const hasPendingBusinesses = businessStats?.pending > 0;

  const handleLogout = () => {
    // Clear all auth data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    // Navigate to sign-in
    navigate('/auth/sign-in', { replace: true });
  };
  
  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const userInitials = userData?.fullName 
    ? userData.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AD';

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 md:px-6">
      <div className="flex flex-1 items-center gap-2 md:gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar}
          className="flex-shrink-0"
          title="Toggle Sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users, reviews, businesses..."
            className="pl-10"
          />
        </div>
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleDarkMode}
          className="relative flex-shrink-0"
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? (
            <Sun className="h-5 w-5 text-yellow-500" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {hasPendingBusinesses && (
                <Badge 
                  variant="destructive" 
                  className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {businessStats.pending}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {hasPendingBusinesses ? (
              <>
                <DropdownMenuItem onClick={() => navigate('/businesses')} className="flex-col items-start gap-1 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-orange-500" />
                    <span className="font-medium">Pending Business Approvals</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {businessStats.pending} {businessStats.pending === 1 ? 'business' : 'businesses'} waiting for review
                  </p>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            ) : (
              <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                No new notifications
              </div>
            )}
            <DropdownMenuItem onClick={() => navigate('/businesses')} className="justify-center text-primary">
              View All Businesses
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{userData?.fullName || 'Admin'}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/settings')}>Settings</DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
