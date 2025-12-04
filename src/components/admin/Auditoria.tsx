import { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { CheckCircle, XCircle, Loader2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '../ui/badge';
// IMPORTANTE: Agora usamos as funções do serviço, não o fetch direto
import { getAuditoriaPendentes, processarAuditoria } from '../../services/dataService';

export function Auditoria() {
  const [pendentes, setPendentes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    // CORREÇÃO: Usa a função do serviço que aponta para a rota certa
    getAuditoriaPendentes()
      .then(data => setPendentes(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const decidir = async (id: string, acao: 'aprovado' | 'rejeitado', pontos: number) => {
    // CORREÇÃO: Usa a função do serviço
    const sucesso = await processarAuditoria(id, acao, pontos);
    
    if (sucesso) {
      toast.success(acao === 'aprovado' ? `Aprovado (+${pontos})` : 'Rejeitado');
      load(); // Recarrega a lista para remover o item
    } else {
      toast.error("Erro ao processar decisão.");
    }
  };

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="p-6 max-w-[1400px]">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Clock className="text-orange-500" /> Auditoria ({pendentes.length})
      </h2>
      
      {pendentes.length === 0 ? (
        <div className="text-center text-muted-foreground py-10 bg-muted/20 rounded-xl">
          <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500/50" />
          <p>Tudo limpo! Nenhum descarte pendente.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendentes.map((item) => (
            <Card key={item.id} className="overflow-hidden border-2 border-orange-100">
              <div className="h-64 bg-black/5 relative group">
                <img src={item.url_foto} className="w-full h-full object-contain bg-black" alt="Evidência" />
                <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
                   <p className="font-bold capitalize">{item.tipo_residuo}</p>
                   <p className="text-xs opacity-80">{new Date(item.criado_em).toLocaleString()}</p>
                </div>
              </div>
              
              <CardContent className="p-4 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Usuário:</span>
                  <span className="font-medium">{item.usuario_nome}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50" onClick={() => decidir(item.id, 'rejeitado', 0)}>
                    <XCircle className="mr-2 h-4 w-4" /> Rejeitar
                  </Button>
                  <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => decidir(item.id, 'aprovado', item.pontos_estimados)}>
                    <CheckCircle className="mr-2 h-4 w-4" /> Aprovar
                  </Button>
                </div>

                <div className="pt-2 border-t flex gap-2 justify-center">
                   <button onClick={() => decidir(item.id, 'aprovado', 10)} className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-green-100 text-green-700">Bom (+10)</button>
                   <button onClick={() => decidir(item.id, 'aprovado', 50)} className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-yellow-100 text-yellow-700">Ótimo (+50)</button>
                   <button onClick={() => decidir(item.id, 'aprovado', 100)} className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-purple-100 text-purple-700">Perfeito (+100)</button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}