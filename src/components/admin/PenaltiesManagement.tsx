import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Plus, Search, AlertTriangle, Ban, XCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from '../ui/avatar';
// CORREÇÃO: Importando as funções corretas
import { getAdminPenalties, getAdminUsers, createAdminPenalty, deleteAdminPenalty } from '../../services/dataService';

export function PenaltiesManagement() {
  const [penalties, setPenalties] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  
  // Estados do Formulário
  const [selectedUserId, setSelectedUserId] = useState('');
  const [penaltyType, setPenaltyType] = useState('aviso');
  const [penaltyReason, setPenaltyReason] = useState('');
  const [penaltyDuration, setPenaltyDuration] = useState('');

  const loadData = async () => {
    getAdminPenalties().then(setPenalties);
    getAdminUsers().then(setUsers);
  };

  useEffect(() => { loadData(); }, []);

  const handleApply = async () => {
    if (!selectedUserId || !penaltyReason) {
      toast.error("Preencha os campos obrigatórios.");
      return;
    }

    const success = await createAdminPenalty({
      usuario_id: selectedUserId,
      tipo: penaltyType,
      motivo: penaltyReason,
      duracao: penaltyDuration ? parseInt(penaltyDuration) : 0
    });

    if (success) {
      toast.success('Penalidade aplicada!');
      setShowApplyDialog(false);
      loadData();
      setPenaltyReason('');
      setSelectedUserId('');
    } else {
      toast.error("Erro ao aplicar.");
    }
  };

  const handleRevoke = async (id: string) => {
    if (confirm('Revogar penalidade?')) {
        const success = await deleteAdminPenalty(id);
        if (success) {
            toast.success("Revogada com sucesso.");
            loadData();
        } else {
            toast.error("Erro ao revogar.");
        }
    }
  };

  const filteredPenalties = penalties.filter((penalty) =>
    (penalty.user || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div className="flex items-center justify-between">
        <div>
          <h2>Gerenciamento de Penalidades</h2>
          <p className="text-muted-foreground">{penalties.length} registradas</p>
        </div>
        
        <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
          <DialogTrigger asChild>
            <Button variant="destructive">
              <Plus className="w-4 h-4 mr-2" /> Aplicar Penalidade
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nova Penalidade</DialogTitle></DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Usuário</Label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {users.map(u => (
                      <SelectItem key={u.id} value={u.id}>{u.name} ({u.email})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={penaltyType} onValueChange={setPenaltyType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aviso">Aviso</SelectItem>
                    <SelectItem value="suspensao">Suspensão</SelectItem>
                    <SelectItem value="banimento">Banimento</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {penaltyType === 'suspensao' && (
                <div className="space-y-2"><Label>Dias</Label><Input type="number" value={penaltyDuration} onChange={e => setPenaltyDuration(e.target.value)} /></div>
              )}

              <div className="space-y-2"><Label>Motivo</Label><Textarea value={penaltyReason} onChange={e => setPenaltyReason(e.target.value)} /></div>
            </div>

            <DialogFooter><Button onClick={handleApply} variant="destructive">Aplicar</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabela */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Usuário</TableHead><TableHead>Tipo</TableHead><TableHead>Motivo</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
            <TableBody>
              {filteredPenalties.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar><AvatarFallback>{p.user?.[0]}</AvatarFallback></Avatar>
                      <div><p className="font-medium">{p.user}</p><p className="text-xs text-muted-foreground">{p.email}</p></div>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline">{p.type}</Badge></TableCell>
                  <TableCell><p className="max-w-xs truncate">{p.motivo}</p></TableCell>
                  <TableCell><Badge variant={p.status === 'ativa' ? 'destructive' : 'outline'}>{p.status}</Badge></TableCell>
                  <TableCell className="text-right">
                     {p.status === 'ativa' && <Button variant="ghost" size="sm" onClick={() => handleRevoke(p.id)}>Revogar</Button>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}