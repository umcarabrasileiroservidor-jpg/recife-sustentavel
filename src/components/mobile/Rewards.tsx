import { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Gift, Ticket, Film, Bus, ShoppingBag, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { toast } from 'sonner';
import { useUser } from '../../contexts/UserContext';
import { resgatarRecompensa, getRecompensas } from '../../services/dataService';

export function Rewards() {
  const [rewards, setRewards] = useState<any[]>([]); // Lista dinâmica
  const [loading, setLoading] = useState(true);
  const [selectedReward, setSelectedReward] = useState<any>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);
  
  const { user, refreshUser } = useUser();
  const userBalance = user?.saldo_pontos || 0;

  // Carregar do Banco
  useEffect(() => {
    getRecompensas().then(data => {
        setRewards(data);
        setLoading(false);
    });
  }, []);

  const handleRedeem = async () => {
    if (selectedReward) {
      setIsRedeeming(true);
      const success = await resgatarRecompensa(selectedReward.value, selectedReward.title);
      if (success) {
        toast.success("Resgate realizado! 🎉");
        await refreshUser(); // Puxa saldo novo do banco
        setShowDialog(false);
      } else {
        toast.error("Saldo insuficiente.");
      }
      setIsRedeeming(false);
    }
  };

  // Ícone dinâmico baseado no nome (hack visual simples)
  const getIcon = (title: string) => {
      if (title.includes('Cinema')) return Film;
      if (title.includes('Transporte') || title.includes('VEM')) return Bus;
      if (title.includes('Shopping')) return ShoppingBag;
      return Ticket;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-primary text-primary-foreground p-6">
        <h2 className="mb-2 font-bold text-xl">Recompensas</h2>
        <Card className="mt-4 bg-white/10 border-white/20 backdrop-blur-sm shadow-lg">
          <CardContent className="p-4 flex justify-between items-center">
             <span className="font-medium">Seu saldo</span>
             <span className="text-3xl font-bold">{userBalance} 🌿</span>
          </CardContent>
        </Card>
      </div>

      <div className="p-6 space-y-4">
        {loading ? <Loader2 className="mx-auto animate-spin" /> : (
            <div className="grid grid-cols-1 gap-4">
            {rewards.map((reward) => {
                const Icon = getIcon(reward.title);
                const canAfford = userBalance >= reward.value;
                return (
                <Card key={reward.id} className={!canAfford ? 'opacity-60' : ''}>
                    <CardContent className="p-5 flex gap-4 items-center">
                    <div className="p-3 bg-primary/10 rounded-xl text-primary"><Icon className="w-6 h-6" /></div>
                    <div className="flex-1">
                        <h4 className="font-bold">{reward.title}</h4>
                        <p className="text-sm text-muted-foreground">{reward.description}</p>
                        <div className="flex justify-between mt-2 items-center">
                            <Badge>{reward.value} 🌿</Badge>
                            <Button size="sm" disabled={!canAfford} onClick={() => { setSelectedReward(reward); setShowDialog(true); }}>Resgatar</Button>
                        </div>
                    </div>
                    </CardContent>
                </Card>
                );
            })}
            </div>
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
            <DialogHeader><DialogTitle>Confirmar</DialogTitle></DialogHeader>
            <p>Trocar <b>{selectedReward?.value}</b> pontos por <b>{selectedReward?.title}</b>?</p>
            <DialogFooter>
                <Button onClick={handleRedeem} disabled={isRedeeming}>{isRedeeming ? '...' : 'Confirmar'}</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}