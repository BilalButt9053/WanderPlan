import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { MapPin, Loader2, LocateFixed } from 'lucide-react';
import { useState } from 'react';

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

        <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/40 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <Label>GPS Coordinates</Label>
              <p className="text-sm text-muted-foreground">Optional, but useful for maps and discovery.</p>
            </div>
            <Button type="button" variant="outline" onClick={handleUseCurrentLocation} disabled={locationState.loading}>
              {locationState.loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LocateFixed className="mr-2 h-4 w-4" />}
              Use Current Location
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                name="latitude"
                placeholder="31.5204"
                className="bg-secondary"
                value={formData.latitude}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                name="longitude"
                placeholder="74.3587"
                className="bg-secondary"
                value={formData.longitude}
                onChange={handleChange}
              />
            </div>
          </div>

          {locationState.message && <p className="text-sm text-primary">{locationState.message}</p>}
          {locationState.error && <p className="text-sm text-destructive">{locationState.error}</p>}
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
