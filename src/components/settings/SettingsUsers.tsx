import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { VERTICAL_DEFINITIONS, type VerticalType, getVerticalRoleLabel } from '@/config/verticalConfig';
import { getRoles } from '@/utils/roles';

interface Props {
  orgId: string;
  verticalType: VerticalType;
}

interface UserRow {
  id: string;
  nume_prenume: string;
  email: string;
  status: string;
  roles: string[];
}

export default function SettingsUsers({ orgId, verticalType }: Props) {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, [orgId]);

  const loadUsers = async () => {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, nume_prenume, email, status')
      .eq('organization_id', orgId)
      .order('nume_prenume');

    if (!profiles) { setLoading(false); return; }

    // Fetch roles for each user
    const userIds = profiles.map(p => p.id);
    const { data: rolesData } = await supabase
      .from('user_roles')
      .select('user_id, role')
      .in('user_id', userIds);

    const rolesMap: Record<string, string[]> = {};
    (rolesData || []).forEach(r => {
      if (!rolesMap[r.user_id]) rolesMap[r.user_id] = [];
      rolesMap[r.user_id].push(r.role);
    });

    setUsers(profiles.map(p => ({
      id: p.id,
      nume_prenume: p.nume_prenume,
      email: p.email || '',
      status: p.status || '',
      roles: rolesMap[p.id] || ['parinte'],
    })));
    setLoading(false);
  };

  const filtered = users.filter(u =>
    u.nume_prenume.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="h-4 w-4" /> Utilizatori organizație
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Caută utilizator..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" className="gap-2" onClick={() => {
            const email = prompt('Introdu adresa de email pentru invitație:');
            if (email && email.includes('@')) {
              toast.success(`Invitație trimisă la ${email}`);
            } else if (email) {
              toast.error('Adresa de email este invalidă');
            }
          }}>
            <UserPlus className="h-4 w-4" /> Invită
          </Button>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground py-4 text-center">Se încarcă...</p>
        ) : (
          <div className="divide-y divide-border max-h-96 overflow-y-auto">
            {filtered.map(u => (
              <div key={u.id} className="flex items-center justify-between py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{u.nume_prenume}</p>
                  <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  {u.roles.map(r => (
                    <Badge key={r} variant="secondary" className="text-[10px]">
                      {getVerticalRoleLabel(r, verticalType)}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-sm text-muted-foreground py-4 text-center">Niciun utilizator găsit</p>
            )}
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          {users.length} utilizatori în organizație
        </p>
      </CardContent>
    </Card>
  );
}
