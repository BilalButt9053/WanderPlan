import { useState, useEffect } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';

export function ImageUpload({ 
  label, 
  value, 
  onChange, 
  multiple = false, 
  maxFiles = 10,
  accept = 'image/*',
  description,
  uploadEndpoint = null, // Optional: API endpoint for immediate upload
}) {
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState([]);

  // Initialize previews from value prop
  useEffect(() => {
    if (value) {
      const items = Array.isArray(value) ? value : [value];
      setPreviews(items.filter(Boolean));
    } else {
      setPreviews([]);
    }
  }, [value]);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    
    if (!files.length) return;

    // Validate file count
    if (multiple && previews.length + files.length > maxFiles) {
      alert(`You can only upload up to ${maxFiles} images`);
      return;
    }

    if (!multiple && files.length > 1) {
      alert('You can only upload one image');
      return;
    }

    setUploading(true);

    try {
      // If uploadEndpoint is provided, upload immediately to Cloudinary
      if (uploadEndpoint) {
        const uploadedItems = [];
        
        for (const file of files) {
          const formData = new FormData();
          if (multiple) {
            formData.append('images', file);
          } else {
            formData.append(uploadEndpoint.includes('logo') ? 'logo' : 'document', file);
          }

          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}${uploadEndpoint}`, {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error('Upload failed');
          }

          const data = await response.json();
          uploadedItems.push({
            url: multiple ? data.images?.[0]?.url : data.url,
            publicId: multiple ? data.images?.[0]?.publicId : data.publicId,
            name: file.name,
          });
        }

        if (multiple) {
          const allItems = [...previews, ...uploadedItems];
          setPreviews(allItems);
          onChange(allItems);
        } else {
          setPreviews(uploadedItems);
          onChange(uploadedItems[0]);
        }
      } else {
        // No immediate upload - just create preview URLs and store files
        const newPreviews = files.map((file) => {
          const previewUrl = URL.createObjectURL(file);
          return {
            url: previewUrl,
            file: file,
            name: file.name,
          };
        });

        if (multiple) {
          const allPreviews = [...previews, ...newPreviews];
          setPreviews(allPreviews);
          onChange(allPreviews);
        } else {
          setPreviews(newPreviews);
          onChange(newPreviews[0]);
        }
      }
    } catch (error) {
      console.error('File upload error:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (index) => {
    // Revoke object URL to free memory
    if (previews[index]?.url && previews[index].url.startsWith('blob:')) {
      URL.revokeObjectURL(previews[index].url);
    }

    if (multiple) {
      const newPreviews = previews.filter((_, i) => i !== index);
      setPreviews(newPreviews);
      onChange(newPreviews);
    } else {
      setPreviews([]);
      onChange(null);
    }
  };

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      previews.forEach(preview => {
        if (preview?.url && preview.url.startsWith('blob:')) {
          URL.revokeObjectURL(preview.url);
        }
      });
    };
  }, []);

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      {/* Upload Button */}
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          disabled={uploading || (!multiple && previews.length > 0)}
          onClick={() => document.getElementById(multiple ? 'multi-file-upload' : 'single-file-upload').click()}
          className="w-full sm:w-auto"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              {multiple ? 'Select Images' : 'Select Image'}
            </>
          )}
        </Button>

        <input
          id={multiple ? 'multi-file-upload' : 'single-file-upload'}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
        />

        {multiple && previews.length > 0 && (
          <span className="text-sm text-muted-foreground">
            {previews.length} / {maxFiles} files
          </span>
        )}
      </div>

      {/* Image Previews */}
      {previews.length > 0 && (
        <div className={`grid gap-4 ${multiple ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4' : 'grid-cols-1 max-w-xs'}`}>
          {previews.map((preview, index) => (
            <div key={index} className="relative group">
              {accept.includes('image') ? (
                <img
                  src={preview.url || preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-border"
                />
              ) : (
                <div className="w-full h-32 flex items-center justify-center rounded-lg border border-border bg-muted">
                  <div className="text-center px-2">
                    <p className="text-xs text-muted-foreground truncate">{preview.name}</p>
                  </div>
                </div>
              )}
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
