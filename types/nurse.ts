export interface UserDetails {
  id: number;
  email: string;
  phone_number: string;
  is_nurse: boolean;
  is_patient: boolean;
}

export interface NurseProfile {
  id: number;
  user_details: UserDetails;
  specialization: string;
  years_of_experience: number;
  town: string;
  building: string;
  license_number: string;
  is_verified: boolean;
  is_available: boolean;
  is_online: boolean;
  distance: string | null;
  location: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  } | null;
}
