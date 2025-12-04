import { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { MapPin, Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { getAdminBins, createAdminBin, deleteAdminBin, updateAdminBin } from '../../services/dataService';
import { toast } from 'sonner';

export function BinsManagement() {
  const [bins, setBins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  // Inicialização SEGURA para evitar "Uncontrolled input"
  const [formData, setFormData] = useState<any>({ location: '', lat: '', lng: '', type: 'reciclavel', status: 'ativa' });
  const [isEditing, setIsEditing] = useState(false);

  const load = () => {
    setLoading(true);
    getAdminBins().then(data => setBins(Array.isArray(data) ? data : [])).finally(() => setLoading(false));
  };
  
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    // Validação
    if (!formData.location || !formData.lat || !formData.lng) {
        toast.error("Preencha todos os campos!");
        return;
    }
    const payload = { ...formData, lat: parseFloat(formData.lat), lng: parseFloat(formData.lng) };
    const success = isEditing ? await updateAdminBin(payload) : await createAdminBin(payload);
    if (success) { toast.success('Salvo!'); setShowDialog(false); load(); } 
    else toast.error('Erro ao salvar');
  };

  const handleDelete = async (id: string) => {
    if (confirm('Excluir?')) { await deleteAdminBin(id); load(); }
  };

  const openEdit = (bin: any) => {
    // Garante que lat/lng virem strings para o input
    setFormData({
        id: bin.id,
        location: bin.location || '',
        lat: bin.lat ? String(bin.lat) : '',
        lng: bin.lng ? String(bin.lng) : '',
        type: bin.type || 'reciclavel',
        status: bin.status || 'ativa'
    });
    setIsEditing(true);
    setShowDialog(true);
  };

  const openCreate = () => {
    setFormData({ location: '', lat: '', lng: '', type: 'reciclavel', status: 'ativa' });
    setIsEditing(false);
    setShowDialog(true);
  };

  if (loading) return <div className="p-6 text-center"><Loader2 className="animate-spin mx-auto"/></div>;

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div className="flex justify-between items-center">
        <h2>Lixeiras</h2>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4"/> Nova</Button>
      </div>
      {/* Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
            <DialogHeader><DialogTitle>{isEditing ? 'Editar' : 'Nova'}</DialogTitle><DialogDescription>Dados</DialogDescription></DialogHeader>
            <div className="space-y-4">
                <div className="space-y-2"><Label>Nome</Label><Input value={formData.location} onChange={e=>setFormData({...formData, location: e.target.value})} /></div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Lat</Label><Input value={formData.lat} onChange={e=>setFormData({...formData, lat: e.target.value})} /></div>
                    <div className="space-y-2"><Label>Lng</Label><Input value={formData.lng} onChange={e=>setFormData({...formData, lng: e.target.value})} /></div>
                </div>
                <div className="space-y-2"><Label>Tipo</Label>
                    <Select value={formData.type} onValueChange={v=>setFormData({...formData, type: v})}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="reciclavel">Reciclável</SelectItem>
                            <SelectItem value="organico">Orgânico</SelectItem>
                            <SelectItem value="eletronico">Eletrônico</SelectItem>
                            <SelectItem value="vidro">Vidro</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <DialogFooter><Button onClick={handleSave}>Salvar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Tabela */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Local</TableHead><TableHead>Lat/Lng</TableHead><TableHead>Ações</TableHead></TableRow></TableHeader>
            <TableBody>
              {bins.map((bin) => (
                <TableRow key={bin.id}>
                  <TableCell>{bin.location}</TableCell>
                  <TableCell className="text-xs">{bin.lat}, {bin.lng}</TableCell>
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