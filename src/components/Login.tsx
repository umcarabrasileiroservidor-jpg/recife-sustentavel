import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Label } from './ui/label';
import { Recycle, Mail, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { UserData } from '../App';
import { formatCPF, formatPhone, validateCPF } from '../utils/formatters';
import { supabase } from '../supabaseClient';

interface LoginProps {
  onLogin: (userData: UserData, isAdmin?: boolean) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');

  // --- LOGIN ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) throw authError;

      // Busca o perfil completado pelo Trigger
      const { data: userProfile, error: profileError } = await supabase
        .from('usuario')
        .select('*')
        .eq('uuid', authData.user?.id)
        .single();

      if (profileError || !userProfile) {
        throw new Error("Perfil não encontrado. Contate o suporte.");
      }

      const appUser: UserData = {
        id: userProfile.id_usuario,
        name: userProfile.nome,
        email: userProfile.email,
        phone: userProfile.telefone || '',
        cpf: userProfile.cpf
      };

      localStorage.setItem('recife_sustentavel_current_user', JSON.stringify({
        ...appUser,
        uuid: authData.user?.id,
        lastDisposalTime: null 
      }));

      toast.success(`Bem-vindo(a), ${userProfile.nome.split(' ')[0]}!`);
      onLogin(appUser, false);

    } catch (error: any) {
      if (error.message.includes("Email not confirmed")) {
        toast.warning("Verifique seu e-mail para ativar a conta.");
      } else {
        toast.error(error.message || "Erro ao entrar.");
      }
    } finally {
      setLoading(false);
    }
  };

  // --- CADASTRO VIA GATILHO ---
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateCPF(cpf)) {
      toast.error("CPF Inválido.");
      return;
    }

    setLoading(true);

    try {
      // Mágica aqui: Enviamos os dados extras dentro de 'options.data'
      // O Trigger do SQL vai ler isso e criar a tabela usuario sozinho.
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome: name,
            cpf: cpf,
            telefone: phone
          }
        }
      });

      if (error) throw error;

      setEmailSent(true);
      toast.success("Conta criada! Verifique seu e-mail.");

    } catch (error: any) {
      toast.error(error.message || "Erro ao cadastrar.");
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <Card className="w-full max-w-md border-primary/20 shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl text-primary">Verifique seu E-mail</CardTitle>
            <CardDescription>Link enviado para <strong>{email}</strong></CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-center text-muted-foreground mb-4">
              Clique no link enviado para ativar sua conta. Depois, volte aqui e faça login.
            </p>
            <Button className="w-full" variant="outline" onClick={() => setEmailSent(false)}>
              Voltar para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary mb-4 shadow-lg">
            <Recycle className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-primary">Recife Sustentável</h1>
          <p className="text-muted-foreground">Login Seguro</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login">Entrar</TabsTrigger>
            <TabsTrigger value="register">Cadastrar</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Acessar Conta</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Senha</Label>
                    <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Entrar'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Nova Conta</CardTitle>
                <CardDescription>Preencha seus dados reais</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nome</Label>
                    <Input value={name} onChange={e => setName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>CPF</Label>
                    <Input value={cpf} onChange={e => setCpf(formatCPF(e.target.value))} maxLength={14} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <Input value={phone} onChange={e => setPhone(formatPhone(e.target.value))} maxLength={15} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Senha</Label>
                    <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Criar Conta'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}