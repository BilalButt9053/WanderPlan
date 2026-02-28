import { useState, useEffect } from 'react'
import { 
  useCreateDealMutation, 
  useUpdateDealMutation, 
  useUploadGalleryImagesMutation,
  useGetMenuItemsQuery 
} from '@/redux/api/businessApi'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select'
import { ArrowLeft, Loader2, X, ImageIcon, Tag, Megaphone, Check } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function DealForm({ deal, onClose }) {
  const [createDeal, { isLoading: isCreating }] = useCreateDealMutation()
  const [updateDeal, { isLoading: isUpdating }] = useUpdateDealMutation()
  const [uploadImages, { isLoading: isUploading }] = useUploadGalleryImagesMutation()
  const { data: menuItemsData } = useGetMenuItemsQuery({})

  const isEditing = !!deal
  const isLoading = isCreating || isUpdating
  const menuItems = menuItemsData?.items || []

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'deal',
    discountType: 'percentage',
    discountValue: '',
    menuItems: [],
    image: null,
    startDate: '',
    endDate: '',
    terms: '',
    usageLimit: '',
    code: '',
    isFeatured: false,
  })

  useEffect(() => {
    if (deal) {
      setFormData({
        title: deal.title || '',
        description: deal.description || '',
        type: deal.type || 'deal',
        discountType: deal.discountType || 'percentage',
        discountValue: deal.discountValue?.toString() || '',
        menuItems: deal.menuItems?.map(m => m._id || m) || [],
        image: deal.image || null,
        startDate: deal.startDate ? formatDateForInput(deal.startDate) : '',
        endDate: deal.endDate ? formatDateForInput(deal.endDate) : '',
        terms: deal.terms || '',
        usageLimit: deal.usageLimit?.toString() || '',
        code: deal.code || '',
        isFeatured: deal.isFeatured || false,
      })
    }
  }, [deal])

  const formatDateForInput = (dateString) => {
    const date = new Date(dateString)
    return date.toISOString().split('T')[0]
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    try {
      const result = await uploadImages([files[0]]).unwrap()
      if (result.images?.[0]) {
        setFormData(prev => ({
          ...prev,
          image: {
            url: result.images[0].url,
            publicId: result.images[0].publicId
          }
        }))
      }
    } catch (err) {
      console.error('Upload failed:', err)
      alert('Failed to upload image')
    }
  }

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image: null }))
  }

  const toggleMenuItem = (itemId) => {
    setFormData(prev => ({
      ...prev,
      menuItems: prev.menuItems.includes(itemId)
        ? prev.menuItems.filter(id => id !== itemId)
        : [...prev.menuItems, itemId]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      alert('Title is required')
      return
    }

    if (!formData.startDate || !formData.endDate) {
      alert('Start date and end date are required')
      return
    }

    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      alert('End date must be after start date')
      return
    }

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      type: formData.type,
      discountType: formData.discountType,
      discountValue: formData.discountValue ? parseFloat(formData.discountValue) : 0,
      menuItems: formData.menuItems,
      image: formData.image,
      startDate: formData.startDate,
      endDate: formData.endDate,
      terms: formData.terms.trim(),
      usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
      code: formData.code.trim() || null,
      isFeatured: formData.isFeatured,
    }

    try {
      if (isEditing) {
        await updateDeal({ id: deal._id, ...payload }).unwrap()
        alert('Deal updated successfully!')
      } else {
        await createDeal(payload).unwrap()
        alert('Deal created successfully!')
      }
      onClose()
    } catch (err) {
      console.error('Save failed:', err)
      alert(err?.data?.message || 'Failed to save deal')
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
            {isEditing ? 'Edit Deal' : 'Create New Deal'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isEditing ? 'Update deal details' : 'Set up a promotional deal or ad'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Type Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div
            onClick={() => handleSelectChange('type', 'deal')}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              formData.type === 'deal'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                formData.type === 'deal' ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                <Tag className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Deal</p>
                <p className="text-xs text-muted-foreground">Offer discounts to customers</p>
              </div>
            </div>
          </div>
          <div
            onClick={() => handleSelectChange('type', 'ad')}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              formData.type === 'ad'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                formData.type === 'ad' ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                <Megaphone className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Advertisement</p>
                <p className="text-xs text-muted-foreground">Promote your business</p>
              </div>
            </div>
          </div>
        </div>

        {/* Image Upload */}
        <div className="space-y-2">
          <Label>Deal Image</Label>
          <div className="flex items-start gap-4">
            {formData.image ? (
              <div className="w-32 h-32 rounded-lg bg-muted border overflow-hidden relative group">
                <img 
                  src={formData.image.url} 
                  alt="Deal"
                  className="w-full h-full object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handleRemoveImage}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div 
                className="w-32 h-32 rounded-lg bg-muted border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => document.getElementById('deal-image').click()}
              >
                {isUploading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground mt-2">Upload Image</span>
                  </>
                )}
              </div>
            )}
            <div className="text-sm text-muted-foreground">
              <p>Recommended: 1200x630px</p>
              <p className="mt-1">This image will be shown in the deal card.</p>
            </div>
          </div>
          <input
            id="deal-image"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            disabled={isUploading}
          />
        </div>

        {/* Basic Info */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Summer Sale - 30% Off"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your deal..."
              rows={3}
            />
          </div>
        </div>

        {/* Discount Settings (for deals) */}
        {formData.type === 'deal' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Discount Type</Label>
              <Select
                value={formData.discountType}
                onValueChange={(val) => handleSelectChange('discountType', val)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                  <SelectItem value="buyOneGetOne">Buy One Get One</SelectItem>
                  <SelectItem value="freeItem">Free Item</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {['percentage', 'fixed'].includes(formData.discountType) && (
              <div className="space-y-2">
                <Label htmlFor="discountValue">
                  {formData.discountType === 'percentage' ? 'Discount (%)' : 'Discount Amount'}
                </Label>
                <Input
                  id="discountValue"
                  name="discountValue"
                  type="number"
                  min="0"
                  max={formData.discountType === 'percentage' ? '100' : undefined}
                  value={formData.discountValue}
                  onChange={handleChange}
                  placeholder={formData.discountType === 'percentage' ? '30' : '10.00'}
                />
              </div>
            )}
          </div>
        )}

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date *</Label>
            <Input
              id="startDate"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">End Date *</Label>
            <Input
              id="endDate"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Promo Code */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="code">Promo Code (Optional)</Label>
            <Input
              id="code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="e.g., SUMMER30"
              className="uppercase"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="usageLimit">Usage Limit (Optional)</Label>
            <Input
              id="usageLimit"
              name="usageLimit"
              type="number"
              min="1"
              value={formData.usageLimit}
              onChange={handleChange}
              placeholder="Unlimited"
            />
          </div>
        </div>

        {/* Link to Menu Items */}
        {menuItems.length > 0 && (
          <div className="space-y-2">
            <Label>Apply to Menu Items (Optional)</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Select specific items this deal applies to, or leave empty to apply to all items.
            </p>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 rounded-lg border bg-muted/30">
              {menuItems.map((item) => (
                <Badge
                  key={item._id}
                  variant={formData.menuItems.includes(item._id) ? 'default' : 'outline'}
                  className="cursor-pointer transition-all"
                  onClick={() => toggleMenuItem(item._id)}
                >
                  {formData.menuItems.includes(item._id) && (
                    <Check className="h-3 w-3 mr-1" />
                  )}
                  {item.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Terms */}
        <div className="space-y-2">
          <Label htmlFor="terms">Terms & Conditions</Label>
          <Textarea
            id="terms"
            name="terms"
            value={formData.terms}
            onChange={handleChange}
            placeholder="e.g., Valid for dine-in only. Cannot be combined with other offers."
            rows={2}
          />
        </div>

        {/* Featured */}
        <div className="flex items-center justify-between py-3 px-4 rounded-lg border bg-muted/30">
          <div>
            <p className="font-medium">Featured Deal</p>
            <p className="text-sm text-muted-foreground">
              Show this deal prominently on your business page
            </p>
          </div>
          <Switch
            checked={formData.isFeatured}
            onCheckedChange={(checked) => handleSelectChange('isFeatured', checked)}
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isEditing ? 'Update Deal' : 'Create Deal'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
