import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { ScanLine, Gift, Loader2, Leaf, Map, Lock } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { checkTimeLimit } from '../../utils/timeUtils';
import { getDashboardData } from '../../services/dataService';
import { WeeklyGoal } from './WeeklyGoal';
import { HomeMap } from './HomeMap';
import { toast } from 'sonner';

export function Home({ onNavigate }: any) {
  // Adicionamos o 'refreshUser' para atualizar o saldo
  const { user, loading, refreshUser } = useUser();
  const [availability, setAvailability] = useState({ allowed: true, timeLeft: '' });
  const [weeklyCount, setWeeklyCount] = useState(0);

  useEffect(() => {
    // 1. FORÇA A ATUALIZAÇÃO DO SALDO AO ABRIR A HOME
    refreshUser();

    if (user) {
      // 2. Busca dados da meta semanal
      getDashboardData().then((data: any) => {
        if (data) setWeeklyCount(data.weeklyProgress);
      });

      // 3. Verifica timer de 24h
      const check = () => {
        const lastTime = user.ultimo_descarte;
        const status = checkTimeLimit(lastTime ? new Date(lastTime).getTime() : null);
        setAvailability(status);
      };
      
      check();
      const interval = setInterval(check, 60000);
      return () => clearInterval(interval);
    }
  }, [refreshUser]); // Executa sempre que o componente montar

  const handleScanClick = () => {
    if (!availability.allowed) {
      toast.error(`Limite diário atingido. Volte em ${availability.timeLeft}`);
      return;
    }
    onNavigate('scanner');
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-green-600 w-8 h-8" /></div>;
  
  if (!user) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center h-screen bg-white">
        <p className="text-gray-800 mb-4">Sessão expirada.</p>
        <Button onClick={() => window.location.reload()} className="bg-green-600 text-white">Recarregar</Button>
      </div>
    );
  }

  return (
    <div className="min-h-full pb-24" style={{ backgroundColor: '#f8fafc' }}>
      
      {/* Header Verde Escuro */}
      <div 
        className="pt-8 pb-12 px-6 rounded-b-[2.5rem] shadow-xl relative overflow-hidden"
        style={{ backgroundColor: '#2E8B57', color: 'white' }}
      >
        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white opacity-10 rounded-full blur-3xl" />
        
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 flex justify-between items-center">
          <div>
            <p className="text-sm font-medium" style={{ color: '#d1fae5' }}>Olá, {user.nome?.split(' ')[0]}!</p>
            <h1 className="text-3xl font-bold mt-0.5 text-white">Vamos reciclar? 🌿</h1>
          </div>
          <div className="p-2 rounded-full backdrop-blur-md border border-white/20" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
            <Leaf className="w-6 h-6 text-white" />
          </div>
        </motion.div>

        {/* Card de Saldo */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          className="mt-8"
        >
          <div 
            className="rounded-xl p-5 flex justify-between items-center shadow-lg backdrop-blur-md border border-white/20"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'white' }}
          >
            <div>
              <p className="text-xs uppercase tracking-wider font-bold" style={{ color: '#d1fae5' }}>Seu Saldo</p>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-bold text-white">{user.saldo_pontos || 0}</span>
                <span className="text-lg opacity-80 text-white">pts</span>
              </div>
            </div>
            <button 
              onClick={() => onNavigate('rewards')}
              className="font-bold h-10 px-5 shadow-lg rounded-xl flex items-center gap-2 hover:scale-105 transition-transform"
              style={{ backgroundColor: 'white', color: '#2E8B57', border: 'none' }}
            >
              <Gift className="w-4 h-4" />
              Trocar
            </button>
          </div>
        </motion.div>
      </div>

      {/* Conteúdo */}
      <div className="px-6 -mt-6 relative z-20 space-y-6">
        
        {/* Botão Scanner */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleScanClick}
          disabled={!availability.allowed}
          className="w-full h-24 rounded-3xl shadow-lg flex items-center justify-between px-8 transition-all"
          style={{ 
            backgroundColor: availability.allowed ? 'white' : '#f3f4f6',
            color: availability.allowed ? '#2E8B57' : '#9ca3af',
            cursor: availability.allowed ? 'pointer' : 'not-allowed',
            border: availability.allowed ? '2px solid rgba(46, 139, 87, 0.1)' : 'none'
          }}
        >
          <div className="text-left">
            <h3 className="text-xl font-bold" style={{ color: availability.allowed ? '#1f2937' : '#9ca3af' }}>
              {availability.allowed ? 'Escanear Lixo' : 'Volte Amanhã'}
            </h3>
            <p className="text-xs" style={{ color: availability.allowed ? '#4b5563' : '#9ca3af' }}>
              {availability.allowed ? 'Ganhe pontos agora' : `Disponível em ${availability.timeLeft}`}
            </p>
          </div>
          <div 
            className="p-4 rounded-full flex items-center justify-center"
            style={{ backgroundColor: availability.allowed ? '#ecfdf5' : '#e5e7eb' }}
          >
            {availability.allowed ? <ScanLine className="w-8 h-8 text-green-600" /> : <Lock className="w-8 h-8 text-gray-400" />}
          </div>
        </motion.button>

        {/* Meta Semanal */}
        <WeeklyGoal 
          currentProgress={weeklyCount} 
          goalTarget={3} 
          hasDiscardedToday={!availability.allowed} 
        />

        {/* Mapa */}
        <div>
          <div className="flex justify-between items-end mb-3">
            <h3 className="font-bold text-lg" style={{ color: '#334155' }}>Pontos Próximos</h3>
            <button 
              onClick={() => onNavigate('map')} 
              className="text-xs font-bold hover:underline"
              style={{ color: '#2E8B57' }}
            >
              Ver mapa completo
            </button>
          </div>
          <div className="h-48 w-full rounded-2xl overflow-hidden shadow-md border border-gray-200 relative z-0 bg-white">
             <HomeMap />
          </div>
        </div>

        {/* Card Impacto */}
        <div 
          className="rounded-xl p-5 flex items-center justify-between shadow-lg mb-8 text-white"
          style={{ background: 'linear-gradient(to right, #2E8B57, #059669)' }}
        >
          <div>
            <p className="font-bold text-lg">Seu Impacto</p>
            <p className="text-xs opacity-90">Você já evitou 2.5kg de CO₂</p>
          </div>
          <Leaf className="w-10 h-10 text-white opacity-30" />
        </div>

        <div className="h-4" />
      </div>
    </div>
  );
}