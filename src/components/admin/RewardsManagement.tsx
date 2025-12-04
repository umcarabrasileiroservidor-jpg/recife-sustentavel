import { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Plus, Edit, Trash2, Gift, Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { getAdminRewards, createAdminReward, updateAdminReward, deleteAdminReward } from '../../services/dataService';
import { toast } from 'sonner';
import { Badge } from '../ui/badge';

export function RewardsManagement() {
  const [rewards, setRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState<any>({ title: '', description: '', value: '', partner: '', status: 'ativo' });
  const [isEditing, setIsEditing] = useState(false);

  const load = () => {
    setLoading(true);
    getAdminRewards().then(data => setRewards(Array.isArray(data) ? data : [])).finally(() => setLoading(false));
  };
  
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!formData.title || !formData.value) {
        toast.error("Título e Valor são obrigatórios!");
        return;
    }
    const success = isEditing ? await updateAdminReward(formData) : await createAdminReward(formData);
    if (success) { toast.success('Salvo!'); setShowDialog(false); load(); }
    else toast.error('Erro ao salvar');
  };

  const handleDelete = async (id: string) => {
    if (confirm('Excluir recompensa?')) { 
        const success = await deleteAdminReward(id); 
        if(success) { toast.success("Excluído!"); load(); }
    }
  };

  const openEdit = (r: any) => { 
      setFormData({
          id: r.id,
          title: r.title,
          description: r.description,
          value: r.value, // API retorna 'value'
          partner: r.partner,
          status: r.status
      }); 
      setIsEditing(true); 
      setShowDialog(true); 
  };
  
  const openCreate = () => { setFormData({ title: '', description: '', value: '', partner: '', status: 'ativo' }); setIsEditing(false); setShowDialog(true); };

  if (loading) return <div className="p-6 text-center"><Loader2 className="animate-spin mx-auto"/></div>;

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div className="flex justify-between items-center">
        <h2>Recompensas ({rewards.length})</h2>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild><Button onClick={openCreate}><Plus className="mr-2 h-4 w-4"/> Nova</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{isEditing ? 'Editar' : 'Nova'} Recompensa</DialogTitle><DialogDescription>Dados do prêmio</DialogDescription></DialogHeader>
            <div className="space-y-4">
                <div className="space-y-2"><Label>Título</Label><Input value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} /></div>
                <div className="space-y-2"><Label>Descrição</Label><Input value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} /></div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Valor (Pts)</Label><Input type="number" value={formData.value} onChange={e=>setFormData({...formData, value: e.target.value})} /></div>
                    <div className="space-y-2"><Label>Parceiro</Label><Input value={formData.partner} onChange={e=>setFormData({...formData, partner: e.target.value})} /></div>
                </div>
                 {isEditing && (
                    <div className="space-y-2"><Label>Status</Label>
                        <Select value={formData.status} onValueChange={v=>setFormData({...formData, status: v})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="ativo">Ativo</SelectItem><SelectItem value="inativo">Inativo</SelectItem></SelectContent>
                        </Select>
                    </div>
                )}
            </div>
            <DialogFooter><Button onClick={handleSave}>Salvar</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Card><CardContent className="p-0"><Table>
        <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Parceiro</TableHead><TableHead>Valor</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
        <TableBody>
          {rewards.map(r => (
            <TableRow key={r.id}>
              <TableCell><div className="flex items-center gap-2"><Gift className="w-4 h-4"/> {r.title}</div></TableCell>
              <TableCell>{r.partner}</TableCell>
              <TableCell>{r.value} pts</TableCell>
              <TableCell><Badge variant={r.status === 'ativo' ? 'default' : 'secondary'}>{r.status}</Badge></TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" onClick={() => openEdit(r)}><Edit className="w-4 h-4"/></Button>
                <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(r.id)}><Trash2 className="w-4 h-4"/></Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table></CardContent></Card>
    </div>
  );
}