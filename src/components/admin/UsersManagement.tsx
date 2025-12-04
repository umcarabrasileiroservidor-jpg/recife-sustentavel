import { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Search, Award, Ban, CheckCircle, Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { getAdminUsers, updateAdminUserStatus, deleteAdminUser } from '../../services/dataService';

export function UsersManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = () => {
    setLoading(true);
    getAdminUsers()
      .then(data => setUsers(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleStatusChange = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ativo' ? 'banido' : 'ativo';
    const success = await updateAdminUserStatus(id, newStatus);
    if (success) { toast.success(`Status atualizado!`); load(); }
    else toast.error("Erro ao atualizar status");
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      const success = await deleteAdminUser(id);
      if (success) { toast.success('Usuário excluído'); load(); }
      else toast.error("Erro ao excluir");
    }
  };

  const filtered = users.filter(u => 
    (u.name?.toLowerCase() || '').includes(search.toLowerCase()) || 
    (u.email?.toLowerCase() || '').includes(search.toLowerCase())
  );

  if (loading) return <div className="p-6 text-center"><Loader2 className="animate-spin mx-auto"/> Carregando usuários...</div>;

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold">Usuários</h2>
            <p className="text-muted-foreground">{users.length} cadastrados</p>
        </div>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Saldo</TableHead>
                <TableHead>Nível</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-8">Nenhum usuário encontrado.</TableCell></TableRow>}
              {filtered.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar><AvatarFallback>{user.name?.[0]?.toUpperCase()}</AvatarFallback></Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.capivaras} 🌿</TableCell>
                  <TableCell><Badge variant="outline">{user.nivel}</Badge></TableCell>
                  <TableCell><Badge variant={user.status === 'ativo' ? 'default' : 'destructive'}>{user.status}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleStatusChange(user.id, user.status)}>
                        {user.status === 'ativo' ? <Ban className="w-4 h-4 text-red-500"/> : <CheckCircle className="w-4 h-4 text-green-500"/>}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(user.id)}>Excluir</Button>
                    </div>
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