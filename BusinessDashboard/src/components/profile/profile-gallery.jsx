import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, X, ImageIcon } from 'lucide-react'

export function ProfileGallery() {
  const [images, setImages] = useState([
    '/placeholder.svg?height=300&width=400',
    '/placeholder.svg?height=300&width=400',
    '/placeholder.svg?height=300&width=400',
    '/placeholder.svg?height=300&width=400',
    '/placeholder.svg?height=300&width=400',
  ])

  const handleRemove = (index) => setImages(images.filter((_, i) => i !== index))

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Business Logo</h3>
            <p className="text-sm text-muted-foreground">This will be displayed on your business profile</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="w-32 h-32 rounded-lg bg-secondary border-2 border-dashed border-border flex items-center justify-center">
              <ImageIcon className="h-12 w-12 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <Button variant="outline" className="bg-transparent">
                <Upload className="h-4 w-4 mr-2" />
                Upload New Logo
              </Button>
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
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Add Photos
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((img, index) => (
              <div key={index} className="relative aspect-square rounded-lg bg-muted group overflow-hidden">
                <img src={img || '/placeholder.svg'} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button size="icon" variant="destructive" onClick={() => handleRemove(index)} className="rounded-full">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            <div className="aspect-square rounded-lg border-2 border-dashed border-border bg-secondary/50 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 transition-colors">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Add more</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default ProfileGallery
