import { useState, useEffect } from 'react'
import { useGetBusinessProfileQuery, useUpdateBusinessProfileMutation } from '@/redux/api/businessApi'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import Switch from '@/components/ui/switch'
import { Loader2 } from 'lucide-react'

export function ProfileInfo() {
  const { data: business, isLoading, error } = useGetBusinessProfileQuery()
  const [updateProfile, { isLoading: isUpdating }] = useUpdateBusinessProfileMutation()
  
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: 'other',
    description: '',
    phone: '',
    website: '',
  })

  // Load business data into form when it's available
  useEffect(() => {
    if (business) {
      setFormData({
        businessName: business.businessName || '',
        businessType: business.businessType || 'other',
        description: business.description || '',
        phone: business.phone || '',
        website: business.website || '',
      })
    }
  }, [business])

  const handleChange = (e) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await updateProfile(formData).unwrap()
      alert('Profile updated successfully!')
    } catch (err) {
      console.error('Update failed:', err)
      alert(err?.data?.message || 'Failed to update profile')
    }
  }

  const handleCancel = () => {
    if (business) {
      setFormData({
        businessName: business.businessName || '',
        businessType: business.businessType || 'other',
        description: business.description || '',
        phone: business.phone || '',
        website: business.website || '',
      })
    }
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center py-12 text-destructive">
          Failed to load profile data
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name</Label>
            <Input 
              id="businessName" 
              value={formData.businessName}
              onChange={handleChange}
              className="bg-secondary" 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessType">Category</Label>
            <select 
              id="businessType"
              value={formData.businessType}
              onChange={handleChange}
              className="w-full bg-secondary p-2 rounded border border-input"
            >
              <option value="hotel">Hotel</option>
              <option value="restaurant">Restaurant</option>
              <option value="attraction">Attraction</option>
              <option value="entertainment">Entertainment</option>
              <option value="shopping">Shopping</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              value={formData.description}
              onChange={handleChange}
              className="bg-secondary min-h-[120px]" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone" 
                type="tel" 
                value={formData.phone}
                onChange={handleChange}
                className="bg-secondary" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Contact Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={business?.email || ''}
                disabled
                className="bg-secondary opacity-60" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input 
              id="website" 
              type="url" 
              value={formData.website}
              onChange={handleChange}
              placeholder="https://example.com"
              className="bg-secondary" 
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button 
            type="button"
            variant="outline" 
            onClick={handleCancel}
            disabled={isUpdating}
            className="bg-transparent"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isUpdating}>
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </form>
    </Card>
  )
}

export default ProfileInfo
