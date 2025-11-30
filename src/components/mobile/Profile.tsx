import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { User, Bell, Shield, HelpCircle, Settings, LogOut, ChevronRight, Loader2 } from 'lucide-react';
import { Badge } from '../ui/badge';
import { UserData } from '../../App';
import { toast } from 'sonner';
import { getCurrentUserProfile, UserProfile } from '../../services/dataService';

interface ProfileProps {
  userData: UserData;
  onLogout: () => void;
}

export function Profile({ onLogout }: ProfileProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Carrega dados reais do Supabase
  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getCurrentUserProfile();
        if (data) {
          setProfile(data);
        }
      } catch (error) {
        console.error(error);
        toast.error("Erro ao carregar perfil.");
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const showPersonalData = () => {
    if (!profile) return;
    toast.info("Dados Cadastrais", {
      description: `Nome: ${profile.nome}\nCPF: ${profile.cpf}\nEmail: ${profile.email}`,
      duration: 5000,
    });
  };

  const menuItems = [
    { icon: User, label: 'Dados pessoais', action: showPersonalData },
    { icon: Bell, label: 'Notificações', action: () => toast.success("Sem novas notificações.") },
    { icon: Shield, label: 'Privacidade', action: () => toast.info("Seus dados estão protegidos no Supabase.") },
    { icon: HelpCircle, label: 'Ajuda e suporte', action: () => toast.info("Suporte: contato@recifesustentavel.com") },
    { icon: Settings, label: 'Configurações', action: () => toast.info("Versão: 1.0.2 (Produção)") },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-secondary text-primary-foreground p-6 pb-12 rounded-b-3xl shadow-lg">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-white/20 shadow-xl">
            <AvatarFallback className="bg-white/20 text-primary-foreground text-2xl font-bold">
              {profile.nome.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <h2 className="mb-2 text-2xl font-bold">{profile.nome}</h2>
          <Badge className="bg-white/20 text-primary-foreground border-0 mb-3 px-3 py-1 backdrop-blur-sm">
            {profile.nivel_usuario || 'Iniciante'}
          </Badge>
          <p className="text-sm text-primary-foreground/80">
            Membro Ativo
          </p>
        </motion.div>
      </div>

      <div className="p-6 -mt-8 space-y-6">
        {/* Stats Reais */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-4">
          <Card className="shadow-md border-none">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold mb-1 text-primary">{profile.total_descartes}</div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Descartes</p>
            </CardContent>
          </Card>

          <Card className="shadow-md border-none">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold mb-1 text-secondary-foreground">{profile.saldo_capivaras}</div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Capivaras</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Menu */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Card 
                key={index} 
                className="cursor-pointer hover:bg-muted/50 transition-all active:scale-[0.98] border-none shadow-sm"
                onClick={item.action}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/5 rounded-lg text-primary">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground/50" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </motion.div>

        <div className="pt-4">
          <Button variant="outline" className="w-full h-12 text-destructive border-destructive/30 hover:bg-destructive/5" onClick={onLogout}>
            <LogOut className="w-5 h-5 mr-2" />
            Sair da conta
          </Button>
        </div>
      </div>
    </div>
  );
}