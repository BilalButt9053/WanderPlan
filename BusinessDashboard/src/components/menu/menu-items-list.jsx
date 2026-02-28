import { useState } from 'react'
import { useGetMenuItemsQuery, useDeleteMenuItemMutation, useUpdateMenuItemMutation } from '@/redux/api/businessApi'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Loader2, 
  Package,
  MoreVertical,
  Eye,
  EyeOff
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import MenuItemForm from './menu-item-form'
import ImageSlider from './image-slider'

export default function MenuItemsList() {
  const { data, isLoading, refetch } = useGetMenuItemsQuery()
  const [deleteItem, { isLoading: isDeleting }] = useDeleteMenuItemMutation()
  const [updateItem] = useUpdateMenuItemMutation()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)

  const items = data?.items || []
  
  // Get unique categories
  const categories = ['all', ...new Set(items.map(item => item.category))]
  
  // Filter items
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return
    
    try {
      await deleteItem(id).unwrap()
      refetch()
    } catch (err) {
      console.error('Delete failed:', err)
      alert('Failed to delete item')
    }
  }

  const handleToggleAvailability = async (item) => {
    try {
      await updateItem({ id: item._id, isAvailable: !item.isAvailable }).unwrap()
      refetch()
    } catch (err) {
      console.error('Update failed:', err)
      alert('Failed to update item')
    }
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingItem(null)
    refetch()
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

  if (showForm) {
    return (
      <MenuItemForm 
        item={editingItem} 
        onClose={handleFormClose}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-1 gap-4 items-center w-full sm:w-auto">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </Card>

      {/* Items Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filteredItems.map((item) => {
            // Support both old single image and new images array
            const images = item.images?.length > 0 ? item.images : (item.image?.url ? [item.image] : [])
            
            return (
            <Card key={item._id} className="overflow-hidden flex flex-col">
              {/* Image Slider - Fixed height container */}
              <div className="aspect-square bg-muted relative flex-shrink-0">
                {images.length > 0 ? (
                  <ImageSlider images={images} className="absolute inset-0" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Package className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                )}
                {!item.isAvailable && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center pointer-events-none z-10">
                    <Badge variant="secondary" className="text-xs">Unavailable</Badge>
                  </div>
                )}
                {item.isFeatured && (
                  <Badge className="absolute top-1 left-1 bg-yellow-500 text-xs px-1 py-0 z-10">★</Badge>
                )}
              </div>

              {/* Content */}
              <div className="p-2">
                <div className="flex items-start justify-between gap-1">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{item.name}</h3>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(item)}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleAvailability(item)}>
                        {item.isAvailable ? (
                          <>
                            <EyeOff className="h-4 w-4 mr-2" />
                            Mark Unavailable
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-2" />
                            Mark Available
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => handleDelete(item._id)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-1 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {item.discountedPrice ? (
                      <>
                        <span className="font-bold text-sm text-primary">${item.discountedPrice.toFixed(2)}</span>
                        <span className="text-xs text-muted-foreground line-through">${item.price.toFixed(2)}</span>
                      </>
                    ) : (
                      <span className="font-bold text-sm">${item.price.toFixed(2)}</span>
                    )}
                  </div>
                </div>

                <Badge variant="outline" className="mt-1 text-xs px-1 py-0">{item.category}</Badge>
              </div>
            </Card>
          )})
        }</div>
      ) : (
        <Card className="p-12">
          <div className="text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No items found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Start by adding your first menu item'}
            </p>
            {!searchQuery && selectedCategory === 'all' && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Item
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
