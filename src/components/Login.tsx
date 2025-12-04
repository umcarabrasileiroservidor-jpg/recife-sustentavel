import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Label } from './ui/label';
import { Recycle, Loader2, Mail, Lock, User, Phone, CreditCard, ArrowRight, Leaf } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { UserData } from '../App';
import { formatCPF, formatPhone } from '../utils/formatters';

interface LoginProps {
  onLogin: (userData: UserData, isAdmin?: boolean) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha: password })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Erro ao entrar');

      const dadosUsuario = data.usuario || data.user;
      if (!dadosUsuario) throw new Error("Erro: Dados do usuário não recebidos.");

      localStorage.setItem('recife_sustentavel_session', JSON.stringify({
        token: data.token,
        user: dadosUsuario
      }));

      const appUser: UserData = {
        id: dadosUsuario.id,
        name: dadosUsuario.nome || dadosUsuario.name,
        email: dadosUsuario.email,
        phone: dadosUsuario.telefone || dadosUsuario.phone || '',
        cpf: dadosUsuario.cpf,
        saldo_pontos: dadosUsuario.saldo_pontos || dadosUsuario.balance
      };

      toast.success(`Bem-vindo de volta, ${appUser.name.split(' ')[0]}!`);
      onLogin(appUser, !!dadosUsuario.is_admin);

    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: name, email, senha: password, cpf, telefone: phone })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Erro ao cadastrar');

      toast.success("Conta criada com sucesso! Faça login.");
      setActiveTab("login"); // Muda a aba visualmente

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f0fdf4] relative overflow-hidden">
      {/* Elementos de Fundo Decorativos */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-[#2E8B57] to-transparent opacity-10 pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-[#8BC34A] rounded-full blur-3xl opacity-20 pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#2E8B57] rounded-full blur-3xl opacity-20 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <motion.div 
            initial={{ y: -20 }} animate={{ y: 0 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-[#2E8B57] to-[#1a5e3a] mb-4 shadow-xl shadow-green-900/20 transform rotate-3"
          >
            <Recycle className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Recife Sustentável</h1>
          <p className="text-gray-500 mt-2 flex items-center justify-center gap-2">
            <Leaf className="w-4 h-4 text-green-500" /> Descarte certo, ganhe benefícios
          </p>
        </div>

        <Card className="border-0 shadow-2xl shadow-green-900/10 bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-6 pt-6">
              <TabsList className="grid w-full grid-cols-2 h-12 bg-gray-100/80 p-1 rounded-2xl">
                <TabsTrigger 
                  value="login" 
                  className="rounded-xl font-medium data-[state=active]:bg-white data-[state=active]:text-[#2E8B57] data-[state=active]:shadow-sm transition-all"
                >
                  Entrar
                </TabsTrigger>
                <TabsTrigger 
                  value="register" 
                  className="rounded-xl font-medium data-[state=active]:bg-white data-[state=active]:text-[#2E8B57] data-[state=active]:shadow-sm transition-all"
                >
                  Criar Conta
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="login" className="mt-0 space-y-4">
                <div className="space-y-1 mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">Bem-vindo de volta!</h2>
                  <p className="text-sm text-gray-500">Entre para gerenciar seus pontos.</p>
                </div>
                
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-600 font-medium">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input 
                        type="email" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        className="pl-10 h-12 bg-gray-50 border-gray-200 focus:border-[#2E8B57] focus:ring-[#2E8B57]/20 rounded-xl" 
                        placeholder="seu@email.com"
                        required 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-gray-600 font-medium">Senha</Label>
                      <a href="#" className="text-xs text-[#2E8B57] hover:underline font-medium">Esqueceu?</a>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input 
                        type="password" 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        className="pl-10 h-12 bg-gray-50 border-gray-200 focus:border-[#2E8B57] focus:ring-[#2E8B57]/20 rounded-xl" 
                        placeholder="••••••••"
                        required 
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-12 bg-[#2E8B57] hover:bg-[#246d44] text-lg font-bold rounded-xl shadow-lg shadow-green-600/20 transition-all active:scale-[0.98]" disabled={loading}>
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span className="flex items-center gap-2">Acessar Conta <ArrowRight className="w-5 h-5" /></span>}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="mt-0 space-y-4">
                <div className="space-y-1 mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">Crie sua conta</h2>
                  <p className="text-sm text-gray-500">Comece a ganhar capivaras hoje!</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-3">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input value={name} onChange={e => setName(e.target.value)} className="pl-10 h-11 rounded-xl bg-gray-50" placeholder="Nome Completo" required />
                    </div>
                    
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input value={cpf} onChange={e => setCpf(formatCPF(e.target.value))} maxLength={14} className="pl-10 h-11 rounded-xl bg-gray-50" placeholder="CPF" required />
                    </div>

                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input value={phone} onChange={e => setPhone(formatPhone(e.target.value))} maxLength={15} className="pl-10 h-11 rounded-xl bg-gray-50" placeholder="Telefone" required />
                    </div>

                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input type="email" value={email} onChange={e => setEmail(e.target.value)} className="pl-10 h-11 rounded-xl bg-gray-50" placeholder="Email" required />
                    </div>

                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input type="password" value={password} onChange={e => setPassword(e.target.value)} className="pl-10 h-11 rounded-xl bg-gray-50" placeholder="Senha" required minLength={6} />
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-12 mt-2 bg-[#2E8B57] hover:bg-[#246d44] font-bold rounded-xl shadow-lg shadow-green-600/20" disabled={loading}>
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Cadastrar Gratuitamente'}
                  </Button>
                </form>
              </TabsContent>
            </div>
          </Tabs>
        </Card>
        
        <p className="text-center text-xs text-gray-400 mt-8">
          © 2025 Recife Sustentável • Conecta Recife
        </p>
      </motion.div>
    </div>
  );
}