import { ImageUpload } from './image-upload';

export function OnboardingStepTwo({ formData, updateFormData }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Upload Gallery</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Add photos of your business, products, or services
        </p>
      </div>

      {/* Logo Upload */}
      <ImageUpload
        label="Business Logo"
        description="Upload your business logo (PNG, JPG up to 5MB)"
        value={formData.logo}
        onChange={(url) => updateFormData({ logo: url })}
        multiple={false}
        accept="image/*"
      />

      {/* Gallery Upload */}
      <ImageUpload
        label="Gallery Images"
        description="Add up to 10 images showcasing your business"
        value={formData.galleryImages || []}
        onChange={(urls) => updateFormData({ galleryImages: urls })}
        multiple={true}
        maxFiles={10}
        accept="image/*"
      />
    </div>
  );
}

