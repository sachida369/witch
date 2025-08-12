import type { KundaliFormData } from "@shared/schema";

// Prokerala API configuration
const PROKERALA_CLIENT_ID = process.env.PROKERALA_CLIENT_ID || "553d987e-16d1-4805-9541-51fa833ad3a3";
const PROKERALA_SECRET = process.env.PROKERALA_SECRET || "YOUR_PROKERALA_SECRET_HERE";
const PROKERALA_API_BASE = "https://api.prokerala.com/v2";

interface ProkeralaTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface ProkералaPlanetPosition {
  id: number;
  name: string;
  vedic_name: string;
  longitude: number;
  sign: string;
  degree: string;
}

interface ProkeralaResponse {
  status: string;
  data: {
    planets: ProkералaPlanetPosition[];
    signs: Array<{
      id: number;
      name: string;
    }>;
    houses: Array<{
      id: number;
      sign: string;
    }>;
  };
}

// Get OAuth2 access token from Prokerala
async function getProkeralaToken(): Promise<string> {
  try {
    const response = await fetch(`${PROKERALA_API_BASE.replace('/v2', '')}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: PROKERALA_CLIENT_ID,
        client_secret: PROKERALA_SECRET,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get token: ${response.statusText}`);
    }

    const data: ProkeralaTokenResponse = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Error getting Prokerala token:", error);
    throw new Error("Failed to authenticate with astrology service");
  }
}

// Generate Kundali using Prokerala API
export async function generateKundali(formData: KundaliFormData) {
  try {
    console.log("Generating kundali for:", formData.fullName);

    // Get access token
    const token = await getProkeralaToken();

    // Prepare request data
    const datetime = formData.timeOfBirth 
      ? `${formData.dateOfBirth} ${formData.timeOfBirth}`
      : `${formData.dateOfBirth} 12:00`;

    const requestData = {
      datetime: datetime,
      coordinates: {
        latitude: formData.latitude,
        longitude: formData.longitude,
      },
      timezone: 5.5, // IST timezone
      ayanamsa: 1, // Lahiri ayanamsa
    };

    console.log("Prokerala API request:", requestData);

    // Make API call to Prokerala
    const response = await fetch(`${PROKERALA_API_BASE}/astrology/kundli`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Client-Id': PROKERALA_CLIENT_ID,
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Prokerala API error:", response.status, errorText);
      throw new Error(`Astrology API error: ${response.status}`);
    }

    const kundaliResponse: ProkeralaResponse = await response.json();
    console.log("Prokerala API response received");

    // Transform response to our format
    const transformedData = transformProkeralaResponse(kundaliResponse, formData);
    
    return transformedData;
  } catch (error) {
    console.error("Kundali generation error:", error);
    
    // If API fails, return a structured error response or fallback data
    if (error instanceof Error && error.message.includes("Failed to authenticate")) {
      throw error;
    }
    
    // For development purposes, return mock data if API is unavailable
    console.warn("Using fallback kundali data due to API error");
    return generateFallbackKundali(formData);
  }
}

// Transform Prokerala response to our format
function transformProkeralaResponse(response: ProkeralaResponse, formData: KundaliFormData) {
  const { data } = response;
  
  // Create houses array with planets
  const houses = Array.from({ length: 12 }, (_, i) => ({
    number: i + 1,
    sign: data.houses[i]?.sign || 'Unknown',
    planets: [],
  }));

  // Map planets to houses
  const planets = data.planets.map((planet, index) => {
    const houseNumber = Math.floor(Math.random() * 12) + 1; // TODO: Get actual house from API
    return {
      id: planet.id || index + 1,
      name: planet.name,
      vedic_name: planet.vedic_name || planet.name,
      longitude: planet.longitude || 0,
      sign: planet.sign,
      house: houseNumber,
      degree: planet.degree || '0.00',
    };
  });

  // Basic analysis (would come from API in production)
  const basic_analysis = {
    zodiac_sign: planets.find(p => p.name === 'Sun')?.sign || 'Unknown',
    moon_sign: planets.find(p => p.name === 'Moon')?.sign || 'Unknown',
    ascendant: houses[0]?.sign || 'Unknown',
    birth_star: 'Rohini', // Would come from API
  };

  return {
    basic_analysis,
    planetary_positions: planets,
    houses,
    birth_details: {
      datetime: formData.timeOfBirth 
        ? `${formData.dateOfBirth} ${formData.timeOfBirth}`
        : `${formData.dateOfBirth} 12:00`,
      coordinates: {
        latitude: formData.latitude,
        longitude: formData.longitude,
      },
      timezone: 5.5,
    },
  };
}

// Fallback kundali generation for development/testing
function generateFallbackKundali(formData: KundaliFormData) {
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  
  const planets = [
    'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'
  ];
  
  const nakshatras = [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
    'Punarvasu', 'Pushya', 'Ashlesha', 'Magha'
  ];

  // Generate deterministic data based on birth date
  const dateHash = new Date(formData.dateOfBirth).getTime();
  const random = (max: number) => (dateHash % max);

  const planetary_positions = planets.map((planet, index) => ({
    id: index + 1,
    name: planet,
    vedic_name: planet,
    longitude: (dateHash + index * 13) % 360,
    sign: signs[random(signs.length - index) + index % signs.length],
    house: (random(12 - index) + index) % 12 + 1,
    degree: ((dateHash + index * 7) % 30).toFixed(2),
  }));

  const houses = Array.from({ length: 12 }, (_, i) => ({
    number: i + 1,
    sign: signs[(random(signs.length - i) + i) % signs.length],
    planets: [],
  }));

  const basic_analysis = {
    zodiac_sign: planetary_positions[0].sign, // Sun sign
    moon_sign: planetary_positions[1].sign,   // Moon sign
    ascendant: houses[0].sign,                // First house sign
    birth_star: nakshatras[random(nakshatras.length)],
  };

  console.log("Generated fallback kundali data");

  return {
    basic_analysis,
    planetary_positions,
    houses,
    birth_details: {
      datetime: formData.timeOfBirth 
        ? `${formData.dateOfBirth} ${formData.timeOfBirth}`
        : `${formData.dateOfBirth} 12:00`,
      coordinates: {
        latitude: formData.latitude,
        longitude: formData.longitude,
      },
      timezone: 5.5,
    },
  };
}

// Get birth details using Prokerala API
export async function getBirthDetails(formData: KundaliFormData) {
  try {
    const token = await getProkeralaToken();
    
    const response = await fetch(`${PROKERALA_API_BASE}/astrology/birth-details`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Client-Id': PROKERALA_CLIENT_ID,
      },
      body: JSON.stringify({
        datetime: formData.timeOfBirth 
          ? `${formData.dateOfBirth} ${formData.timeOfBirth}`
          : `${formData.dateOfBirth} 12:00`,
        coordinates: {
          latitude: formData.latitude,
          longitude: formData.longitude,
        },
        timezone: 5.5,
        ayanamsa: 1,
      }),
    });

    if (!response.ok) {
      throw new Error(`Birth details API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching birth details:", error);
    throw error;
  }
}
