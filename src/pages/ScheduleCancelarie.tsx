import { useState, useEffect } from 'react';
import { getCancelarieTeachers } from '@/api/schedule';
import type { CancelarieTeacher } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User } from 'lucide-react';

export default function ScheduleCancelarie() {
  const [teachers, setTeachers] = useState<CancelarieTeacher[]>([]);

  useEffect(() => {
    getCancelarieTeachers().then(setTeachers);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Orar CANCELARIE</h1>
        <p className="text-muted-foreground">Gestiunea profesorilor</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teachers.map((teacher) => (
          <Card key={teacher.id} className="group overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="relative h-16 w-16 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
                  {teacher.avatar_url ? (
                    <img src={teacher.avatar_url} alt={teacher.nume} className="h-full w-full object-cover group-hover:opacity-0 transition-opacity" />
                  ) : (
                    <User className="h-8 w-8 text-muted-foreground group-hover:opacity-0 transition-opacity" />
                  )}
                  {teacher.qr_data && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white">
                      <img src={teacher.qr_data} alt={`QR ${teacher.nume}`} className="h-14 w-14 object-contain" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{teacher.nume}</h3>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {teacher.absent_dates.length > 0 ? (
                      <Badge variant="destructive" className="text-xs">{teacher.absent_dates.length} absențe</Badge>
                    ) : (
                      <Badge className="bg-success text-success-foreground text-xs">Prezent</Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Activity log */}
              {teacher.activitati.length > 0 && (
                <div className="mt-4 pt-3 border-t space-y-1">
                  <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Activități
                  </p>
                  {teacher.activitati.map((act, i) => (
                    <p key={i} className="text-xs text-muted-foreground">
                      {act.data}: {act.descriere}
                    </p>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
