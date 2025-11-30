import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { ScanLine, Map, TrendingUp, Trash2, Award, Lock, Gift, Loader2 } from 'lucide-react';
import { Badge } from '../ui/badge';
import { UserData } from '../../App';
import { getDashboardData, calculateTimeLeft, UserProfile, Transaction } from '../../services/dataService';
import { WeeklyGoal } from './WeeklyGoal';
import { toast } from 'sonner';

interface HomeProps {
  userData: UserData; // Mantido para compatibilidade, mas usaremos os dados reais do banco
  onNavigate: (screen: string) => void;
}

export function Home({ onNavigate }: HomeProps) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [history, setHistory] = useState<Transaction[]>([]);
  const [availability, setAvailability] = useState({ available: true, timeLeft: '' });
  const [weeklyCount, setWeeklyCount] = useState(0);

  // Carrega dados reais ao abrir
  useEffect(() => {
    loadRealData();
  }, []);

  const loadRealData = async () => {
    try {
      const data = await getDashboardData();
      if (data) {
        setProfile(data.user);
        setHistory(data.history);
        setWeeklyCount(data.weeklyProgress);
        
        // Calcula se pode descartar agora
        const status = calculateTimeLeft(data.lastDisposalTime);
        setAvailability(status);
      }
    } catch (error) {
      console.error("Erro ao carregar home:", error);
      toast.error("Erro ao sincronizar dados.");
    } finally {
      setLoading(false);
    }
  };

  const handleScanClick = () => {
    if (!availability.available) {
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

  if (!profile) {
    return (
      <div className="p-8 text-center">
        <p>Não foi possível carregar seus dados.</p>
        <Button onClick={() => window.location.reload()} className="mt-4">Tentar novamente</Button>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gradient-to-b from-primary/5 to-background pb-24">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-6 pb-8 rounded-b-3xl shadow-lg relative overflow-hidden">
        {/* Fundo decorativo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl" />
        
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
          <p className="opacity-90 text-sm font-medium">Bem-vindo(a) de volta,</p>
          <h1 className="text-3xl font-bold mt-1">{profile.nome.split(' ')[0]}! 👋</h1>
        </motion.div>

        {/* Card de Saldo Real */}
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
                    <span className="text-5xl font-bold tracking-tight">{profile.saldo_capivaras}</span>
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
        
        {/* Meta Semanal Real */}
        <WeeklyGoal 
          currentProgress={weeklyCount} 
          goalTarget={3} // Meta fixa de 3 dias
          hasDiscardedToday={!availability.available} 
        />

        {/* Ações Rápidas */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={handleScanClick}
              disabled={!availability.available}
              className={`h-32 flex-col gap-3 rounded-2xl shadow-md transition-all border-0 ${
                !availability.available 
                  ? 'bg-muted text-muted-foreground' 
                  : 'bg-primary hover:bg-primary/90 hover:scale-[1.02] hover:shadow-xl'
              }`}
            >
              {availability.available ? (
                <>
                  <div className="p-4 bg-white/20 rounded-full"><ScanLine className="w-8 h-8" /></div>
                  <span className="font-bold text-lg">Escanear</span>
                </>
              ) : (
                <>
                  <div className="p-3 bg-zinc-200/50 rounded-full"><Lock className="w-6 h-6" /></div>
                  <div className="text-center">
                    <span className="font-bold block text-xs uppercase tracking-wide mb-1">Disponível em</span>
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

        {/* Estatísticas Reais */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="border-none shadow-sm bg-card overflow-hidden">
            <CardContent className="p-3 text-center relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/50" />
              <div className="w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 bg-blue-500/10 text-blue-600">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="font-bold text-lg leading-none mb-1">{weeklyCount}</div>
              <p className="text-[10px] text-muted-foreground uppercase font-medium">Esta semana</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-card overflow-hidden">
            <CardContent className="p-3 text-center relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-green-500/50" />
              <div className="w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 bg-green-500/10 text-green-600">
                <Trash2 className="w-4 h-4" />
              </div>
              <div className="font-bold text-lg leading-none mb-1">{profile.total_descartes}</div>
              <p className="text-[10px] text-muted-foreground uppercase font-medium">Total</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-card overflow-hidden">
            <CardContent className="p-3 text-center relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-amber-500/50" />
              <div className="w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 bg-amber-500/10 text-amber-600">
                <Award className="w-4 h-4" />
              </div>
              <div className="font-bold text-sm leading-none mb-1 truncate pt-1">{profile.nivel_usuario}</div>
              <p className="text-[10px] text-muted-foreground uppercase font-medium">Nível</p>
            </CardContent>
          </Card>
        </div>

        {/* Histórico Recente Real */}
        <div className="space-y-3">
          <h3 className="font-bold text-lg flex items-center gap-2 text-foreground">
            Atividade Recente
          </h3>
          
          {history.length === 0 ? (
            <div className="text-center py-10 bg-muted/30 rounded-xl border-2 border-dashed border-muted-foreground/20">
              <p className="text-muted-foreground font-medium">Nenhuma atividade ainda.</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Seus descartes e resgates aparecerão aqui.</p>
            </div>
          ) : (
            history.map((item, i) => (
              <motion.div key={item.id_transacao} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="border-none shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  <CardContent className="p-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        item.tipo === 'ganho' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                      }`}>
                        {item.tipo === 'ganho' ? <Trash2 className="w-6 h-6" /> : <Gift className="w-6 h-6" />}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{item.descricao || (item.tipo === 'ganho' ? 'Descarte realizado' : 'Recompensa resgatada')}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(item.data_hora).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant={item.tipo === 'ganho' ? "default" : "outline"} 
                      className={`text-sm py-1 px-2 ${item.tipo === 'ganho' ? "bg-green-600 hover:bg-green-700" : "text-orange-600 border-orange-200"}`}
                    >
                      {item.tipo === 'ganho' ? '+' : '-'}{Math.abs(item.valor)}
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}