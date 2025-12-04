import { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { getPenalidades } from '../../services/dataService';

export function Penalties() {
  const [penalties, setPenalties] = useState<any[]>([]);
  
  useEffect(() => { getPenalidades().then(setPenalties); }, []);
  const active = penalties.filter(p => p.status === 'ativa');

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className={`p-6 ${active.length ? 'bg-destructive text-white' : 'bg-primary text-white'}`}>
        <h2 className="mb-2 font-bold text-2xl">Penalidades</h2>
        <p>{active.length ? 'Você possui penalidades ativas' : 'Situação regular'}</p>
      </div>
      <div className="p-6 space-y-4">
         {!active.length && (
             <Card className="border-primary bg-primary/5"><CardContent className="p-6 text-center"><CheckCircle className="w-16 h-16 text-primary mx-auto mb-4"/><h3>Parabéns!</h3><p>Sua conta está regular.</p></CardContent></Card>
         )}
         {penalties.map(p => (
             <Card key={p.id} className={p.status === 'ativa' ? 'border-destructive' : 'opacity-60'}>
                 <CardContent className="p-4">
                    <div className="flex justify-between mb-2"><Badge variant={p.status === 'ativa' ? 'destructive' : 'outline'}>{p.tipo}</Badge> <span className="text-xs text-muted-foreground">{new Date(p.data_aplicacao).toLocaleDateString()}</span></div>
                    <p>{p.motivo}</p>
                 </CardContent>
             </Card>
         ))}
      </div>
    </div>
  );
}