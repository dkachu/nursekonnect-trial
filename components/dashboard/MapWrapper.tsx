"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

// Hardened inline base64 asset injection to completely bypass external domain image breaks
const medicalMarkerSvg = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0ID0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMjU2M2ViIiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTIxIDEwYzAgNy0xIDEzLTkgMTMtcy05LTYtOS0xM2E5IDkgMCAwMTE4IDzeiIvPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTAiIHI9IjMiIGZpbGw9IiMyNTYzZWIiLz48L3N2Zz4=";

const unifiedIcon = new L.Icon({
  iconUrl: medicalMarkerSvg,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

interface NearbyNurse {
  id: number;
  user_details?: { email: string; };
  specialization?: string;
  distance?: string;
  lat?: number;
  lng?: number;
  location?: { coordinates: [number, number]; };
}

interface MapWrapperProps {
  mapCenter: [number, number];
  nurses: NearbyNurse[];
  building: string;
  router: AppRouterInstance;
}

export default function MapWrapper({ mapCenter, nurses, building, router }: MapWrapperProps) {
  return (
    <MapContainer 
      center={mapCenter} 
      zoom={13} 
      scrollWheelZoom={false} 
      className="h-full w-full z-0"
    >
      <TileLayer 
        attribution='&copy; <a href="openstreetmap.org">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
      />
      
      {/* Target User Residency Anchor Point */}
      <Marker position={mapCenter} icon={unifiedIcon}>
        <Popup>
          <div className="p-1 text-center font-bold text-xs uppercase text-zinc-800">
            <span className="text-blue-600 block mb-0.5">RESIDENCY</span>
            <p className="text-[10px] text-zinc-500 font-medium normal-case m-0">{building}</p>
          </div>
        </Popup>
      </Marker>

      {/* Nearby Active Medical Professionals Stream */}
      {nurses.map((nurse) => {
        // Defensive coordinate data extraction matching all PostGIS serializer options
        const lat = nurse.lat || (nurse.location?.coordinates ? nurse.location.coordinates[1] : null);
        const lng = nurse.lng || (nurse.location?.coordinates ? nurse.location.coordinates[0] : null);
        
        if (!lat || !lng) return null;

        const email = nurse.user_details?.email || "Professional";
        const displayName = email.split("@")[0];
        const distanceVal = nurse.distance ? parseFloat(nurse.distance).toFixed(1) : "0.0";
        const cleanSpecialization = nurse.specialization?.replace("_", " ") || "GENERAL PRACTICE";

        return (
          <Marker 
            key={nurse.id} 
            position={[Number(lat), Number(lng)]} 
            icon={unifiedIcon}
          >
            <Popup>
              <div className="p-2 min-w-[180px] space-y-3 text-center uppercase">
                <div>
                  <h4 className="font-black text-zinc-900 text-sm leading-none break-all">{displayName}</h4>
                  <span className="text-[10px] font-black text-blue-600 block mt-1">{distanceVal} KM AWAY</span>
                </div>
                
                <div className="bg-zinc-50 p-2 rounded-xl text-left border border-zinc-100">
                  <p className="text-[8px] font-black text-zinc-400 tracking-widest leading-none mb-1">CLINICAL REGISTRY</p>
                  <p className="text-[10px] font-bold text-zinc-800 leading-tight">{cleanSpecialization}</p>
                </div>
                
                <button 
                  type="button" 
                  onClick={() => router.push(`/nurses/${nurse.id}/`)} 
                  className="w-full h-10 bg-blue-600 text-white font-black uppercase text-[10px] tracking-widest rounded-xl border-none cursor-pointer hover:bg-zinc-900 transition-colors"
                >
                  DEPLOY REQUEST
                </button>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
