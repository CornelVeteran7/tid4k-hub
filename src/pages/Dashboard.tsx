import { useAuth } from '@/contexts/AuthContext';
import { useGroup } from '@/contexts/GroupContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { getRoles, getRoleLabel } from '@/utils/roles';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, ClipboardList, MessageSquare, Megaphone, FileText, Send, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

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

  if (!user) return null;

  const roles = getRoles(user.status);

  const stats = [
    { label: 'Copii în grupă', value: 5, icon: Users, color: 'text-primary' },
    { label: 'Prezență azi', value: '4/5', icon: ClipboardList, color: 'text-success' },
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
      {/* Welcome */}
      <motion.div {...fadeIn}>
        <Card className="bg-primary text-primary-foreground">
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
            </div>
          </CardContent>
        </Card>
      </motion.div>

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

      {/* Quick Actions + Recent Activity */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Acțiuni rapide</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start gap-2" onClick={() => navigate('/prezenta')}>
              <ClipboardList className="h-4 w-4" /> Înregistrează Prezența
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate('/mesaje')}>
              <Send className="h-4 w-4" /> Trimite Mesaj
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate('/documente')}>
              <Upload className="h-4 w-4" /> Încarcă Document
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
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
