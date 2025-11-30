import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Label } from './ui/label';
import { Recycle, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { UserData } from '../App';
import { formatCPF, formatPhone } from '../utils/formatters';

interface LoginProps {
  onLogin: (userData: UserData, isAdmin?: boolean) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [loading, setLoading] = useState(false);
  
  // Estados
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');

  // --- LOGIN VIA API VERCEL ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Erro ao entrar');

      // Salva a sessão
      localStorage.setItem('recife_sustentavel_session', JSON.stringify({
        token: data.token,
        user: data.user
      }));

      // Adapta para o App
      const appUser: UserData = {
        id: 0, // ID numérico legado, pode ignorar
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone || '',
        cpf: data.user.cpf
      };

      toast.success(`Bem-vindo, ${data.user.name}!`);
      onLogin(appUser, false);

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- CADASTRO VIA API VERCEL ---
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, cpf, phone })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Erro ao cadastrar');

      toast.success("Conta criada! Faça login.");
      const tabsTrigger = document.querySelector('[data-value="login"]') as HTMLElement;
      if(tabsTrigger) tabsTrigger.click();

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary mb-4 shadow-lg">
            <Recycle className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-primary">Recife Sustentável</h1>
          <p className="text-muted-foreground">Login (Neon DB)</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login">Entrar</TabsTrigger>
            <TabsTrigger value="register">Cadastrar</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader><CardTitle>Acessar</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2"><Label>Email</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
                  <div className="space-y-2"><Label>Senha</Label><Input type="password" value={password} onChange={e => setPassword(e.target.value)} required /></div>
                  <Button type="submit" className="w-full" disabled={loading}>{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Entrar'}</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card>
              <CardHeader><CardTitle>Nova Conta</CardTitle><CardDescription>Dados salvos no Neon</CardDescription></CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2"><Label>Nome</Label><Input value={name} onChange={e => setName(e.target.value)} required /></div>
                  <div className="space-y-2"><Label>CPF</Label><Input value={cpf} onChange={e => setCpf(formatCPF(e.target.value))} maxLength={14} required /></div>
                  <div className="space-y-2"><Label>Telefone</Label><Input value={phone} onChange={e => setPhone(formatPhone(e.target.value))} maxLength={15} required /></div>
                  <div className="space-y-2"><Label>Email</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
                  <div className="space-y-2"><Label>Senha</Label><Input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} /></div>
                  <Button type="submit" className="w-full" disabled={loading}>{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Criar Conta'}</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}