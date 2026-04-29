import {
  BedDouble,
  Building2,
  LayoutDashboard,
  Settings,
  ShoppingBag,
  Star,
  Tag,
  Ticket,
} from 'lucide-react'

export const RESTAURANT_TYPES = ['restaurant']
export const HOTEL_TYPES = ['hotel']
export const ACTIVITY_TYPES = ['activity', 'attraction', 'tour']

export function normalizeBusinessType(type) {
  return String(type || 'other').toLowerCase()
}

export function businessTypeGroup(type) {
  const normalized = normalizeBusinessType(type)
  if (RESTAURANT_TYPES.includes(normalized)) return 'restaurant'
  if (HOTEL_TYPES.includes(normalized)) return 'hotel'
  if (ACTIVITY_TYPES.includes(normalized)) return 'activity'
  return 'other'
}

export function getCategoryFeature(type) {
  const group = businessTypeGroup(type)
  if (group === 'restaurant') {
    return { name: 'Menu Items', href: '/dashboard/menu', icon: ShoppingBag, allowedTypes: RESTAURANT_TYPES }
  }
  if (group === 'hotel') {
    return { name: 'Rooms', href: '/dashboard/rooms', icon: BedDouble, allowedTypes: HOTEL_TYPES }
  }
  if (group === 'activity') {
    return { name: 'Activities & Packages', href: '/dashboard/activities', icon: Ticket, allowedTypes: ACTIVITY_TYPES }
  }
  return null
}

export function getBusinessNavigation(type) {
  const categoryFeature = getCategoryFeature(type)
  return [
    { name: 'Dashboard & Analytics', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Business Profile', href: '/dashboard/profile', icon: Building2 },
    ...(categoryFeature ? [categoryFeature] : []),
    { name: 'Deals & Ads', href: '/dashboard/deals', icon: Tag },
    { name: 'Reviews', href: '/dashboard/reviews', icon: Star },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ]
}

export function isTypeAllowed(type, allowedTypes) {
  if (!allowedTypes?.length) return true
  return allowedTypes.includes(normalizeBusinessType(type))
}
