import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Monitor, ExternalLink, Pencil, Trash2, Image, Plus, Wifi, WifiOff, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { differenceInMinutes } from 'date-fns';

type DeviceStatus = 'online' | 'warning' | 'stale' | 'offline' | 'unknown';

interface DisplayDevice {
  id: string;
  organization_id: string;
  alias: string;
  raspberry_id: string | null;
  last_heartbeat: string | null;
  screenshot_url: string | null;
  ip_address: string | null;
  os_info: string | null;
  app_version: string | null;
  status: string;
  created_at: string;
  organizations?: { name: string; slug: string | null; vertical_type: string } | null;
}

function computeStatus(lastHeartbeat: string | null): DeviceStatus {
  if (!lastHeartbeat) return 'unknown';
  const mins = differenceInMinutes(new Date(), new Date(lastHeartbeat));
  if (mins <= 65) return 'online';
  if (mins <= 125) return 'warning';
  if (mins <= 1440) return 'stale';
  return 'offline';
}

const statusConfig: Record<DeviceStatus, { color: string; label: string; icon: typeof Wifi; bgClass: string }> = {
  online: { color: 'text-green-500', label: 'Online', icon: Wifi, bgClass: 'border-green-500/30 bg-green-500/5' },
  warning: { color: 'text-violet-500', label: 'Întârziat', icon: Clock, bgClass: 'border-violet-500/30 bg-violet-500/5' },
  stale: { color: 'text-muted-foreground', label: 'Inactiv', icon: AlertTriangle, bgClass: 'border-border bg-muted/30' },
  offline: { color: 'text-destructive', label: 'Offline', icon: WifiOff, bgClass: 'border-destructive/30 bg-destructive/5' },
  unknown: { color: 'text-muted-foreground', label: 'Necunoscut', icon: Monitor, bgClass: 'border-border bg-muted/10' },
};

