import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import type { ParentChild } from '@/api/contributions';

interface Props {
  children: ParentChild[];
  selectedChildId: string;
  onSelect: (childId: string) => void;
}

export default function ParentChildSwitcher({ children, selectedChildId, onSelect }: Props) {
  if (children.length <= 1) return null;

  return (
    <div className="flex items-center gap-2">
      <Users className="h-4 w-4 text-muted-foreground shrink-0" />
      <Select value={selectedChildId} onValueChange={onSelect}>
        <SelectTrigger className="w-full max-w-[260px]">
          <SelectValue placeholder="Selectează copilul" />
        </SelectTrigger>
        <SelectContent>
          {children.map(child => (
            <SelectItem key={child.id} value={child.id}>
              <span className="flex items-center gap-2">
                {child.nume_prenume}
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {child.group_name}
                </Badge>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
