import { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { MapPin, Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { getAdminBins, createAdminBin, deleteAdminBin, updateAdminBin } from '../../services/dataService';
import { toast } from 'sonner';

export function BinsManagement() {
  const [bins, setBins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState<any>({ location: '', lat: '', lng: '', type: 'reciclavel', status: 'ativa' });
  const [isEditing, setIsEditing] = useState(false);

  const load = () => {
    setLoading(true);
    getAdminBins().then(setBins).finally(() => setLoading(false));
  };
  
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    const payload = { ...formData, lat: parseFloat(formData.lat), lng: parseFloat(formData.lng) };
    const success = isEditing ? await updateAdminBin(payload) : await createAdminBin(payload);
    
    if (success) {
      toast.success(isEditing ? 'Atualizado!' : 'Criado!');
      setShowDialog(false);
      load();
    } else {
      toast.error('Erro ao salvar');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza?')) {
      const success = await deleteAdminBin(id);
      if (success) { toast.success('Excluído!'); load(); }
    }
  };

  const openEdit = (bin: any) => {
    setFormData(bin);
    setIsEditing(true);
    setShowDialog(true);
  };

  const openCreate = () => {
    setFormData({ location: '', lat: '', lng: '', type: 'reciclavel', status: 'ativa' });
    setIsEditing(false);
    setShowDialog(true);
  };

  if (loading) return <div className="p-6 text-center"><Loader2 className="animate-spin mx-auto"/> Carregando lixeiras...</div>;

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div className="flex justify-between items-center">
        <h2>Lixeiras</h2>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild><Button onClick={openCreate}><Plus className="mr-2 h-4 w-4"/> Nova Lixeira</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{isEditing ? 'Editar' : 'Nova'} Lixeira</DialogTitle></DialogHeader>
            <div className="space-y-4">
                <div className="space-y-2"><Label>Local</Label><Input value={formData.location} onChange={e=>setFormData({...formData, location: e.target.value})} /></div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Lat</Label><Input value={formData.lat} onChange={e=>setFormData({...formData, lat: e.target.value})} /></div>
                    <div className="space-y-2"><Label>Lng</Label><Input value={formData.lng} onChange={e=>setFormData({...formData, lng: e.target.value})} /></div>
                </div>
                <div className="space-y-2"><Label>Tipo</Label>
                    <Select value={formData.type} onValueChange={v=>setFormData({...formData, type: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="reciclavel">Reciclável</SelectItem>
                            <SelectItem value="organico">Orgânico</SelectItem>
                            <SelectItem value="eletronico">Eletrônico</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <DialogFooter><Button onClick={handleSave}>Salvar</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Local</TableHead><TableHead>Lat/Lng</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
            <TableBody>
              {bins.length === 0 && <TableRow><TableCell colSpan={4} className="text-center py-4">Nenhuma lixeira cadastrada.</TableCell></TableRow>}
              {bins.map((bin) => (
                <TableRow key={bin.id}>
                  <TableCell><div className="flex items-center gap-2"><MapPin className="w-4 h-4"/> {bin.location}</div></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{bin.lat}, {bin.lng}</TableCell>
                  <TableCell><Badge variant={bin.status === 'ativa' ? 'default' : 'destructive'}>{bin.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(bin)}><Edit className="w-4 h-4"/></Button>
                    <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(bin.id)}><Trash2 className="w-4 h-4"/></Button>
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