export default function SuperAdminDisplayMonitor() {
  const queryClient = useQueryClient();
  const [editDevice, setEditDevice] = useState<DisplayDevice | null>(null);
  const [editAlias, setEditAlias] = useState('');
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newDevice, setNewDevice] = useState({ alias: '', raspberry_id: '', organization_id: '' });

  const { data: devices, isLoading } = useQuery({
    queryKey: ['sa-display-devices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('display_devices')
        .select('*, organizations(name, slug, vertical_type)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as DisplayDevice[];
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const { data: orgs } = useQuery({
    queryKey: ['sa-orgs-for-devices'],
    queryFn: async () => {
      const { data } = await supabase.from('organizations').select('id, name').order('name');
      return data || [];
    },
  });

  const updateAlias = useMutation({
    mutationFn: async ({ id, alias }: { id: string; alias: string }) => {
      const { error } = await supabase.from('display_devices').update({ alias }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sa-display-devices'] });
      setEditDevice(null);
      toast.success('Alias actualizat');
    },
  });

  const deleteDevice = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('display_devices').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sa-display-devices'] });
      toast.success('Device șters');
    },
  });

  const addDevice = useMutation({
    mutationFn: async (dev: { alias: string; raspberry_id: string; organization_id: string }) => {
      const { error } = await supabase.from('display_devices').insert({
        alias: dev.alias || 'Display',
        raspberry_id: dev.raspberry_id || null,
        organization_id: dev.organization_id,
        status: 'unknown',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sa-display-devices'] });
      setAddDialogOpen(false);
      setNewDevice({ alias: '', raspberry_id: '', organization_id: '' });
      toast.success('Device adăugat');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Stats
  const statusCounts = (devices || []).reduce((acc, d) => {
    const s = computeStatus(d.last_heartbeat);
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {} as Record<DeviceStatus, number>);

  if (isLoading) return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-44 rounded-xl" />)}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Status summary */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1">
          <Monitor className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{devices?.length || 0} device-uri</span>
        </div>
        {(['online', 'warning', 'stale', 'offline'] as DeviceStatus[]).map(s => {
          const cfg = statusConfig[s];
          const Icon = cfg.icon;
          return (
            <Badge key={s} variant="outline" className={`gap-1 ${cfg.color}`}>
              <Icon className="h-3 w-3" /> {statusCounts[s] || 0} {cfg.label}
            </Badge>
          );
        })}
        <div className="flex-1" />
        <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => setAddDialogOpen(true)}>
          <Plus className="h-3 w-3" /> Adaugă Device
        </Button>
      </div>

      {/* Device grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {(devices || []).map(device => {
          const liveStatus = computeStatus(device.last_heartbeat);
          const cfg = statusConfig[liveStatus];
          const Icon = cfg.icon;
          const orgSlug = device.organizations?.slug || device.organization_id;
          const minsAgo = device.last_heartbeat
            ? differenceInMinutes(new Date(), new Date(device.last_heartbeat))
            : null;

          return (
            <Card key={device.id} className={`overflow-hidden transition-shadow hover:shadow-md ${cfg.bgClass}`}>
              <CardContent className="p-0">
                {/* Screenshot or iframe preview */}
                <div className="relative" style={{ paddingTop: '56.25%' }}>
                  {device.screenshot_url ? (
                    <img
                      src={device.screenshot_url}
                      alt={`Screenshot ${device.alias}`}
                      className="absolute inset-0 w-full h-full object-cover cursor-pointer"
                      onClick={() => setScreenshotPreview(device.screenshot_url)}
                    />
                  ) : (
                    <iframe
                      src={`${window.location.origin}/display/${orgSlug}`}
                      className="absolute inset-0 w-full h-full border-0 pointer-events-none"
                      title={`Display ${device.alias}`}
                      loading="lazy"
                    />
                  )}
                  {/* Status indicator */}
                  <div className={`absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium ${cfg.color} bg-background/80 backdrop-blur-sm`}>
                    <Icon className="h-3 w-3" />
                    {minsAgo !== null ? (minsAgo < 1 ? 'acum' : `${minsAgo}min`) : '—'}
                  </div>
                  {/* Open full screen */}
                  <div className="absolute bottom-2 right-2 opacity-0 hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="secondary" className="h-6 w-6" onClick={() => window.open(`/display/${orgSlug}`, '_blank')}>
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-2 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground truncate">{device.alias}</span>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => { setEditDevice(device); setEditAlias(device.alias); }}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      {device.screenshot_url && (
                        <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => setScreenshotPreview(device.screenshot_url)}>
                          <Image className="h-3 w-3" />
                        </Button>
                      )}
                      <Button size="icon" variant="ghost" className="h-5 w-5 text-destructive" onClick={() => {
                        if (confirm('Ștergi acest device?')) deleteDevice.mutate(device.id);
                      }}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-muted-foreground truncate">{device.organizations?.name || '—'}</span>
                    <Badge variant="outline" className="text-[7px]">{device.organizations?.vertical_type || '—'}</Badge>
                  </div>
                  {device.ip_address && <div className="text-[8px] text-muted-foreground font-mono">{device.ip_address}</div>}
                  {device.raspberry_id && <div className="text-[8px] text-muted-foreground font-mono truncate">ID: {device.raspberry_id}</div>}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit alias dialog */}
      <Dialog open={!!editDevice} onOpenChange={open => { if (!open) setEditDevice(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editează Device</DialogTitle></DialogHeader>
          <Input value={editAlias} onChange={e => setEditAlias(e.target.value)} placeholder="Alias device" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDevice(null)}>Anulează</Button>
            <Button onClick={() => editDevice && updateAlias.mutate({ id: editDevice.id, alias: editAlias })}
              disabled={updateAlias.isPending}>Salvează</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add device dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Adaugă Device Nou</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input value={newDevice.alias} onChange={e => setNewDevice(p => ({ ...p, alias: e.target.value }))} placeholder="Alias (ex: Display Hol)" />
            <Input value={newDevice.raspberry_id} onChange={e => setNewDevice(p => ({ ...p, raspberry_id: e.target.value }))} placeholder="Raspberry Pi ID (opțional)" />
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={newDevice.organization_id}
              onChange={e => setNewDevice(p => ({ ...p, organization_id: e.target.value }))}
            >
              <option value="">Selectează organizația</option>
              {(orgs || []).map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Anulează</Button>
            <Button onClick={() => addDevice.mutate(newDevice)} disabled={!newDevice.organization_id || addDevice.isPending}>Adaugă</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Screenshot preview dialog */}
      <Dialog open={!!screenshotPreview} onOpenChange={open => { if (!open) setScreenshotPreview(null); }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>Screenshot Preview</DialogTitle></DialogHeader>
          {screenshotPreview && <img src={screenshotPreview} alt="Device screenshot" className="w-full rounded-lg" />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
