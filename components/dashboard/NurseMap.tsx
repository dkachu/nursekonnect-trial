"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Navigation, ArrowUpRight, MapPin } from 'lucide-react';

interface NearbyNurse {
  id: number;
  user_details?: {
    email: string;
  };
  specialization?: string;
  distance?: string;
  location?: {
    coordinates: [number, number];
  };
}

const nurseIcon = new L.Icon({
  iconUrl: 'cloudflare.com',
  shadowUrl: 'cloudflare.com',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const patientIcon = new L.Icon({
  iconUrl: 'githubusercontent.com',
  shadowUrl: 'cloudflare.com',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function NurseMap() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth(); 
  const [nurses, setNurses] = useState<NearbyNurse[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (authLoading || !user) return;

    const profile = user.profile || user;
    const userLocation = profile?.location;
    const userCoords = userLocation?.coordinates;

    if (userCoords && Array.isArray(userCoords)) {
      const [lng, lat] = userCoords;
      
      const fetchNurses = async () => {
        try {
          const res = await api.get(`accounts/nurses/nearby/`, {
              params: { lat, lng }
          });
          setNurses(Array.isArray(res.data) ? res.data : res.data.results || []);
          
          // FIXED: Shifted map state updating calls to happen safely inside the async callback response 
          // container to block strict linter cascade render loops completely
          setMapCenter([lat, lng]);
        } catch (err) {
          console.error("Discovery Registry Connection Failed", err);
        }
      };

      fetchNurses();
    }
  }, [user, authLoading]);

  if (authLoading || !mapCenter) return (
    <div className="h-[500px] w-full bg-zinc-50 rounded-[3rem] border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <Loader2 className="animate-spin text-primary" size={40} />
        <MapPin className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-zinc-900" size={16} />
      </div>
      <div className="text-center">
        <p className="text-[10px] font-black text-zinc-900 uppercase tracking-[0.3em] italic">Registry Connection</p>
        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-1 animate-pulse">Calibrating Discovery Zone...</p>
      </div>
    </div>
  );

  return (
    <div className="h-[600px] w-full rounded-[3.5rem] overflow-hidden border-[12px] border-white shadow-2xl relative">
      <MapContainer center={mapCenter} zoom={13} scrollWheelZoom={false} className="h-full w-full z-0">
        <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={mapCenter} icon={patientIcon}>
            <Popup>
                <div className="text-center p-1">
                    <p className="text-[9px] font-black uppercase text-blue-600 tracking-tighter">Registered Residence</p>
                    <p className="font-bold text-zinc-900 text-xs">{user?.profile?.building || "Home Zone"}</p>
                </div>
            </Popup>
        </Marker>
        {nurses.map((nurse) => {
          const { id, user_details, specialization, distance, location } = nurse;
          if (!location?.coordinates) return null;
          const [lng, lat] = location.coordinates;
          const userEmail = user_details?.email || "Professional";
          return (
            <Marker key={id} position={[lat, lng]} icon={nurseIcon}>
              <Popup>
                <div className="p-4 min-w-[220px] space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-zinc-950 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-xl italic">
                      {userEmail.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-black text-zinc-900 text-sm uppercase leading-none italic">
                        {userEmail.split('@')[0]}
                      </h4>
                      <div className="flex items-center gap-1 text-blue-600 mt-1.5">
                        <Navigation size={10} className="fill-blue-600" />
                        <span className="text-[10px] font-black uppercase tracking-tighter italic">
                            {distance ? parseFloat(distance).toFixed(1) : '0.0'} KM
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-zinc-50 p-3 rounded-2xl border border-zinc-100">
                    <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1 italic">Expertise</p>
                    <p className="text-[11px] font-bold text-zinc-800 uppercase tracking-tight leading-none italic">
                        {specialization?.replace('_', ' ') || "General Nursing"}
                    </p>
                  </div>
                  <button type="button" onClick={() => router.push(`/nurses/${id}/`)} className="w-full bg-blue-600 hover:bg-zinc-900 text-white text-[10px] py-4 rounded-2xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 italic border-none">
                    Deploy Request <ArrowUpRight size={14} />
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      <div className="absolute top-8 left-8 z-[1000] bg-zinc-950 px-6 py-4 rounded-[2rem] shadow-2xl border border-zinc-800 flex items-center gap-4">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
          </div>
          <div>
            <p className="text-[10px] font-black text-white uppercase tracking-widest italic">Discovery Active</p>
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-tighter italic leading-none">
                {nurses.length} Professionals found near {user?.profile?.town || 'your zone'}
            </p>
          </div>
      </div>
    </div>
  );
}
