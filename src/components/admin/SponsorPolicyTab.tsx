import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Shield, AlertTriangle, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { getSponsorPolicy, upsertSponsorPolicy, type SponsorPolicy } from '@/api/sponsorPolicies';

export default function SponsorPolicyTab() {
  const { user } = useAuth();
  const orgId = user?.organization_id;
  const verticalType = user?.vertical_type || 'kids';
  const [policy, setPolicy] = useState<Partial<SponsorPolicy>>({
    max_sponsor_share_percent: 30,
    allowed_categories: [],
    blocked_categories: [],
    requires_approval: true,
    no_cameras_declaration: true,
  });
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orgId) return;
    getSponsorPolicy(orgId).then(p => {
      if (p) setPolicy(p);
      setLoading(false);
    });
  }, [orgId]);

  const save = async () => {
    if (!orgId) return;
    try {
      await upsertSponsorPolicy(orgId, policy);
      toast.success('Politica sponsori salvată');
    } catch (e: any) { toast.error(e.message); }
  };

  const addAllowed = () => {
    if (!newCategory.trim()) return;
    setPolicy(p => ({ ...p, allowed_categories: [...(p.allowed_categories || []), newCategory.trim()] }));
    setNewCategory('');
  };

  const removeAllowed = (cat: string) => {
    setPolicy(p => ({ ...p, allowed_categories: (p.allowed_categories || []).filter(c => c !== cat) }));
  };

  if (loading) return <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  const isLiving = verticalType === 'living';
  const isKidsOrSchools = verticalType === 'kids' || verticalType === 'schools';

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" /> Politica Sponsori
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Max share */}
          <div>
            <Label className="text-xs text-muted-foreground">Procent maxim sponsori în rotația display</Label>
            <div className="flex items-center gap-3 mt-1">
              <Slider
                value={[policy.max_sponsor_share_percent || 30]}
                onValueChange={([v]) => setPolicy(p => ({ ...p, max_sponsor_share_percent: v }))}
                min={5} max={50} step={5}
                className="flex-1"
              />
              <Badge variant="secondary" className="text-xs shrink-0">{policy.max_sponsor_share_percent}%</Badge>
            </div>
          </div>

          {/* Approval required */}
          <div className="flex items-center justify-between">
            <Label className="text-sm">Aprobare obligatorie pentru sponsori noi</Label>
            <Switch
              checked={policy.requires_approval}
              onCheckedChange={v => setPolicy(p => ({ ...p, requires_approval: v }))}
            />
          </div>

          {/* Living: No cameras declaration */}
          {isLiving && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-3 space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-800 dark:text-amber-200">Declarație confidențialitate</span>
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Acest bloc declară că NU utilizează camere de supraveghere, tracking comportamental sau targeting publicitar.
                Sponsorii sunt afișați exclusiv ca servicii locale relevante.
              </p>
              <div className="flex items-center gap-2">
                <Switch
                  checked={policy.no_cameras_declaration}
                  onCheckedChange={v => setPolicy(p => ({ ...p, no_cameras_declaration: v }))}
                />
                <Label className="text-xs">Confirm declarația — fără camere și tracking</Label>
              </div>
            </div>
          )}

          {/* Kids/Schools: locked category */}
          {isKidsOrSchools && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800 p-3">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Restricție categorie</span>
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                Pentru verticalele Kids și Schools, sponsorii sunt restricționați la categoria "Partener comunitar".
              </p>
            </div>
          )}

          {/* Allowed categories */}
          <div>
            <Label className="text-xs text-muted-foreground">Categorii permise</Label>
            <div className="flex gap-2 mt-1">
              <Input value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="Ex: educație, sănătate..." className="flex-1" />
              <Button size="sm" variant="outline" onClick={addAllowed}>+</Button>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {(policy.allowed_categories || []).map(cat => (
                <Badge key={cat} variant="secondary" className="text-xs cursor-pointer" onClick={() => removeAllowed(cat)}>
                  {cat} ×
                </Badge>
              ))}
              {(policy.allowed_categories || []).length === 0 && (
                <span className="text-xs text-muted-foreground">Toate categoriile permise</span>
              )}
            </div>
          </div>

          <Button onClick={save} className="w-full">Salvează politica</Button>
        </CardContent>
      </Card>
    </div>
  );
}
