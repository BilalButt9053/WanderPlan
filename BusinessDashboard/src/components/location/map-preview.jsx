import { ExternalLink, LocateFixed, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'

const hasCoordinates = (latitude, longitude) => latitude !== '' && longitude !== '' && latitude !== null && longitude !== null

export function getGoogleMapsUrl(latitude, longitude) {
  return `https://www.google.com/maps?q=${latitude},${longitude}`
}

export default function MapPreview({
  latitude,
  longitude,
  onUseCurrentLocation,
  isLocating = false,
  heightClass = 'h-64',
}) {
  const hasLocation = hasCoordinates(latitude, longitude)
  const mapsUrl = hasLocation ? getGoogleMapsUrl(latitude, longitude) : null
  const embedUrl = hasLocation
    ? `https://maps.google.com/maps?q=${latitude},${longitude}&z=16&output=embed`
    : null

  return (
    <div className="space-y-3">
      <div
        role={hasLocation ? 'link' : undefined}
        tabIndex={hasLocation ? 0 : undefined}
        onClick={() => {
          if (mapsUrl) window.open(mapsUrl, '_blank', 'noopener,noreferrer')
        }}
        onKeyDown={(event) => {
          if (mapsUrl && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault()
            window.open(mapsUrl, '_blank', 'noopener,noreferrer')
          }
        }}
        className={`relative w-full ${heightClass} overflow-hidden rounded-lg border border-border bg-muted ${hasLocation ? 'cursor-pointer' : ''}`}
        title={hasLocation ? 'Open business location in Google Maps' : 'Fetch current location to show the map pin'}
      >
        {hasLocation ? (
          <>
            <iframe
              title="Business location map"
              src={embedUrl}
              className="pointer-events-none h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <MapPin className="h-12 w-12 fill-red-600 text-red-700 drop-shadow-lg" />
            </div>
            <div className="pointer-events-none absolute bottom-3 left-3 rounded-md bg-background/90 px-3 py-1 text-xs font-medium text-foreground shadow">
              Click map to open Google Maps
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
            <MapPin className="h-12 w-12 text-muted-foreground" />
            <div>
              <p className="font-medium">No location pinned</p>
              <p className="text-sm text-muted-foreground">Use current location or enter coordinates.</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {onUseCurrentLocation && (
          <Button type="button" variant="outline" onClick={onUseCurrentLocation} disabled={isLocating}>
            <LocateFixed className={`mr-2 h-4 w-4 ${isLocating ? 'animate-pulse' : ''}`} />
            {isLocating ? 'Fetching Location...' : 'Fetch Current Location'}
          </Button>
        )}
        {hasLocation && (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <ExternalLink className="h-4 w-4" />
            Open in Google Maps
          </a>
        )}
      </div>
    </div>
  )
}
