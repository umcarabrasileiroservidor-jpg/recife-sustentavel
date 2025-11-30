import { useState } from 'react';
import { Login } from './components/Login';
import { MobileApp } from './components/MobileApp';
import { AdminPanel } from './components/AdminPanel';
import { Toaster } from './components/ui/sonner';
import { UserProvider } from './contexts/UserContext';

// Interface definida apenas uma vez aqui para uso legado
export interface UserData {
  id: number;
  name: string;
  email: string;
  phone: string;
  cpf: string;
}

export default function App() {
  const [view, setView] = useState<'login' | 'mobile' | 'admin'>('login');
  const [userData, setUserData] = useState<UserData | null>(null);

  const handleLogin = (user: UserData, admin: boolean = false) => {
    setUserData(user);
    setView(admin ? 'admin' : 'mobile');
  };

  const handleLogout = () => {
    setUserData(null);
    setView('login');
  };

  return (
    <UserProvider>
      <div className="min-h-screen bg-background">
        {view === 'login' && <Login onLogin={handleLogin} />}
        {view === 'mobile' && userData && <MobileApp userData={userData} onLogout={handleLogout} />}
        {view === 'admin' && <AdminPanel onLogout={handleLogout} />}
        <Toaster />
      </div>
    </UserProvider>
  );
}