import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUserProfile, UserProfile } from '../services/dataService';

interface UserContextType {
  user: UserProfile | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({} as UserContextType);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const profile = await getCurrentUserProfile();
    if (profile) {
      setUser(profile);
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshUser();
    // Escuta evento de login/logout para atualizar
    window.addEventListener('storage', refreshUser);
    return () => window.removeEventListener('storage', refreshUser);
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);