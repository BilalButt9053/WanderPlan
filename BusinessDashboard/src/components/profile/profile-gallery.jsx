import { useState, useEffect } from 'react'
import { useGetBusinessProfileQuery, useUpdateBusinessProfileMutation, useUploadLogoMutation, useUploadGalleryImagesMutation } from '@/redux/api/businessApi'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, X, ImageIcon, Loader2, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'

export function ProfileGallery() {
  const { data: business, isLoading, refetch } = useGetBusinessProfileQuery()
  const [updateProfile, { isLoading: isUpdating }] = useUpdateBusinessProfileMutation()
  const [uploadLogo, { isLoading: isUploadingLogo }] = useUploadLogoMutation()
  const [uploadGalleryImages, { isLoading: isUploadingGallery }] = useUploadGalleryImagesMutation()
  
  const [logo, setLogo] = useState(null)
  const [galleryImages, setGalleryImages] = useState([])
  const [selectedIndex, setSelectedIndex] = useState(null)

  useEffect(() => {
    if (business) {
      setLogo(business.logo || null)
      setGalleryImages(business.galleryImages || [])
    }
  }, [business])

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      // Upload to Cloudinary first
      const result = await uploadLogo(file).unwrap()
      
      // Then update business profile with the Cloudinary URL
      await updateProfile({ logo: result.url }).unwrap()
      setLogo(result.url)
      refetch()
      toast.success('Logo updated successfully')
    } catch (err) {
      console.error('Upload failed:', err)
      toast.error('Failed to upload logo')
    }
  }

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    try {
      // Upload to Cloudinary first
      const result = await uploadGalleryImages(files).unwrap()
      
      // Then update profile with the new gallery images
      const newImages = result.images.map(img => ({
        url: img.url,
        publicId: img.publicId,
        uploadedAt: new Date()
      }))
      
      const updatedGallery = [...galleryImages, ...newImages]
      await updateProfile({ galleryImages: updatedGallery }).unwrap()
      setGalleryImages(updatedGallery)
      refetch()
      toast.success('Gallery updated successfully')
    } catch (err) {
      console.error('Upload failed:', err)
      toast.error('Failed to upload gallery images')
    }
  }

  const handleRemoveImage = async (index) => {
    const updatedGallery = galleryImages.filter((_, i) => i !== index)
    setGalleryImages(updatedGallery)

    try {
      await updateProfile({ galleryImages: updatedGallery }).unwrap()
      refetch()
    } catch (err) {
      console.error('Remove failed:', err)
      toast.error('Failed to remove image')
    }
  }

  useEffect(() => {
    if (selectedIndex === null) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setSelectedIndex(null)
      if (event.key === 'ArrowRight') setSelectedIndex((value) => Math.min(galleryImages.length - 1, value + 1))
      if (event.key === 'ArrowLeft') setSelectedIndex((value) => Math.max(0, value - 1))
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedIndex, galleryImages.length])

  const getImageUrl = (img) => typeof img === 'string' ? img : (img?.url || img?.path || '')

  if (isLoading) {
    return (
      <Card className="p-6" data-tutorial="gallery-section">
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
                <img 
                  src={typeof logo === 'object' ? logo.url : logo} 
                  alt="Business logo" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.parentElement.innerHTML = '<div class="flex items-center justify-center w-full h-full"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg></div>'
                  }}
                />
              ) : (
                <ImageIcon className="h-12 w-12 text-muted-foreground" />
              )}
            </div>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="bg-transparent"
                onClick={() => document.getElementById('logo-upload').click()}
                disabled={isUpdating || isUploadingLogo}
              >
                {isUploadingLogo ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                {isUploadingLogo ? 'Uploading...' : 'Upload New Logo'}
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
              disabled={isUpdating || isUploadingGallery}
            >
              {isUploadingGallery ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              {isUploadingGallery ? 'Uploading...' : 'Add Photos'}
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
              {galleryImages.map((img, index) => {
                const imageUrl = getImageUrl(img)
                return (
                <div key={index} className="relative aspect-square rounded-lg bg-muted group overflow-hidden">
                  {imageUrl ? (
                    <button type="button" className="h-full w-full cursor-pointer overflow-hidden" onClick={() => setSelectedIndex(index)}>
                      <img
                        src={imageUrl}
                        alt={`Gallery image ${index + 1}`}
                        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.parentElement?.nextSibling?.classList?.remove('hidden')
                        }}
                      />
                    </button>
                  ) : null}
                  <div className={`absolute inset-0 flex items-center justify-center ${imageUrl ? 'hidden' : ''}`}>
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="pointer-events-none absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Eye className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      size="icon" 
                      variant="destructive" 
                      onClick={(event) => {
                        event.stopPropagation()
                        handleRemoveImage(index)
                      }}
                      className="rounded-full"
                      disabled={isUpdating}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )})}

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

      {selectedIndex !== null && getImageUrl(galleryImages[selectedIndex]) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setSelectedIndex(null)}>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 text-white hover:bg-white/10 hover:text-white"
            onClick={() => setSelectedIndex(null)}
          >
            <X className="h-6 w-6" />
          </Button>
          {selectedIndex > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute left-4 text-white hover:bg-white/10 hover:text-white"
              onClick={(event) => {
                event.stopPropagation()
                setSelectedIndex((value) => value - 1)
              }}
            >
              <ChevronLeft className="h-7 w-7" />
            </Button>
          )}
          <img
            src={getImageUrl(galleryImages[selectedIndex])}
            alt={`Gallery image ${selectedIndex + 1}`}
            className="max-h-[80vh] max-w-[80vw] rounded-lg object-contain shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          />
          {selectedIndex < galleryImages.length - 1 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-4 text-white hover:bg-white/10 hover:text-white"
              onClick={(event) => {
                event.stopPropagation()
                setSelectedIndex((value) => value + 1)
              }}
            >
              <ChevronRight className="h-7 w-7" />
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export default ProfileGallery
