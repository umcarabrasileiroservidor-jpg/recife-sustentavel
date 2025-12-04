import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Trash2, CheckCircle, XCircle, Calendar, Loader2 } from 'lucide-react';
import { getHistorico } from '../../services/dataService';

export function History() {
  const [disposals, setDisposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHistorico().then(data => {
      setDisposals(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-primary text-primary-foreground p-6">
        <h2 className="mb-2 text-2xl font-bold">Meus Descartes</h2>
      </div>
      <div className="p-6 space-y-4">
        {loading ? <Loader2 className="mx-auto animate-spin"/> : disposals.length === 0 ? <p className="text-center text-muted-foreground">Sem histórico.</p> : disposals.map((d, i) => (
          <motion.div key={d.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card>
              <CardContent className="p-4 flex gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${d.validado_ia ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                   {d.validado_ia ? <CheckCircle className="w-6 h-6"/> : <XCircle className="w-6 h-6"/>}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-2">
                    <span className="font-bold capitalize">{d.tipo_residuo}</span>
                    <Badge className={d.validado_ia ? "bg-primary" : "bg-destructive"}>+{d.pontos_ganhos}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3"/> {new Date(d.criado_em).toLocaleString('pt-BR')}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}