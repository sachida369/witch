export interface KundaliFormData {
  fullName: string;
  dateOfBirth: string;
  timeOfBirth?: string;
  placeOfBirth: string;
  latitude: number;
  longitude: number;
  timeUnknown?: boolean;
}

export interface PlanetPosition {
  id: number;
  name: string;
  vedic_name: string;
  longitude: number;
  sign: string;
  house: number;
  degree: string;
}

export interface HousePosition {
  number: number;
  sign: string;
  planets: PlanetPosition[];
}

export interface BasicAnalysis {
  zodiac_sign: string;
  moon_sign: string;
  ascendant: string;
  birth_star: string;
}

export interface KundaliData {
  basic_analysis: BasicAnalysis;
  planetary_positions: PlanetPosition[];
  houses: HousePosition[];
  birth_details: {
    datetime: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    timezone: number;
  };
}

export interface PaymentData {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface LocationSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  place_id: string;
}

declare global {
  interface Window {
    Razorpay: any;
    L: any;
    jsPDF: any;
    html2canvas: any;
  }
}
