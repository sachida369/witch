import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { KundaliFormData, LocationSuggestion } from "@/types/kundali";

interface KundaliFormProps {
  onSubmit: (data: KundaliFormData) => void;
}

export default function KundaliForm({ onSubmit }: KundaliFormProps) {
  const [formData, setFormData] = useState<Partial<KundaliFormData>>({});
  const [map, setMap] = useState<any>(null);
  const [currentMarker, setCurrentMarker] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Initialize Leaflet map
  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current || map) return;

      // Load Leaflet dynamically
      const L = (window as any).L;
      if (!L) {
        // Load Leaflet script if not already loaded
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => initMap();
        document.head.appendChild(script);
        return;
      }

      const mapInstance = L.map(mapRef.current).setView([28.6139, 77.2090], 5);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstance);

      mapInstance.on('click', (e: any) => {
        updateLocation(e.latlng.lat, e.latlng.lng, mapInstance);
      });

      setMap(mapInstance);
    };

    initMap();

    return () => {
      if (map) {
        map.remove();
      }
    };
  }, []);

  const updateLocation = async (lat: number, lng: number, mapInstance: any) => {
    const L = (window as any).L;
    
    // Remove existing marker
    if (currentMarker) {
      mapInstance.removeLayer(currentMarker);
    }
    
    // Add new marker
    const marker = L.marker([lat, lng]).addTo(mapInstance);
    setCurrentMarker(marker);
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng
    }));

    // Reverse geocoding to get place name
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      
      if (data.display_name) {
        setFormData(prev => ({
          ...prev,
          placeOfBirth: data.display_name
        }));
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
    }
  };

  const searchLocations = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoadingLocation(true);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
      );
      const data = await response.json();
      setSuggestions(data);
      setShowSuggestions(data.length > 0);
    } catch (error) {
      console.error('Location search failed:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handlePlaceInputChange = (value: string) => {
    setFormData(prev => ({ ...prev, placeOfBirth: value }));
    
    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      searchLocations(value);
    }, 300);
  };

  const selectLocation = (location: LocationSuggestion) => {
    const lat = parseFloat(location.lat);
    const lng = parseFloat(location.lon);
    
    setFormData(prev => ({
      ...prev,
      placeOfBirth: location.display_name,
      latitude: lat,
      longitude: lng
    }));
    
    setShowSuggestions(false);
    
    if (map) {
      updateLocation(lat, lng, map);
      map.setView([lat, lng], 12);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.fullName || !formData.dateOfBirth || !formData.placeOfBirth) {
      alert('Please fill in all required fields.');
      return;
    }
    
    if (!formData.latitude || !formData.longitude) {
      alert('Please select a location on the map.');
      return;
    }

    onSubmit(formData as KundaliFormData);
  };

  return (
    <section className="glassmorphism rounded-3xl p-8 mb-8">
      <h2 className="font-orbitron text-2xl text-ethereal-500 mb-6 text-center">
        ✨ Enter Your Birth Details
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <Label htmlFor="fullName" className="block text-magical-500 font-semibold mb-2 text-sm">
              Full Name *
            </Label>
            <Input
              id="fullName"
              name="fullName"
              required
              placeholder="Enter your full name"
              className="mystical-input"
              value={formData.fullName || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
            />
          </div>
          
          {/* Date of Birth */}
          <div>
            <Label htmlFor="dateOfBirth" className="block text-magical-500 font-semibold mb-2 text-sm">
              Date of Birth *
            </Label>
            <Input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              required
              className="mystical-input"
              value={formData.dateOfBirth || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
            />
          </div>
          
          {/* Time of Birth */}
          <div>
            <Label htmlFor="timeOfBirth" className="block text-magical-500 font-semibold mb-2 text-sm">
              Time of Birth
            </Label>
            <Input
              id="timeOfBirth"
              name="timeOfBirth"
              type="time"
              className="mystical-input"
              disabled={formData.timeUnknown}
              value={formData.timeUnknown ? '12:00' : (formData.timeOfBirth || '')}
              onChange={(e) => setFormData(prev => ({ ...prev, timeOfBirth: e.target.value }))}
            />
            <div className="flex items-center mt-2 space-x-2">
              <Checkbox
                id="timeUnknown"
                checked={formData.timeUnknown || false}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ 
                    ...prev, 
                    timeUnknown: checked as boolean,
                    timeOfBirth: checked ? '12:00' : ''
                  }))
                }
              />
              <Label htmlFor="timeUnknown" className="text-white/70 text-sm">
                Time unknown (we'll use 12:00 PM)
              </Label>
            </div>
          </div>
          
          {/* Place of Birth */}
          <div className="relative">
            <Label htmlFor="placeOfBirth" className="block text-magical-500 font-semibold mb-2 text-sm">
              Place of Birth *
            </Label>
            <Input
              id="placeOfBirth"
              name="placeOfBirth"
              required
              placeholder="Enter city, state, country"
              className="mystical-input"
              autoComplete="off"
              value={formData.placeOfBirth || ''}
              onChange={(e) => handlePlaceInputChange(e.target.value)}
              onFocus={() => setShowSuggestions(suggestions.length > 0)}
            />
            
            {/* Location Suggestions */}
            {showSuggestions && (
              <div className="absolute z-50 w-full location-suggestions mt-1">
                {isLoadingLocation && (
                  <div className="location-suggestion-item">
                    <span className="text-magical-500">Searching locations...</span>
                  </div>
                )}
                {suggestions.map((location) => (
                  <div
                    key={location.place_id}
                    className="location-suggestion-item"
                    onClick={() => selectLocation(location)}
                  >
                    {location.display_name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Map Container */}
        <div className="mt-6">
          <Label className="block text-magical-500 font-semibold mb-2 text-sm">
            Confirm Your Location
          </Label>
          <div ref={mapRef} className="h-64 rounded-xl border-2 border-mystical-500/40 overflow-hidden" />
          <p className="text-white/60 text-xs mt-2">
            Click on the map to fine-tune your exact birth location
          </p>
        </div>
        
        {/* Submit Button */}
        <Button type="submit" className="w-full py-4 rounded-2xl mystic-btn text-white font-bold text-lg">
          ✨ Generate My Kundali - ₹50 ✨
        </Button>
      </form>
    </section>
  );
}
