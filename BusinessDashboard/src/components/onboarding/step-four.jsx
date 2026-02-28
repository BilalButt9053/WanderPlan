import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { MapPin } from 'lucide-react';

export function OnboardingStepFour({ formData, updateFormData }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Business Location</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Help customers find you by adding your location
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="address">Street Address</Label>
          <Input
            id="address"
            name="address"
            placeholder="House 123, Street 45, Block A"
            className="bg-secondary"
            value={formData.address}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              name="city"
              placeholder="Lahore"
              className="bg-secondary"
              value={formData.city}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">Province</Label>
            <Input
              id="state"
              name="state"
              placeholder="Punjab"
              className="bg-secondary"
              value={formData.state}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="zipCode">Postal Code</Label>
            <Input
              id="zipCode"
              name="zipCode"
              placeholder="54000"
              className="bg-secondary"
              value={formData.zipCode}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              name="country"
              placeholder="Pakistan"
              className="bg-secondary"
              value={formData.country}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Map Placeholder */}
        <div className="space-y-2">
          <Label>Location on Map</Label>
          <div className="w-full h-64 rounded-lg bg-muted flex items-center justify-center border border-border">
            <div className="text-center space-y-2">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">Map will appear here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
