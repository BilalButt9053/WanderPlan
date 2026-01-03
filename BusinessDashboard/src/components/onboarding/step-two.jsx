import { useState } from 'react';
import { Button } from '../ui/button';
import { Upload, X } from 'lucide-react';
import { Label } from '../ui/label';

export function OnboardingStepTwo({ formData, updateFormData }) {
  const [previewImages, setPreviewImages] = useState([]);

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      updateFormData({ logo: file });
    }
  };

  const handleGalleryUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newImages = files.map((file) => URL.createObjectURL(file));
      setPreviewImages([...previewImages, ...newImages]);
      updateFormData({
        galleryImages: [...(formData.galleryImages || []), ...files],
      });
    }
  };

  const handleRemove = (index) => {
    const newPreviewImages = previewImages.filter((_, i) => i !== index);
    const newGalleryImages = formData.galleryImages.filter((_, i) => i !== index);
    setPreviewImages(newPreviewImages);
    updateFormData({ galleryImages: newGalleryImages });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Upload Gallery</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Add photos of your business, products, or services
        </p>
      </div>

      {/* Logo Upload */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Business Logo</Label>
        <label
          htmlFor="logo-upload"
          className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center gap-3 hover:border-primary/50 transition-colors cursor-pointer bg-secondary/50"
        >
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <Upload className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">Click to upload logo</p>
            <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
          </div>
          <input
            id="logo-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleLogoUpload}
          />
        </label>
      </div>

      {/* Gallery Upload */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Gallery Images</Label>
        <label
          htmlFor="gallery-upload"
          className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center gap-3 hover:border-primary/50 transition-colors cursor-pointer bg-secondary/50"
        >
          <Upload className="h-10 w-10 text-muted-foreground" />
          <div className="text-center">
            <p className="text-sm font-medium">Upload business photos</p>
            <p className="text-xs text-muted-foreground">Add up to 20 images</p>
          </div>
          <Button variant="outline" size="sm" type="button">
            Browse Files
          </Button>
          <input
            id="gallery-upload"
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleGalleryUpload}
          />
        </label>

        {/* Preview Grid */}
        {previewImages.length > 0 && (
          <div className="grid grid-cols-4 gap-3 mt-4">
            {previewImages.map((img, index) => (
              <div
                key={index}
                className="relative aspect-square rounded-lg bg-muted group"
              >
                <img
                  src={img}
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-destructive flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4 text-destructive-foreground" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
