import { useState, useEffect } from 'react'
import { useGetBusinessProfileQuery, useUpdateBusinessProfileMutation } from '@/redux/api/businessApi'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import MapPreview from '@/components/location/map-preview'

export function ProfileLocation() {
  const { data: business, isLoading } = useGetBusinessProfileQuery()
  const [updateProfile, { isLoading: isUpdating }] = useUpdateBusinessProfileMutation()
  
  const [formData, setFormData] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    latitude: '',
    longitude: '',
  })
  const [isLocating, setIsLocating] = useState(false)

  useEffect(() => {
    if (business?.address) {
      setFormData({
        street: business.address.street || '',
        city: business.address.city || '',
        state: business.address.state || '',
        zipCode: business.address.zipCode || '',
        country: business.address.country || '',
        latitude: business.location?.latitude ?? business.address?.coordinates?.lat ?? '',
        longitude: business.location?.longitude ?? business.address?.coordinates?.lng ?? '',
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
      await updateProfile({
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
          coordinates: {
            lat: formData.latitude === '' ? null : Number(formData.latitude),
            lng: formData.longitude === '' ? null : Number(formData.longitude),
          },
        },
        location: {
          address: formData.street,
          city: formData.city,
          country: formData.country,
          latitude: formData.latitude === '' ? null : Number(formData.latitude),
          longitude: formData.longitude === '' ? null : Number(formData.longitude),
        }
      }).unwrap()
      toast.success('Location updated successfully')
    } catch (err) {
      console.error('Update failed:', err)
      toast.error(err?.data?.message || 'Failed to update location')
    }
  }

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Location is not supported by this browser')
      return
    }

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        }))
        toast.success('Business location pinned')
        setIsLocating(false)
      },
      () => {
        toast.error('Location permission denied. You can enter coordinates manually.')
        setIsLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleCancel = () => {
    if (business?.address) {
      setFormData({
        street: business.address.street || '',
        city: business.address.city || '',
        state: business.address.state || '',
        zipCode: business.address.zipCode || '',
        country: business.address.country || '',
        latitude: business.location?.latitude ?? business.address?.coordinates?.lat ?? '',
        longitude: business.location?.longitude ?? business.address?.coordinates?.lng ?? '',
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

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold">Business Location</h3>
          <p className="text-sm text-muted-foreground mt-1">Update your business address</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="street">Street Address</Label>
            <Input 
              id="street" 
              value={formData.street}
              onChange={handleChange}
              className="bg-secondary" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                value={formData.latitude}
                onChange={handleChange}
                className="bg-secondary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                value={formData.longitude}
                onChange={handleChange}
                className="bg-secondary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input 
                id="city" 
                value={formData.city}
                onChange={handleChange}
                className="bg-secondary" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input 
                id="state" 
                value={formData.state}
                onChange={handleChange}
                className="bg-secondary" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="zipCode">ZIP Code</Label>
              <Input 
                id="zipCode" 
                value={formData.zipCode}
                onChange={handleChange}
                className="bg-secondary" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input 
                id="country" 
                value={formData.country}
                onChange={handleChange}
                className="bg-secondary" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Map Preview</Label>
            <MapPreview
              latitude={formData.latitude}
              longitude={formData.longitude}
              onUseCurrentLocation={handleUseCurrentLocation}
              isLocating={isLocating}
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
              'Save Location'
            )}
          </Button>
        </div>
      </form>
    </Card>
  )
}

export default ProfileLocation
