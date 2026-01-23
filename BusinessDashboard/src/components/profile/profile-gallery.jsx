import { useState, useEffect } from 'react'
import { useGetBusinessProfileQuery, useUpdateBusinessProfileMutation } from '@/redux/api/businessApi'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react'

export function ProfileGallery() {
  const { data: business, isLoading } = useGetBusinessProfileQuery()
  const [updateProfile, { isLoading: isUpdating }] = useUpdateBusinessProfileMutation()
  
  const [logo, setLogo] = useState(null)
  const [galleryImages, setGalleryImages] = useState([])

  useEffect(() => {
    if (business) {
      setLogo(business.logo || null)
      setGalleryImages(business.galleryImages || [])
    }
  }, [business])

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Create preview
    const reader = new FileReader()
    reader.onload = async (e) => {
      const previewUrl = e.target.result
      setLogo(previewUrl)
      
      // In production, upload to Cloudinary first, then update with URL
      try {
        await updateProfile({ logo: previewUrl }).unwrap()
        alert('Logo updated successfully!')
      } catch (err) {
        console.error('Upload failed:', err)
        alert('Failed to update logo')
      }
    }
    reader.readAsDataURL(file)
  }

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    const newImages = []
    
    for (const file of files) {
      const reader = new FileReader()
      const preview = await new Promise((resolve) => {
        reader.onload = (e) => resolve(e.target.result)
        reader.readAsDataURL(file)
      })
      newImages.push({ url: preview, uploadedAt: new Date() })
    }

    const updatedGallery = [...galleryImages, ...newImages]
    setGalleryImages(updatedGallery)

    try {
      await updateProfile({ galleryImages: updatedGallery }).unwrap()
      alert('Gallery updated successfully!')
    } catch (err) {
      console.error('Upload failed:', err)
      alert('Failed to update gallery')
    }
  }

  const handleRemoveImage = async (index) => {
    const updatedGallery = galleryImages.filter((_, i) => i !== index)
    setGalleryImages(updatedGallery)

    try {
      await updateProfile({ galleryImages: updatedGallery }).unwrap()
    } catch (err) {
      console.error('Remove failed:', err)
      alert('Failed to remove image')
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
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Business Logo</h3>
            <p className="text-sm text-muted-foreground">This will be displayed on your business profile</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="w-32 h-32 rounded-lg bg-secondary border-2 border-dashed border-border flex items-center justify-center overflow-hidden">
              {logo ? (
                <img src={logo} alt="Business logo" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="h-12 w-12 text-muted-foreground" />
              )}
            </div>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="bg-transparent"
                onClick={() => document.getElementById('logo-upload').click()}
                disabled={isUpdating}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload New Logo
              </Button>
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <p className="text-xs text-muted-foreground">Recommended: Square image, at least 400x400px</p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Photo Gallery</h3>
              <p className="text-sm text-muted-foreground">Showcase your business with high-quality images</p>
            </div>
            <Button 
              onClick={() => document.getElementById('gallery-upload').click()}
              disabled={isUpdating}
            >
              <Upload className="h-4 w-4 mr-2" />
              Add Photos
            </Button>
            <input
              id="gallery-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={handleGalleryUpload}
              className="hidden"
            />
          </div>

          {galleryImages.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {galleryImages.map((img, index) => (
                <div key={index} className="relative aspect-square rounded-lg bg-muted group overflow-hidden">
                  <img src={img.url || img} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button 
                      size="icon" 
                      variant="destructive" 
                      onClick={() => handleRemoveImage(index)} 
                      className="rounded-full"
                      disabled={isUpdating}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <div 
                className="aspect-square rounded-lg border-2 border-dashed border-border bg-secondary/50 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => document.getElementById('gallery-upload').click()}
              >
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Add more</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
              <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground mb-4">No gallery images yet</p>
              <Button 
                variant="outline"
                onClick={() => document.getElementById('gallery-upload').click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Images
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

export default ProfileGallery
