import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Building2,
  MessageSquare,
  Tag,
  BarChart3,
  Trophy,
  Flag,
  Settings,
} from "lucide-react";

const navItems = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "Users", href: "/users", icon: Users },
  { title: "Business Owners", href: "/businesses", icon: Building2 },
  { title: "Reviews & Content", href: "/reviews", icon: MessageSquare },
  { title: "Deals & Ads", href: "/deals", icon: Tag },
  { title: "Analytics", href: "/analytics", icon: BarChart3 },
  { title: "Gamification", href: "/gamification", icon: Trophy },
  { title: "Reports & Moderation", href: "/reports", icon: Flag },
  { title: "Settings", href: "/settings", icon: Settings },
];

export function AdminSidebar({ isOpen }) {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 flex h-screen flex-col border-r border-border bg-card transition-all duration-300 ease-in-out",
        isOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full lg:w-20 lg:translate-x-0",
        !isOpen && "lg:items-center"
      )}>      <div className={cn(
        "flex h-16 items-center border-b border-border transition-all",
        isOpen ? "px-6" : "justify-center px-2"
      )}>
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-lg font-bold">W</span>
          </div>
          {isOpen && <span className="text-lg font-semibold whitespace-nowrap">WanderPlan</span>}
        </Link>
      </div>
      <nav className={cn("flex-1 space-y-1 overflow-y-auto", isOpen ? "p-4" : "p-2")}>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center rounded-lg text-sm font-medium transition-colors",
                isOpen ? "gap-3 px-3 py-2" : "justify-center p-3",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
              title={!isOpen ? item.title : undefined}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {isOpen && <span className="truncate">{item.title}</span>}
            </Link>
          );
        })}
      </nav>
      </div>
    </>
  );
}
