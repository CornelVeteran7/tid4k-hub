import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useGroup } from '@/contexts/GroupContext';
import { getRoles, getRoleLabel, areRol } from '@/utils/roles';
import { getChildrenByGroup } from '@/api/children';
import type { Child } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import {
  User, Phone, Mail, Shield, Users, Baby, Calendar,
  Bell, Moon, Smartphone, Save, GraduationCap, School
} from 'lucide-react';
import { toast } from 'sonner';

export default function MyProfile() {
  const { user } = useAuth();
  const { currentGroup, availableGroups } = useGroup();
  const [children, setChildren] = useState<Child[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    telefon: '',
  });

  // Notification preferences (stored locally for now)
  const [prefs, setPrefs] = useState({
    notif_email: true,
    notif_push: true,
    dark_mode: false,
  });

  useEffect(() => {
    if (user) {
      setFormData({ email: user.email, telefon: user.telefon });
    }
  }, [user]);

  useEffect(() => {
    if (currentGroup) {
      getChildrenByGroup(currentGroup.id).then(setChildren);
    }
  }, [currentGroup]);

  if (!user) return null;

  const roles = getRoles(user.status);
  const isParent = areRol(user.status, 'parinte');
  const isTeacher = areRol(user.status, 'profesor');
  const initials = user.nume_prenume.split(' ').map(n => n[0]).join('');

  const handleSave = () => {
    setEditMode(false);
    toast.success('Profil actualizat cu succes!');
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-display font-bold text-foreground truncate">
              {user.nume_prenume}
            </h1>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {roles.map(r => (
                <Badge key={r} variant="secondary" className="text-xs">
                  {getRoleLabel(r)}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Contact Info */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" /> Informații personale
              </CardTitle>
              <Button
                variant={editMode ? 'default' : 'outline'}
                size="sm"
                onClick={() => editMode ? handleSave() : setEditMode(true)}
                className="gap-1.5"
              >
                {editMode ? <><Save className="h-3.5 w-3.5" />Salvează</> : 'Editează'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Phone className="h-3 w-3" /> Telefon
              </Label>
              {editMode ? (
                <Input
                  value={formData.telefon}
                  onChange={e => setFormData(p => ({ ...p, telefon: e.target.value }))}
                />
              ) : (
                <p className="text-sm font-medium">{user.telefon}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Mail className="h-3 w-3" /> Email
              </Label>
              {editMode ? (
                <Input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                />
              ) : (
                <p className="text-sm font-medium">{user.email}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Shield className="h-3 w-3" /> Roluri
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {roles.map(r => (
                  <Badge key={r} className="text-xs">{getRoleLabel(r)}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Groups */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <School className="h-4 w-4" /> Grupe & Clase
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {availableGroups.map(g => (
                <div
                  key={g.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                    currentGroup?.id === g.id
                      ? 'border-primary/30 bg-primary/5'
                      : 'border-border'
                  }`}
                >
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                    g.tip === 'gradinita' ? 'bg-warning/10 text-warning' : 'bg-accent/10 text-accent'
                  }`}>
                    {g.tip === 'gradinita' ? <Baby className="h-4 w-4" /> : <GraduationCap className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{g.nume}</p>
                    <p className="text-xs text-muted-foreground">
                      {g.tip === 'gradinita' ? 'Grădiniță' : 'Școală'}
                    </p>
                  </div>
                  {currentGroup?.id === g.id && (
                    <Badge variant="outline" className="text-[10px] shrink-0">Curentă</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Children (for teachers/parents) */}
      {(isParent || isTeacher) && children.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                {isTeacher ? `Copii în ${currentGroup?.nume || 'grupă'}` : 'Copiii mei'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {children.map(child => (
                  <div key={child.id} className="flex items-center gap-3 p-3 rounded-xl border border-border">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                      {child.nume_prenume.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{child.nume_prenume}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {child.data_nasterii && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(child.data_nasterii).toLocaleDateString('ro-RO')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {isTeacher && (
                <p className="text-xs text-muted-foreground mt-3">
                  Total: {children.length} copii în această grupă
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4" /> Preferințe
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label className="text-sm">Notificări email</Label>
                  <p className="text-xs text-muted-foreground">Primești email-uri pentru mesaje noi</p>
                </div>
              </div>
              <Switch
                checked={prefs.notif_email}
                onCheckedChange={v => setPrefs(p => ({ ...p, notif_email: v }))}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label className="text-sm">Notificări push</Label>
                  <p className="text-xs text-muted-foreground">Notificări pe telefon</p>
                </div>
              </div>
              <Switch
                checked={prefs.notif_push}
                onCheckedChange={v => setPrefs(p => ({ ...p, notif_push: v }))}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label className="text-sm">Mod întunecat</Label>
                  <p className="text-xs text-muted-foreground">Schimbă tema aplicației</p>
                </div>
              </div>
              <Switch
                checked={prefs.dark_mode}
                onCheckedChange={v => {
                  setPrefs(p => ({ ...p, dark_mode: v }));
                  document.documentElement.classList.toggle('dark', v);
                }}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Account info */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.25 }}
      >
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>ID utilizator: {user.id}</span>
              <span>{availableGroups.length} {availableGroups.length === 1 ? 'grupă' : 'grupe'} disponibile</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
