import { useEffect, useRef } from "react";
import type { HousePosition, PlanetPosition } from "@/types/kundali";

interface KundaliChartProps {
  houses: HousePosition[];
  planets: PlanetPosition[];
}

export default function KundaliChart({ houses, planets }: KundaliChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  // Planet abbreviations for display
  const getPlanetAbbr = (planetName: string): string => {
    const abbr: { [key: string]: string } = {
      'Sun': 'Su',
      'Moon': 'Mo',
      'Mars': 'Ma',
      'Mercury': 'Me',
      'Jupiter': 'Ju',
      'Venus': 'Ve',
      'Saturn': 'Sa',
      'Rahu': 'Ra',
      'Ketu': 'Ke',
    };
    return abbr[planetName] || planetName.substring(0, 2);
  };

  // Get planets in a specific house
  const getPlanetsInHouse = (houseNumber: number) => {
    return planets.filter(planet => planet.house === houseNumber);
  };

  return (
    <div className="text-center">
      <h4 className="font-orbitron text-xl text-ethereal-500 mb-4">Vedic Birth Chart</h4>
      <div ref={chartRef} className="kundali-wheel mx-auto relative">
        {Array.from({ length: 12 }, (_, i) => {
          const houseNumber = i + 1;
          const planetsInHouse = getPlanetsInHouse(houseNumber);
          
          return (
            <div
              key={houseNumber}
              className={`kundali-house house-${houseNumber}`}
              data-house={houseNumber}
              title={`House ${houseNumber}: ${houses[i]?.sign || ''}`}
            >
              <div className="flex flex-col items-center justify-center h-full text-center">
                <span className="text-xs font-bold text-ethereal-500">{houseNumber}</span>
                {planetsInHouse.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {planetsInHouse.map((planet) => (
                      <span
                        key={planet.id}
                        className="text-xs font-semibold text-magical-500 bg-black/50 rounded px-1"
                        title={`${planet.name} in ${planet.sign} (${planet.degree}°)`}
                      >
                        {getPlanetAbbr(planet.name)}
                      </span>
                    ))}
                  </div>
                )}
                {houses[i]?.sign && (
                  <span className="text-xs text-white/60 mt-1">
                    {houses[i].sign.substring(0, 3)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="mt-4 glassmorphism rounded-xl p-4">
        <h5 className="text-mystical-500 font-semibold text-sm mb-2">Planet Symbols</h5>
        <div className="grid grid-cols-3 gap-2 text-xs">
          {planets.slice(0, 9).map((planet) => (
            <div key={planet.id} className="flex items-center gap-1">
              <span className="text-magical-500 font-semibold w-6">
                {getPlanetAbbr(planet.name)}
              </span>
              <span className="text-white/70">{planet.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
