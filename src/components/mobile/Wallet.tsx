import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { TrendingUp, TrendingDown, Gift, DollarSign, Calendar, Loader2 } from 'lucide-react';
import { Badge } from '../ui/badge';
import { useUser } from '../../contexts/UserContext';
import { getTransacoes } from '../../services/dataService';

export function Wallet() {
  const { user } = useUser();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTransacoes().then(data => {
      setTransactions(data);
      setLoading(false);
    });
  }, []);

  const totalEarned = transactions.filter(t => t.tipo === 'ganho').reduce((sum, t) => sum + t.valor, 0);
  const totalRedeemed = Math.abs(transactions.filter(t => t.tipo === 'resgate').reduce((sum, t) => sum + t.valor, 0));

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-gradient-to-br from-primary to-secondary text-primary-foreground p-6 pb-12 rounded-b-3xl">
        <h2 className="mb-6 text-2xl font-bold">Carteira</h2>
        <div className="text-center mb-6">
          <p className="text-primary-foreground/80 mb-2 text-sm">Saldo disponível</p>
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-5xl font-bold">{(user as any)?.saldo_pontos || 0}</span>
            <span className="text-3xl">🌿</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondary" className="h-12 bg-white/20 hover:bg-white/30 border-0"><Gift className="w-4 h-4 mr-2"/> Resgatar</Button>
          <Button variant="secondary" className="h-12 bg-white/20 hover:bg-white/30 border-0"><DollarSign className="w-4 h-4 mr-2"/> Transferir</Button>
        </div>
      </div>

      <div className="p-6 -mt-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-3">
          <Card><CardContent className="p-4"><div className="flex items-center gap-2 mb-2"><TrendingUp className="w-4 h-4 text-primary"/> <span className="text-sm">Ganhos</span></div><div className="text-2xl font-bold">{totalEarned}</div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center gap-2 mb-2"><TrendingDown className="w-4 h-4 text-accent"/> <span className="text-sm">Resgates</span></div><div className="text-2xl font-bold">{totalRedeemed}</div></CardContent></Card>
        </motion.div>

        <div className="space-y-3">
          <h3 className="font-bold text-lg">Extrato</h3>
          {loading ? <Loader2 className="mx-auto animate-spin"/> : transactions.map((t, i) => (
            <Card key={i} className="border-none shadow-sm">
              <CardContent className="p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.tipo === 'ganho' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                    {t.tipo === 'ganho' ? <TrendingUp className="w-5 h-5"/> : <Gift className="w-5 h-5"/>}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{t.descricao}</p>
                    <p className="text-xs text-muted-foreground">{new Date(t.criado_em).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                <div className={`font-bold ${t.valor > 0 ? 'text-primary' : 'text-accent'}`}>
                  {t.valor > 0 ? '+' : ''}{t.valor}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}