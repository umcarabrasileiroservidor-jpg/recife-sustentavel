import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { User, Bell, Shield, HelpCircle, Settings, LogOut, ChevronRight, Loader2, ArrowLeft, Mail, Phone, CreditCard } from 'lucide-react';
import { Badge } from '../ui/badge';
import { useUser } from '../../contexts/UserContext';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from 'sonner';
interface ProfileProps {
  userData: any;
  onLogout: () => void;
}

// Sub-telas do Perfil
type SubScreen = 'menu' | 'personal' | 'notifications' | 'privacy' | 'help';

export function Profile({ onLogout }: ProfileProps) {
  const { user, loading } = useUser();
  const [subScreen, setSubScreen] = useState<SubScreen>('menu');

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  if (!user) return null;

  // --- TELAS INTERNAS ---

  const PersonalDataScreen = () => (
    <div className="p-6 space-y-6">
       <div className="space-y-4">
         <div className="space-y-2"><Label>Nome Completo</Label><Input value={user.nome} readOnly className="bg-muted/50" /></div>
         <div className="space-y-2"><Label>Email</Label><Input value={user.email} readOnly className="bg-muted/50" /></div>
         <div className="space-y-2"><Label>CPF</Label><Input value={user.cpf || '---'} readOnly className="bg-muted/50" /></div>
         <div className="space-y-2"><Label>Telefone</Label><Input value={user.telefone || '---'} readOnly className="bg-muted/50" /></div>
       </div>
       <p className="text-xs text-muted-foreground text-center">Para alterar dados sensíveis, contate o suporte.</p>
    </div>
  );

  const NotificationsScreen = () => (
    <div className="p-6 text-center space-y-4">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
        <Bell className="w-8 h-8 text-primary" />
      </div>
      <h3>Nenhuma notificação nova</h3>
      <p className="text-muted-foreground text-sm">Você está em dia com todas as atualizações.</p>
    </div>
  );

  const PrivacyScreen = () => (
    <div className="p-6 space-y-4">
      <Card><CardContent className="p-4 text-sm">Seus dados são protegidos com criptografia de ponta a ponta no banco de dados Neon (PostgreSQL).</CardContent></Card>
      <Card><CardContent className="p-4 text-sm">Não compartilhamos suas informações com terceiros sem consentimento.</CardContent></Card>
    </div>
  );

  // --- RENDERIZAÇÃO PRINCIPAL ---

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      
      {/* Cabeçalho Dinâmico */}
      <div className="bg-primary text-primary-foreground p-6 pb-12 rounded-b-3xl shadow-lg transition-all duration-300">
        {subScreen === 'menu' ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center pt-4">
            <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-white/20 shadow-xl">
              <AvatarFallback className="bg-white/20 text-2xl font-bold">{user.nome.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <h2 className="mb-2 text-2xl font-bold">{user.nome}</h2>
            <Badge className="bg-white/20 border-0 mb-3 px-3 py-1 backdrop-blur-sm">{user.nivel_usuario || 'Iniciante'}</Badge>
          </motion.div>
        ) : (
          <div className="flex items-center gap-4 pt-4">
            <Button variant="ghost" size="icon" onClick={() => setSubScreen('menu')} className="text-white hover:bg-white/20">
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <h2 className="text-xl font-bold">
              {subScreen === 'personal' && 'Dados Pessoais'}
              {subScreen === 'notifications' && 'Notificações'}
              {subScreen === 'privacy' && 'Privacidade'}
              {subScreen === 'help' && 'Ajuda'}
            </h2>
          </div>
        )}
      </div>

      {/* Conteúdo Dinâmico */}
      <div className="relative z-10 -mt-8">
        <AnimatePresence mode="wait">
          {subScreen === 'menu' ? (
            <motion.div 
              key="menu"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
              className="px-6 space-y-6"
            >
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="border-none shadow-md"><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-primary">{user.total_descartes || 0}</div><p className="text-xs text-muted-foreground uppercase">Descartes</p></CardContent></Card>
                <Card className="border-none shadow-md"><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-secondary-foreground">{user.saldo_pontos}</div><p className="text-xs text-muted-foreground uppercase">Pontos</p></CardContent></Card>
              </div>

              {/* Menu Items */}
              <div className="space-y-3">
                <MenuItem icon={User} label="Dados pessoais" onClick={() => setSubScreen('personal')} />
                <MenuItem icon={Bell} label="Notificações" onClick={() => setSubScreen('notifications')} />
                <MenuItem icon={Shield} label="Privacidade" onClick={() => setSubScreen('privacy')} />
                <MenuItem icon={HelpCircle} label="Ajuda e suporte" onClick={() => toast.info("Suporte: contato@recife.pe.gov.br")} />
              </div>

              <div className="pt-4">
                <Button variant="outline" className="w-full h-12 text-destructive border-destructive/30 hover:bg-destructive/5" onClick={onLogout}>
                  <LogOut className="w-5 h-5 mr-2" /> Sair da conta
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="subscreen"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              className="px-4"
            >
              <Card className="min-h-[400px] shadow-lg border-none">
                {subScreen === 'personal' && <PersonalDataScreen />}
                {subScreen === 'notifications' && <NotificationsScreen />}
                {subScreen === 'privacy' && <PrivacyScreen />}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Componente Auxiliar de Menu
function MenuItem({ icon: Icon, label, onClick }: any) {
  return (
    <Card onClick={onClick} className="cursor-pointer hover:bg-muted/50 transition-all border-none shadow-sm active:scale-[0.98]">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/5 rounded-lg text-primary"><Icon className="w-5 h-5" /></div>
          <span className="font-medium">{label}</span>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground/50" />
      </CardContent>
    </Card>
  );
}