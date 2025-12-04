import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent } from '../ui/card';
import { TrendingUp, Users, Trash2, Gift, AlertTriangle } from 'lucide-react';
import { getAdminDashboardStats } from '../../services/dataService';

export function Dashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    getAdminDashboardStats().then(setData);
  }, []);

  // Enquanto carrega, mostra zeros em vez de nada
  const stats = data?.stats || { activeUsers: 0, activeBins: 0, activeRewards: 0, activePenalties: 0 };

  const cards = [
    { label: 'Usuários Ativos', value: stats.activeUsers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Lixeiras Ativas', value: stats.activeBins, icon: Trash2, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Recompensas', value: stats.activeRewards, icon: Gift, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Penalidades', value: stats.activePenalties, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg ${stat.bg} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                  <div className="text-3xl mb-1 font-bold">{stat.value}</div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}