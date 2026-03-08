import { useState, useEffect } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from '@/api/users';
import type { User } from '@/types';
import { getRoleLabel } from '@/utils/roles';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Search, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [editOpen, setEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<User>>({});
  const [isNew, setIsNew] = useState(false);

  useEffect(() => { getUsers().then(setUsers); }, []);

  const filtered = users.filter((u) => {
    const matchSearch = u.nume_prenume.toLowerCase().includes(search.toLowerCase()) ||
      u.telefon.includes(search) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.status.includes(roleFilter);
    return matchSearch && matchRole;
  });

  const handleSave = async () => {
    if (isNew) {
      const u = await createUser(editingUser);
      setUsers((prev) => [...prev, u]);
      toast.success('Utilizator creat!');
    } else {
      await updateUser(editingUser);
      setUsers((prev) => prev.map((u) => u.id === editingUser.id ? { ...u, ...editingUser } : u));
      toast.success('Utilizator actualizat!');
    }
    setEditOpen(false);
  };

  const handleDelete = async (id: number) => {
    await deleteUser(id);
    setUsers((prev) => prev.filter((u) => u.id_utilizator !== id));
    toast.success('Utilizator șters!');
  };

  const openNew = () => {
    setEditingUser({ nume_prenume: '', telefon: '', email: '', status: 'parinte', grupe: [] });
    setIsNew(true);
    setEditOpen(true);
  };

  const openEdit = (user: User) => {
    setEditingUser({ ...user });
    setIsNew(false);
    setEditOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Utilizatori</h1>
          <p className="text-muted-foreground">{users.length} utilizatori înregistrați</p>
        </div>
        <Button className="gap-2" onClick={openNew}><Plus className="h-4 w-4" /> Adaugă Utilizator</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Caută după nume, telefon, email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Rol" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toate rolurile</SelectItem>
            <SelectItem value="parinte">Părinte</SelectItem>
            <SelectItem value="profesor">Profesor</SelectItem>
            <SelectItem value="director">Director</SelectItem>
            <SelectItem value="administrator">Administrator</SelectItem>
            <SelectItem value="secretara">Secretară</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nume</TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Roluri</TableHead>
                  <TableHead>Grupe</TableHead>
                  <TableHead className="w-24">Acțiuni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((user) => (
                  <TableRow key={user.id_utilizator}>
                    <TableCell className="font-medium">{user.nume_prenume}</TableCell>
                    <TableCell className="font-mono text-sm">{user.telefon}</TableCell>
                    <TableCell className="text-sm">{user.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.status.split(',').map((r) => (
                          <Badge key={r.trim()} variant="secondary" className="text-xs">{getRoleLabel(r.trim())}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{user.grupe.join(', ') || '—'}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(user)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Șterge utilizator?</AlertDialogTitle>
                              <AlertDialogDescription>Această acțiune este ireversibilă. Utilizatorul {user.nume_prenume} va fi șters permanent.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Anulează</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(user.id_utilizator)}>Șterge</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit/Create Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isNew ? 'Utilizator nou' : 'Editează utilizator'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Nume complet</Label><Input value={editingUser.nume_prenume || ''} onChange={(e) => setEditingUser({ ...editingUser, nume_prenume: e.target.value })} /></div>
            <div><Label>Telefon</Label><Input value={editingUser.telefon || ''} onChange={(e) => setEditingUser({ ...editingUser, telefon: e.target.value })} /></div>
            <div><Label>Email</Label><Input type="email" value={editingUser.email || ''} onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })} /></div>
            <div>
              <Label>Rol</Label>
              <Select value={editingUser.status || 'parinte'} onValueChange={(v) => setEditingUser({ ...editingUser, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="parinte">Părinte</SelectItem>
                  <SelectItem value="profesor">Profesor</SelectItem>
                  <SelectItem value="director">Director</SelectItem>
                  <SelectItem value="administrator">Administrator</SelectItem>
                  <SelectItem value="secretara">Secretară</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={handleSave}>Salvează</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
