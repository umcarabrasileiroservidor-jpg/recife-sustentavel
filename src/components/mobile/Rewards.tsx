import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Gift, Ticket, CreditCard, Calendar, MapPin, ShoppingBag, Film, Bus } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { toast } from 'sonner';
import { resgatarRecompensa } from '../../services/dataService'; // Correção do NOME
import { useUser } from '../../contexts/UserContext';

const rewards = [
  { id: 1, title: 'Vale Cinema', description: 'Ingresso grátis em salas 2D', value: 50, partner: 'Cinépolis', validity: '31/12/2025', type: 'evento', icon: Film },
  { id: 2, title: 'Desconto no Transporte', description: 'R$ 30 de crédito no VEM', value: 30, partner: 'Grande Recife', validity: '31/01/2026', type: 'credito', icon: Bus },
  { id: 3, title: 'Vale Shopping', description: 'R$ 50 de desconto', value: 50, partner: 'Shopping Recife', validity: '30/11/2025', type: 'voucher', icon: ShoppingBag },
  { id: 4, title: 'Desconto Restaurante', description: '20% de desconto até R$40', value: 40, partner: 'iFood', validity: '31/12/2025', type: 'desconto', icon: Ticket },
  { id: 5, title: 'Crédito Biblioteca', description: 'Mensalidade grátis por 1 mês', value: 80, partner: 'Biblioteca Municipal', validity: '31/03/2026', type: 'credito', icon: CreditCard },
  { id: 6, title: 'Vale Farmácia', description: 'R$ 25 em produtos', value: 25, partner: 'Farmácia Popular', validity: '31/12/2025', type: 'voucher', icon: Gift },
];

export function Rewards() {
  const [selectedReward, setSelectedReward] = useState<typeof rewards[0] | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);
  
  const { user, refreshUser } = useUser();
 const userBalance = (user as any)?.saldo_pontos || 0;

  const handleRedeem = async () => {
    if (selectedReward) {
      setIsRedeeming(true);
      
      const success = await resgatarRecompensa(selectedReward.value, selectedReward.title);

      if (success) {
        await refreshUser();
        setShowDialog(false);
        setSelectedReward(null);
      }
      setIsRedeeming(false);
    }
  };

  const openDialog = (reward: typeof rewards[0]) => {
    setSelectedReward(reward);
    setShowDialog(true);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-6">
        <h2 className="mb-2 font-bold text-xl">Recompensas</h2>
        <p className="text-primary-foreground/80 text-sm">Troque suas Capivaras por benefícios</p>
        
        <Card className="mt-4 bg-white/10 border-white/20 backdrop-blur-sm shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-primary-foreground/90 font-medium">Seu saldo</span>
              <span className="text-3xl font-bold">{userBalance} 🌿</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="p-6 space-y-4">
        <div className="grid grid-cols-1 gap-4">
          {rewards.map((reward, index) => {
            const Icon = reward.icon;
            const canAfford = userBalance >= reward.value;

            return (
              <motion.div key={reward.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                <Card className={`transition-opacity shadow-sm hover:shadow-md ${!canAfford ? 'opacity-60' : 'opacity-100'}`}>
                  <CardContent className="p-5">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-8 h-8 text-primary" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h4 className="mb-1 font-semibold">{reward.title}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-2">{reward.description}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                          <MapPin className="w-3 h-3" />
                          <span>{reward.partner}</span>
                          <span>•</span>
                          <Calendar className="w-3 h-3" />
                          <span>{reward.validity}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <Badge className={canAfford ? "bg-primary hover:bg-primary" : "bg-zinc-400"}>
                            {reward.value} 🌿
                          </Badge>
                          <Button
                            size="sm"
                            onClick={() => openDialog(reward)}
                            disabled={!canAfford}
                            className={!canAfford ? "opacity-50 cursor-not-allowed" : "bg-primary hover:bg-primary/90"}
                          >
                            Resgatar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Info card */}
        <Card className="border-secondary bg-secondary/5 shadow-none border-l-4 border-l-secondary">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Gift className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
              <div>
                <p className="mb-1 font-semibold text-secondary-foreground">Continue descartando!</p>
                <p className="text-sm text-muted-foreground">
                  Quanto mais você contribui com o meio ambiente, mais benefícios você ganha.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Redeem Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resgatar recompensa</DialogTitle>
            <DialogDescription>Confirme o resgate de sua recompensa</DialogDescription>
          </DialogHeader>

          {selectedReward && (
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    {(() => {
                      const Icon = selectedReward.icon;
                      return <Icon className="w-8 h-8 text-primary" />;
                    })()}
                    <div>
                      <h4 className="font-bold">{selectedReward.title}</h4>
                      <p className="text-sm text-muted-foreground">{selectedReward.partner}</p>
                    </div>
                  </div>
                  <p className="text-sm text-zinc-600">{selectedReward.description}</p>
                </CardContent>
              </Card>

              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <span className="text-sm font-medium">Custo:</span>
                <span className="font-bold text-primary">{selectedReward.value} 🌿</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <span className="text-sm font-medium">Saldo após resgate:</span>
                <span className="font-bold">{userBalance - selectedReward.value} 🌿</span>
              </div>
            </div>
          )}

          <DialogFooter className="flex-row justify-end gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowDialog(false)} disabled={isRedeeming}>
              Cancelar
            </Button>
            <Button onClick={handleRedeem} disabled={isRedeeming}>
              {isRedeeming ? 'Processando...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}