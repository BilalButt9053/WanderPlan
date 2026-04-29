import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useState } from 'react';
import MapPreview from '@/components/location/map-preview';

export function OnboardingStepFour({ formData, updateFormData }) {
  const [locationState, setLocationState] = useState({ loading: false, message: '', error: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationState({ loading: false, message: '', error: 'Location is not supported by this browser.' });
      return;
    }

    setLocationState({ loading: true, message: '', error: '' });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateFormData({
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        });
        setLocationState({ loading: false, message: 'Location captured. You can still edit the address manually.', error: '' });
      },
      () => {
        setLocationState({ loading: false, message: '', error: 'Location permission denied. You can enter your address manually.' });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
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

        

        <div className="space-y-2">
          <Label>Location on Map</Label>
          <MapPreview
            latitude={formData.latitude}
            longitude={formData.longitude}
            onUseCurrentLocation={handleUseCurrentLocation}
            isLocating={locationState.loading}
          />
        </div>
      </div>
    </div>
  );
}
