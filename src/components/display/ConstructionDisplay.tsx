import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Task {
  id: string;
  titlu: string;
  status: string;
  prioritate: string;
  locatie: string;
  assignee: string;
}

interface SSMReminder {
  id: string;
  mesaj: string;
  tip: string;
}

interface ConstructionDisplayProps {
  organizationId: string;
  primaryColor: string;
}

const STATUS_LABELS: Record<string, string> = {
  todo: '📋 De făcut',
  in_progress: '🔨 În lucru',
  done: '✅ Finalizat',
  blocked: '🚫 Blocat',
};

const PRIORITY_COLORS: Record<string, string> = {
  urgent: '#ef4444',
  high: '#f97316',
  normal: '#3b82f6',
  low: '#6b7280',
};

export function ConstructionDisplay({ organizationId, primaryColor }: ConstructionDisplayProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [ssm, setSsm] = useState<SSMReminder[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const [{ data: tasksData }, { data: ssmData }] = await Promise.all([
        supabase
          .from('construction_tasks')
          .select('*')
          .eq('organization_id', organizationId)
          .in('status', ['todo', 'in_progress', 'blocked'])
          .order('prioritate')
          .limit(10),
        supabase
          .from('ssm_reminders')
          .select('*')
          .eq('organization_id', organizationId)
          .eq('activ', true)
          .order('ordine')
          .limit(5),
      ]);
      setTasks((tasksData || []) as Task[]);
      setSsm((ssmData || []) as SSMReminder[]);
    };
    loadData();
    const interval = setInterval(loadData, 60 * 1000);
    return () => clearInterval(interval);
  }, [organizationId]);

  return (
    <div className="absolute inset-0 flex px-[4vw] py-[10vh] gap-[3vw]">
      {/* Left: Tasks */}
      <div className="flex-1 flex flex-col">
        <h2 className="text-[3vh] font-bold mb-[2vh] flex items-center gap-[1vw]">
          🏗️ Taskuri azi
        </h2>
        {tasks.length > 0 ? (
          <div className="space-y-[1.5vh] overflow-hidden flex-1">
            {tasks.map(task => (
              <div
                key={task.id}
                className="bg-white/10 rounded-xl p-[1.5vh] flex items-center gap-[1.5vw]"
              >
                <div
                  className="w-[0.6vw] self-stretch rounded-full"
                  style={{ backgroundColor: PRIORITY_COLORS[task.prioritate] || PRIORITY_COLORS.normal }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-[2.2vh] font-semibold truncate">{task.titlu}</div>
                  <div className="text-[1.6vh] opacity-60 flex gap-[1.5vw]">
                    <span>{STATUS_LABELS[task.status] || task.status}</span>
                    {task.locatie && <span>📍 {task.locatie}</span>}
                    {task.assignee && <span>👷 {task.assignee}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center opacity-40">
            <div className="text-center">
              <div className="text-[6vh] mb-[1vh]">🏗️</div>
              <div className="text-[2vh]">Nicio sarcină activă</div>
            </div>
          </div>
        )}
      </div>

      {/* Right: SSM Reminders */}
      <div className="w-[30vw] flex flex-col">
        <h2 className="text-[3vh] font-bold mb-[2vh] flex items-center gap-[1vw]">
          ⚠️ SSM
        </h2>
        {ssm.length > 0 ? (
          <div className="space-y-[1.5vh]">
            {ssm.map(reminder => (
              <div
                key={reminder.id}
                className="rounded-xl p-[1.5vh]"
                style={{
                  backgroundColor: reminder.tip === 'danger' ? 'rgba(239,68,68,0.2)' :
                    reminder.tip === 'warning' ? 'rgba(249,115,22,0.2)' : 'rgba(255,255,255,0.1)',
                  borderLeft: `4px solid ${
                    reminder.tip === 'danger' ? '#ef4444' :
                    reminder.tip === 'warning' ? '#f97316' : 'rgba(255,255,255,0.3)'
                  }`,
                }}
              >
                <div className="text-[2vh]">{reminder.mesaj}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/5 rounded-xl p-[2vh] text-center opacity-40">
            <div className="text-[2vh]">Niciun avertisment SSM</div>
          </div>
        )}

        {/* Date info */}
        <div className="mt-auto bg-white/5 rounded-xl p-[2vh] text-center">
          <div className="text-[2vh] opacity-60">
            {new Date().toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>
    </div>
  );
}
