import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { ScanLine, Map, TrendingUp, Trash2, Award, Lock, Gift, Loader2 } from 'lucide-react';
import { Badge } from '../ui/badge';
import { useUser } from '../../contexts/UserContext'; // Contexto Global
import { checkTimeLimit } from '../../utils/timeUtils'; // Utilitário de tempo
import { WeeklyGoal } from './WeeklyGoal';
import { toast } from 'sonner';

type Screen = 'home' | 'scanner' | 'history' | 'wallet' | 'rewards' | 'penalties' | 'map' | 'profile';

interface HomeProps {
  userData: any; // Mantido por compatibilidade
  onNavigate: (screen: Screen) => void;
}

export function Home({ onNavigate }: HomeProps) {
  const { user, loading, refreshUser } = useUser();
  const [availability, setAvailability] = useState({ allowed: true, timeLeft: '' });

  // Verifica o tempo a cada minuto
  useEffect(() => {
    const check = () => {
      // Tenta pegar o timestamp do localStorage se o usuário do contexto não tiver atualizado ainda
      const localUser = JSON.parse(localStorage.getItem('recife_sustentavel_session') || '{}').user;
      const lastTime = user?.ultimo_descarte || localUser?.ultimo_descarte;
      
      const status = checkTimeLimit(lastTime ? new Date(lastTime).getTime() : null);
      setAvailability(status);
    };

    check();
    const interval = setInterval(check, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const handleScanClick = () => {
    if (!availability.allowed) {
      toast.error(`Limite diário atingido. Volte em ${availability.timeLeft}`);
      return;
    }
    onNavigate('scanner');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // Fallback se não tiver usuário logado
  if (!user) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center h-screen">
        <p>Sessão expirada.</p>
        <Button onClick={() => window.location.reload()} className="mt-4">Recarregar</Button>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gradient-to-b from-primary/5 to-background pb-24">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-6 pb-8 rounded-b-3xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl" />
        
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
          <p className="opacity-90 text-sm font-medium">Bem-vindo(a) de volta,</p>
          <h1 className="text-3xl font-bold mt-1">{(user as any).nome.split(' ')[0]}! 👋</h1>
        </motion.div>

        {/* Card de Saldo */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ delay: 0.1 }}
          className="relative z-10"
        >
          <Card className="mt-6 bg-white/10 border-white/20 backdrop-blur-md shadow-xl">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary-foreground/80 text-xs uppercase tracking-wider mb-1 font-semibold">Seu Saldo</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold tracking-tight">{(user as any).saldo_pontos}</span>
                    <span className="text-2xl opacity-90">🌿</span>
                  </div>
                </div>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => onNavigate('rewards')}
                  className="bg-white text-primary hover:bg-white/90 border-0 font-bold shadow-lg h-10 px-4"
                >
                  <Gift className="w-4 h-4 mr-2" />
                  Trocar
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="p-6 space-y-6 -mt-2 relative z-20">
        
        {/* Meta Semanal (Mock visual por enquanto, já que migramos o banco) */}
        <WeeklyGoal 
          currentProgress={1} 
          goalTarget={3} 
          hasDiscardedToday={!availability.allowed} 
        />

        {/* Ações Rápidas */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={handleScanClick}
              disabled={!availability.allowed}
              className={`h-32 flex-col gap-3 rounded-2xl shadow-md transition-all border-0 ${
                !availability.allowed 
                  ? 'bg-muted text-muted-foreground' 
                  : 'bg-primary hover:bg-primary/90 hover:scale-[1.02] hover:shadow-xl'
              }`}
            >
              {availability.allowed ? (
                <>
                  <div className="p-4 bg-white/20 rounded-full"><ScanLine className="w-8 h-8" /></div>
                  <span className="font-bold text-lg">Escanear</span>
                </>
              ) : (
                <>
                  <div className="p-3 bg-zinc-200/50 rounded-full"><Lock className="w-6 h-6" /></div>
                  <div className="text-center">
                    <span className="font-bold block text-xs uppercase tracking-wide mb-1">Volte em</span>
                    <span className="text-base font-mono font-bold">{availability.timeLeft}</span>
                  </div>
                </>
              )}
            </Button>

            <Button
              onClick={() => onNavigate('map')}
              variant="outline"
              className="h-32 flex-col gap-3 bg-card hover:bg-accent/5 border-2 border-primary/5 rounded-2xl shadow-sm hover:scale-[1.02] transition-all"
            >
              <div className="p-4 bg-primary/10 text-primary rounded-full"><Map className="w-8 h-8" /></div>
              <span className="font-bold text-lg text-foreground">Lixeiras</span>
            </Button>
          </div>
        </motion.div>

        {/* Estatísticas */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="border-none shadow-sm bg-card overflow-hidden">
            <CardContent className="p-3 text-center relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/50" />
              <div className="w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 bg-blue-500/10 text-blue-600">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="font-bold text-lg leading-none mb-1">--</div>
              <p className="text-[10px] text-muted-foreground uppercase font-medium">Semana</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-card overflow-hidden">
            <CardContent className="p-3 text-center relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-green-500/50" />
              <div className="w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 bg-green-500/10 text-green-600">
                <Trash2 className="w-4 h-4" />
              </div>
              <div className="font-bold text-lg leading-none mb-1">--</div>
              <p className="text-[10px] text-muted-foreground uppercase font-medium">Total</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-card overflow-hidden">
            <CardContent className="p-3 text-center relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-amber-500/50" />
              <div className="w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 bg-amber-500/10 text-amber-600">
                <Award className="w-4 h-4" />
              </div>
              <div className="font-bold text-sm leading-none mb-1 truncate pt-1">Iniciante</div>
              <p className="text-[10px] text-muted-foreground uppercase font-medium">Nível</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}