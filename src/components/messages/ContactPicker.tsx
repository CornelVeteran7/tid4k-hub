import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, User, Users, Megaphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { areRol } from '@/utils/roles';
import type { UserSession } from '@/types';

interface Contact {
  id: string;
  nume_prenume: string;
  status: string;
  email?: string;
}

interface ContactPickerProps {
  open: boolean;
  onClose: () => void;
  user: UserSession;
  onSelectContact: (contact: Contact) => void;
  onCreateGroupBroadcast?: (groupId: string, groupName: string) => void;
}

export default function ContactPicker({ open, onClose, user, onSelectContact, onCreateGroupBroadcast }: ContactPickerProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const userRoles = user.status || '';
  const isDirector = areRol(userRoles, 'director') || areRol(userRoles, 'administrator') || areRol(userRoles, 'inky');
  const isTeacher = areRol(userRoles, 'profesor');
  const isParent = areRol(userRoles, 'parinte');

  useEffect(() => {
    if (!open || !user.organization_id) return;
    loadContacts();
  }, [open, user.organization_id]);

  const loadContacts = async () => {
    setLoading(true);
    try {
      if (isDirector) {
        // Directors see everyone in org
        const { data } = await supabase
          .from('profiles')
          .select('id, nume_prenume, status, email')
          .eq('organization_id', user.organization_id!)
          .neq('id', user.id)
          .order('nume_prenume');
        setContacts((data as Contact[]) || []);
      } else if (isTeacher) {
        // Teachers see: staff + parents from their groups
        const { data: allProfiles } = await supabase
          .from('profiles')
          .select('id, nume_prenume, status, email')
          .eq('organization_id', user.organization_id!)
          .neq('id', user.id)
          .order('nume_prenume');

        if (!allProfiles) { setContacts([]); return; }

        // Get teacher's group IDs
        const groupIds = user.grupe_disponibile.map(g => g.id);

        // Get parent IDs from children in those groups
        const { data: children } = await supabase
          .from('children')
          .select('parinte_id')
          .in('group_id', groupIds);

        const parentIds = new Set((children || []).map(c => c.parinte_id).filter(Boolean));

        // Filter: staff (non-parent roles) + parents from groups
        const filtered = allProfiles.filter(p => {
          const pStatus = p.status || '';
          const isStaffProfile = areRol(pStatus, 'profesor') || areRol(pStatus, 'director') || areRol(pStatus, 'administrator') || areRol(pStatus, 'secretara');
          const isGroupParent = parentIds.has(p.id);
          return isStaffProfile || isGroupParent;
        });

        setContacts(filtered as Contact[]);
      } else if (isParent) {
        // Parents see: teachers from their children's groups
        const groupIds = user.grupe_disponibile.map(g => g.id);

        // We need to find which profiles are teachers/directors linked to these groups
        // For simplicity, get all staff in org — parents can message any staff member assigned to their children
        const { data: allProfiles } = await supabase
          .from('profiles')
          .select('id, nume_prenume, status, email')
          .eq('organization_id', user.organization_id!)
          .neq('id', user.id)
          .order('nume_prenume');

        // Filter to only staff
        const staffOnly = (allProfiles || []).filter(p => {
          const pStatus = p.status || '';
          return areRol(pStatus, 'profesor') || areRol(pStatus, 'director') || areRol(pStatus, 'administrator');
        });

        setContacts(staffOnly as Contact[]);
      }
    } catch (err) {
      console.error('Failed to load contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return contacts;
    const q = search.toLowerCase();
    return contacts.filter(c => c.nume_prenume.toLowerCase().includes(q));
  }, [contacts, search]);

  const getRoleBadge = (status: string) => {
    if (areRol(status, 'director')) return 'Director';
    if (areRol(status, 'administrator')) return 'Admin';
    if (areRol(status, 'profesor')) return 'Profesor';
    if (areRol(status, 'secretara')) return 'Secretară';
    if (areRol(status, 'parinte')) return 'Părinte';
    return null;
  };

  const showGroupBroadcast = isTeacher && onCreateGroupBroadcast && user.grupe_disponibile.length > 0;

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-sm max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-4 pt-4 pb-0">
          <DialogTitle className="text-base">Conversație nouă</DialogTitle>
        </DialogHeader>

        <div className="px-4 py-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Caută contact..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-muted/50 border-0"
            />
          </div>
        </div>

        {/* Group broadcast option */}
        {showGroupBroadcast && (
          <div className="px-4 pb-2 space-y-1">
            {user.grupe_disponibile.map(g => (
              <button
                key={`group-${g.id}`}
                onClick={() => {
                  onCreateGroupBroadcast!(g.id, g.nume);
                  onClose();
                }}
                className="w-full text-left px-3 py-2.5 rounded-lg bg-primary/5 border border-primary/20 flex items-center gap-3 hover:bg-primary/10 transition-colors"
              >
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Megaphone className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Anunț {g.nume}</p>
                  <p className="text-[11px] text-muted-foreground">Mesaj către toți părinții</p>
                </div>
              </button>
            ))}
          </div>
        )}

        <ScrollArea className="flex-1 min-h-0">
          {loading ? (
            <div className="p-6 text-center text-muted-foreground text-sm">Se încarcă...</div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-sm">
              {search ? 'Niciun contact găsit' : 'Nu ai contacte disponibile'}
            </div>
          ) : (
            <div className="px-4 pb-4 space-y-0.5">
              {filtered.map(contact => {
                const roleBadge = getRoleBadge(contact.status);
                return (
                  <button
                    key={contact.id}
                    onClick={() => {
                      onSelectContact(contact);
                      onClose();
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 hover:bg-muted/60 transition-colors"
                  >
                    <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{contact.nume_prenume}</p>
                      {contact.email && (
                        <p className="text-[11px] text-muted-foreground truncate">{contact.email}</p>
                      )}
                    </div>
                    {roleBadge && (
                      <Badge variant="outline" className="text-[10px] shrink-0">{roleBadge}</Badge>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
