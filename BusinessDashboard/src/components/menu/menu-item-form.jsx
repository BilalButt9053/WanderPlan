import { useState, useEffect } from 'react'
import { useCreateMenuItemMutation, useUpdateMenuItemMutation, useUploadGalleryImagesMutation } from '@/redux/api/businessApi'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, Loader2, Upload, X, ImageIcon, Plus } from 'lucide-react'

export default function MenuItemForm({ item, onClose }) {
  const [createItem, { isLoading: isCreating }] = useCreateMenuItemMutation()
  const [updateItem, { isLoading: isUpdating }] = useUpdateMenuItemMutation()
  const [uploadImages, { isLoading: isUploading }] = useUploadGalleryImagesMutation()

  const isEditing = !!item
  const isLoading = isCreating || isUpdating

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discountedPrice: '',
    category: '',
    tags: '',
    isAvailable: true,
    isFeatured: false,
    images: []
  })

  useEffect(() => {
    if (item) {
      // Support both old single image and new images array
      const images = item.images?.length > 0 ? item.images : (item.image?.url ? [item.image] : [])
      setFormData({
        name: item.name || '',
        description: item.description || '',
        price: item.price?.toString() || '',
        discountedPrice: item.discountedPrice?.toString() || '',
        category: item.category || '',
        tags: item.tags?.join(', ') || '',
        isAvailable: item.isAvailable !== false,
        isFeatured: item.isFeatured || false,
        images: images
      })
    }
  }, [item])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    if (formData.images.length + files.length > 5) {
      alert('You can upload up to 5 images per item')
      return
    }

    try {
      // Upload to Cloudinary using the gallery endpoint
      const result = await uploadImages(files).unwrap()
      const newImages = result.images.map(img => ({
        url: img.url,
        publicId: img.publicId
      }))
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }))
    } catch (err) {
      console.error('Upload failed:', err)
      alert('Failed to upload images')
    }
  }

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.price) {
      alert('Name and price are required')
      return
    }

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: parseFloat(formData.price),
      discountedPrice: formData.discountedPrice ? parseFloat(formData.discountedPrice) : null,
      category: formData.category.trim() || 'General',
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      isAvailable: formData.isAvailable,
      isFeatured: formData.isFeatured,
      images: formData.images
    }

    try {
      if (isEditing) {
        await updateItem({ id: item._id, ...payload }).unwrap()
        alert('Item updated successfully!')
      } else {
        await createItem(payload).unwrap()
        alert('Item created successfully!')
      }
      onClose()
    } catch (err) {
      console.error('Save failed:', err)
      alert('Failed to save item')
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={onClose}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-xl font-semibold">
            {isEditing ? 'Edit Item' : 'Add New Item'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isEditing ? 'Update item details' : 'Add a new item to your menu'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload */}
        <div className="space-y-2">
          <Label>Item Images (up to 5)</Label>
          <div className="flex flex-wrap gap-3">
            {formData.images.map((img, index) => (
              <div key={index} className="w-24 h-24 rounded-lg bg-muted border overflow-hidden relative group">
                <img 
                  src={img.url} 
                  alt={`Item ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemoveImage(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
            {formData.images.length < 5 && (
              <div 
                className="w-24 h-24 rounded-lg bg-muted border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => document.getElementById('item-images').click()}
              >
                {isUploading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <Plus className="h-6 w-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground mt-1">Add</span>
                  </>
                )}
              </div>
            )}
          </div>
          <input
            id="item-images"
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
            disabled={isUploading}
          />
          <p className="text-xs text-muted-foreground">
            Upload up to 5 images. First image will be the cover.
          </p>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Item Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Grilled Salmon"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="e.g., Main Course, Appetizers"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your item..."
            rows={3}
          />
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Price ($) *</Label>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={handleChange}
              placeholder="0.00"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="discountedPrice">Discounted Price ($)</Label>
            <Input
              id="discountedPrice"
              name="discountedPrice"
              type="number"
              step="0.01"
              min="0"
              value={formData.discountedPrice}
              onChange={handleChange}
              placeholder="Leave empty if no discount"
            />
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label htmlFor="tags">Tags</Label>
          <Input
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="e.g., vegetarian, spicy, gluten-free (comma separated)"
          />
          <p className="text-xs text-muted-foreground">
            Separate multiple tags with commas
          </p>
        </div>

        {/* Toggles */}
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex items-center gap-3">
            <Switch
              id="isAvailable"
              checked={formData.isAvailable}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isAvailable: checked }))}
            />
            <Label htmlFor="isAvailable" className="cursor-pointer">
              Available for sale
            </Label>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              id="isFeatured"
              checked={formData.isFeatured}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFeatured: checked }))}
            />
            <Label htmlFor="isFeatured" className="cursor-pointer">
              Featured item
            </Label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isEditing ? 'Update Item' : 'Create Item'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
