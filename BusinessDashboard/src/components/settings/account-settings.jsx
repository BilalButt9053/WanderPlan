import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Loader2 } from 'lucide-react'
import { 
  useGetBusinessProfileQuery, 
  useUpdateBusinessProfileMutation,
  useChangePasswordMutation,
  useUploadLogoMutation
} from '@/redux/api/businessApi'

export function AccountSettings() {
  const { data: profile, isLoading: isLoadingProfile } = useGetBusinessProfileQuery()
  const [updateProfile, { isLoading: isUpdating }] = useUpdateBusinessProfileMutation()
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation()
  const [uploadLogo, { isLoading: isUploadingLogo }] = useUploadLogoMutation()

  const [formData, setFormData] = useState({
    ownerName: '',
    email: '',
    phone: '',
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        ownerName: profile.ownerName || '',
        email: profile.email || '',
        phone: profile.phone || '',
      })
    }
  }, [profile])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({ ...prev, [name]: value }))
  }

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      await uploadLogo(file).unwrap()
      alert('Profile photo updated successfully!')
    } catch (err) {
      console.error('Upload failed:', err)
      alert(err?.data?.message || 'Failed to upload photo')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      await updateProfile({
        ownerName: formData.ownerName,
        phone: formData.phone,
      }).unwrap()
      alert('Profile updated successfully!')
    } catch (err) {
      console.error('Update failed:', err)
      alert(err?.data?.message || 'Failed to update profile')
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()

    if (!passwordData.currentPassword || !passwordData.newPassword) {
      alert('Please fill in all password fields')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 6) {
      alert('New password must be at least 6 characters')
      return
    }

    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      }).unwrap()
      alert('Password changed successfully!')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      console.error('Password change failed:', err)
      alert(err?.data?.message || 'Failed to change password')
    }
  }

  const getInitials = () => {
    if (!profile?.ownerName) return 'U'
    return profile.ownerName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Profile Picture</h3>
            <p className="text-sm text-muted-foreground">Update your profile photo</p>
          </div>

          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile?.logo} />
              <AvatarFallback>{getInitials()}</AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="bg-transparent"
                onClick={() => document.getElementById('logo-upload').click()}
                disabled={isUploadingLogo}
              >
                {isUploadingLogo ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading...</>
                ) : (
                  'Upload New Photo'
                )}
              </Button>
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max size 2MB.</p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
            <p className="text-sm text-muted-foreground">Update your account details</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ownerName">Full Name</Label>
            <Input 
              id="ownerName" 
              name="ownerName"
              value={formData.ownerName}
              onChange={handleChange}
              className="bg-secondary" 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input 
              id="email" 
              name="email"
              type="email" 
              value={formData.email}
              disabled
              className="bg-secondary opacity-50" 
            />
            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input 
              id="phone" 
              name="phone"
              type="tel" 
              value={formData.phone}
              onChange={handleChange}
              className="bg-secondary" 
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" type="button" className="bg-transparent" onClick={() => {
              if (profile) {
                setFormData({
                  ownerName: profile.ownerName || '',
                  email: profile.email || '',
                  phone: profile.phone || '',
                })
              }
            }}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </Card>

      <Card className="p-6">
        <form onSubmit={handlePasswordSubmit} className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Change Password</h3>
            <p className="text-sm text-muted-foreground">Update your password regularly for security</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input 
                id="currentPassword" 
                name="currentPassword"
                type="password" 
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="bg-secondary" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input 
                id="newPassword" 
                name="newPassword"
                type="password" 
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="bg-secondary" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input 
                id="confirmPassword" 
                name="confirmPassword"
                type="password" 
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className="bg-secondary" 
              />
            </div>
          </div>

          <Button type="submit" disabled={isChangingPassword}>
            {isChangingPassword ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Updating...</>
            ) : (
              'Update Password'
            )}
          </Button>
        </form>
      </Card>
    </div>
  )
}

export default AccountSettings
