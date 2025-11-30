import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
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

  // Função que busca os dados mais recentes do banco
  const refreshUser = async () => {
    const profile = await getCurrentUserProfile();
    if (profile) {
      setUser(profile);
    }
    setLoading(false);
  };

  // Carrega ao iniciar
  useEffect(() => {
    refreshUser();
    
    // Opcional: Escuta mudanças em tempo real no banco (Realtime)
    const subscription = supabase
      .channel('public:usuario')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'usuario' }, () => {
        refreshUser();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);