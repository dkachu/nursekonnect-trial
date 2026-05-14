"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { toast } from "sonner";

export interface UserProfile {
  town?: string;
  building?: string;
  lat?: number;
  lng?: number;
  is_available?: boolean;
}

export interface UserDetails {
  id: number;
  email: string;
  phone_number?: string;
  is_nurse: boolean;
  is_patient: boolean;
  profile?: UserProfile;
  is_synced?: boolean;
}

interface AuthResponse {
  success: boolean;
  error?: string;
}

interface AuthContextType {
  user: UserDetails | null;
  setUser: React.Dispatch<React.SetStateAction<UserDetails | null>>;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (
    email: string,
    password: string,
    phone_number: string,
    is_nurse: boolean,
    is_patient: boolean
  ) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<UserDetails | null>;
  loading: boolean;
  isNurse: boolean;
  isPatient: boolean;
  isSynced: boolean;
}

interface APIErrorResponse {
  detail?: string;
  non_field_errors?: string[];
  [key: string]: string | string[] | undefined;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const didFetch = useRef(false);

  const refreshUser = useCallback(async (): Promise<UserDetails | null> => {
    try {
      const res = await api.get("accounts/profile/me/");
      const { user_details = {}, profile = {} } = res.data;
      
      if (!user_details.id) throw new Error("Unauthorized");

      const mergedUser: UserDetails = { 
        id: user_details.id,
        email: user_details.email,
        phone_number: user_details.phone_number,
        is_nurse: !!user_details.is_nurse,
        is_patient: !!user_details.is_patient,
        profile: { ...profile },
        is_synced: !!(profile.lat && profile.lng)
      };

      setUser(mergedUser);
      return mergedUser;
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        setUser(null);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    if (!didFetch.current) {
      didFetch.current = true;
      refreshUser(); 
    }
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string): Promise<AuthResponse> => {
    try {
      await api.post("accounts/login/", { email, password });
      const userData = await refreshUser();
      
      if (userData) {
        const hasTown = userData.profile?.town && userData.profile.town.trim().length > 0;
        const hasBuilding = userData.profile?.building && userData.profile.building.trim().length > 0;
        const isOnboarded = !!(hasTown && hasBuilding);
        
        if (!isOnboarded) {
          router.push("/setup");
        } else {
          router.push(userData.is_nurse ? "/profile" : "/dashboard");
        }
        
        toast.success("Authentication Verified");
        return { success: true };
      }
      return { success: false };
    } catch (error: unknown) {
      let message = "Registry rejection.";
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { data?: APIErrorResponse } };
        // FIXED: Stripped out the broken trailing period syntax drop to fix frontend crashes
        message = axiosError.response?.data?.detail || 
                  axiosError.response?.data?.non_field_errors?.[0] || 
                  message;
      }
      toast.error("Operation Rejected", { description: message });
      return { success: false, error: message };
    }
  }, [refreshUser, router]);

  const register = useCallback(async (
    email: string, 
    password: string, 
    phone_number: string, 
    is_nurse: boolean, 
    is_patient: boolean
  ): Promise<AuthResponse> => {
    try {
      await api.post("accounts/register/", { 
        email, password, phone_number, is_nurse, is_patient 
      });
      
      await new Promise((res) => setTimeout(res, 400));
      return await login(email, password);
    } catch (error: unknown) {
      let firstError = "Enrolment refused.";
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { data?: Record<string, string | string[]> } };
        const serverErrors = axiosError.response?.data;
        if (serverErrors) {
          firstError = String(Object.values(serverErrors).flat()[0] || firstError);
        }
      }
      toast.error("Operation Rejected", { description: firstError });
      return { success: false, error: firstError };
    }
  }, [login]);

  const logout = useCallback(async (): Promise<void> => {
    try { 
      await api.post("accounts/logout/"); 
    } catch { 
      console.warn("Clearing session state"); 
    }
    setUser(null);
    router.push("/login");
    toast.success("Session Terminated");
  }, [router]);

  const authValue = useMemo(() => ({
    user,
    setUser,
    login,
    register,
    logout,
    refreshUser,
    loading,
    isNurse: !!user?.is_nurse,
    isPatient: !!user?.is_patient,
    isSynced: !!user?.profile?.lat && !!user?.profile?.lng
  }), [user, loading, refreshUser, login, register, logout]);

  return (
    <AuthContext.Provider value={authValue}>
      {!loading ? (
        children
      ) : (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-white">
          <div className="text-center">
            <p className="font-bold text-zinc-400 uppercase tracking-widest animate-pulse">Initializing Handshake...</p>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
