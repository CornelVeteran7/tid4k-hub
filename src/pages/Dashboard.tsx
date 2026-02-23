import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useGroup } from '@/contexts/GroupContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { getRoles, getRoleLabel, areRol } from '@/utils/roles';
import { getAttendance, saveAttendance } from '@/api/attendance';
import type { AttendanceRecord } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Users, ClipboardList, MessageSquare, Megaphone, FileText, Send, Upload, ChevronDown, ChevronUp, Save, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { toast } from 'sonner';

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
};

export default function Dashboard() {
  const { user } = useAuth();
  const { currentGroup } = useGroup();
  const { unreadMessages, newAnnouncements } = useNotifications();
  const navigate = useNavigate();

  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [saving, setSaving] = useState(false);

  const today = format(new Date(), 'yyyy-MM-dd');
  const isTeacher = user && areRol(user.status, 'profesor');

  useEffect(() => {
    if (attendanceOpen && currentGroup) {
      setLoadingAttendance(true);
      getAttendance(currentGroup.id, today).then((day) => {
        setRecords(day.records);
        setLoadingAttendance(false);
      });
    }
  }, [attendanceOpen, currentGroup, today]);

  const togglePresent = (id: number) => {
    setRecords((prev) => prev.map((r) => (r.id_copil === id ? { ...r, prezent: !r.prezent } : r)));
  };

  const handleSaveAttendance = async () => {
    if (!currentGroup) return;
    setSaving(true);
    try {
      await saveAttendance(currentGroup.id, today, records);
      toast.success('Prezența a fost salvată!');
    } catch {
      toast.error('Eroare la salvarea prezenței.');
    }
    setSaving(false);
  };

  if (!user) return null;

  const roles = getRoles(user.status);
  const presentCount = records.filter((r) => r.prezent).length;

  const stats = [
    { label: 'Copii în grupă', value: records.length || 5, icon: Users, color: 'text-primary' },
    { label: 'Mesaje necitite', value: unreadMessages, icon: MessageSquare, color: 'text-accent' },
    { label: 'Anunțuri noi', value: newAnnouncements, icon: Megaphone, color: 'text-warning' },
  ];

  const recentActivity = [
    { text: 'Maria Popescu a încărcat „activitate_pictura.jpg"', time: 'acum 2 ore', icon: Upload },
    { text: 'Ion Ionescu a trimis un mesaj', time: 'acum 3 ore', icon: MessageSquare },
    { text: 'Anunț nou: Excursie la Grădina Botanică', time: 'ieri', icon: Megaphone },
    { text: 'Prezența a fost înregistrată pentru 22 feb', time: 'ieri', icon: ClipboardList },
    { text: 'Document nou: regulament_intern.pdf', time: 'acum 3 zile', icon: FileText },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome — tap to open attendance */}
      <motion.div {...fadeIn}>
        <Card
          className={`bg-primary text-primary-foreground ${isTeacher ? 'cursor-pointer' : ''}`}
          onClick={() => isTeacher && setAttendanceOpen(!attendanceOpen)}
        >
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-display font-bold">Bun venit, {user.nume_prenume.split(' ')[0]}! 👋</h1>
                <p className="text-primary-foreground/80 mt-1">
                  {currentGroup ? `${currentGroup.nume} — ${currentGroup.tip === 'gradinita' ? 'Grădiniță' : 'Școală'}` : 'Selectează o grupă'}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {roles.map((r) => (
                    <Badge key={r} variant="secondary" className="bg-primary-foreground/20 text-primary-foreground border-0">
                      {getRoleLabel(r)}
                    </Badge>
                  ))}
                </div>
              </div>
              {isTeacher && (
                <div className="flex items-center gap-2 text-primary-foreground/70">
                  <span className="text-sm">{attendanceOpen ? 'Ascunde prezența' : 'Prezența'}</span>
                  {attendanceOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Inline Attendance Panel */}
      <AnimatePresence>
        {attendanceOpen && isTeacher && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ClipboardList className="h-5 w-5" />
                    Prezența — {format(new Date(), 'EEEE, d MMMM', { locale: ro })}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-success text-success-foreground">{presentCount} prezenți</Badge>
                    <Badge variant="destructive">{records.length - presentCount} absenți</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loadingAttendance ? (
                  <div className="flex justify-center py-6">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {records.map((record) => (
                      <motion.div
                        key={record.id_copil}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.15 }}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          record.prezent ? 'bg-success/10 border-success/30' : 'bg-card hover:bg-muted/50'
                        }`}
                        onClick={() => togglePresent(record.id_copil)}
                      >
                        <Checkbox
                          checked={record.prezent}
                          onCheckedChange={() => togglePresent(record.id_copil)}
                          className="pointer-events-none"
                        />
                        <span className="text-sm font-medium flex-1">{record.nume_prenume_copil}</span>
                        <Badge
                          variant={record.prezent ? 'default' : 'destructive'}
                          className={record.prezent ? 'bg-success text-success-foreground' : ''}
                        >
                          {record.prezent ? 'P' : 'A'}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2 mt-4">
                  <Button onClick={handleSaveAttendance} disabled={saving} size="sm" className="gap-2">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Salvează Prezența
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigate('/prezenta')}>
                    Deschide pagina completă
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} {...fadeIn} transition={{ delay: i * 0.05 }}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold font-mono">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Activitate recentă</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((item, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <div className="p-1.5 rounded bg-muted mt-0.5">
                    <item.icon className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground">{item.text}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
