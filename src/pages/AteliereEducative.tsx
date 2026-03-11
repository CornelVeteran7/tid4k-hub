import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Paintbrush, Star, Calendar, Gift, GraduationCap, ExternalLink, Loader2 } from 'lucide-react';
import { useExternalLink } from '@/contexts/ExternalLinkContext';
import {
  getExternalWorkshops,
  refreshWorkshopsIfStale,
  getCurrentMonthWorkshop,
  getCurrentMonthName,
  type ExternalWorkshop,
} from '@/api/externalWorkshops';

const CHARACTER_COLORS: Record<string, string> = {
  'Inky': 'hsl(var(--primary))',
  'Nuko': '#4CAF50',
  'Vixie': '#FF6B35',
  'Poki': '#9C27B0',
  'Eli': '#2196F3',
};

interface AteliereEducativeProps {
  embedded?: boolean;
}

export default function AteliereEducative({ embedded }: AteliereEducativeProps) {
  const [workshops, setWorkshops] = useState<ExternalWorkshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkshop, setSelectedWorkshop] = useState<ExternalWorkshop | null>(null);
  const { openLink } = useExternalLink();

  useEffect(() => {
    loadWorkshops();
  }, []);

  const loadWorkshops = async () => {
    try {
      const data = await getExternalWorkshops();
      setWorkshops(data);
      // Trigger background refresh if stale
      refreshWorkshopsIfStale();
    } catch (err) {
      console.error('Failed to load workshops:', err);
    } finally {
      setLoading(false);
    }
  };

  const featured = getCurrentMonthWorkshop(workshops);
  const otherWorkshops = workshops.filter(w => w.id !== featured?.id);
  const currentMonth = getCurrentMonthName();

  const handleBook = () => {
    openLink('https://infodisplay.ro/ateliere');
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (workshops.length === 0) {
    return (
      <div className="text-center py-16 space-y-4">
        <Paintbrush className="h-12 w-12 mx-auto text-muted-foreground" />
        <p className="text-muted-foreground">Atelierele se încarcă...</p>
        <Button variant="outline" onClick={loadWorkshops}>Reîncearcă</Button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${embedded ? '' : 'pb-20'}`}>
      {!embedded && (
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <Paintbrush className="h-6 w-6 text-primary" />
            Ateliere Educative
          </h1>
          <p className="text-sm text-muted-foreground">Ateliere interactive cu personajele InfoDisplay</p>
        </div>
      )}

      {/* Featured Workshop of the Month */}
      {featured && (
        <Card className="overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
          <div className="relative">
            <img
              src={featured.imagine_url}
              alt={featured.titlu}
              className="w-full h-48 sm:h-56 object-cover"
              loading="lazy"
            />
            <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground shadow-lg gap-1.5">
              <Star className="h-3 w-3" />
              Atelierul Lunii — {currentMonth}
            </Badge>
            {featured.personaj && (
              <Badge
                className="absolute top-3 right-3 shadow-lg text-white"
                style={{ backgroundColor: CHARACTER_COLORS[featured.personaj] || 'hsl(var(--primary))' }}
              >
                cu {featured.personaj}
              </Badge>
            )}
          </div>
          <CardContent className="p-4 space-y-3">
            <h2 className="text-xl font-bold text-foreground">{featured.titlu}</h2>
            <p className="text-sm text-muted-foreground line-clamp-3">{featured.descriere}</p>

            {featured.ce_invatam && (
              <div className="flex items-start gap-2 bg-muted/50 rounded-lg p-3">
                <GraduationCap className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-foreground mb-0.5">Ce învățăm?</p>
                  <p className="text-xs text-muted-foreground">{featured.ce_invatam}</p>
                </div>
              </div>
            )}

            {featured.ce_primim && (
              <div className="flex items-start gap-2 bg-muted/50 rounded-lg p-3">
                <Gift className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-foreground mb-0.5">Ce primim?</p>
                  <p className="text-xs text-muted-foreground">{featured.ce_primim}</p>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <Button onClick={handleBook} className="flex-1 gap-2">
                <ExternalLink className="h-4 w-4" />
                PROGRAMEAZĂ ACEST ATELIER
              </Button>
              <Button variant="outline" onClick={() => setSelectedWorkshop(featured)}>
                Detalii
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Other Workshops Grid */}
      {otherWorkshops.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Toate atelierele
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {otherWorkshops.map(w => (
              <Card
                key={w.id}
                className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedWorkshop(w)}
              >
                <div className="relative">
                  <img
                    src={w.imagine_url}
                    alt={w.titlu}
                    className="w-full h-28 sm:h-32 object-cover"
                    loading="lazy"
                  />
                  <Badge variant="secondary" className="absolute top-2 left-2 text-[10px] gap-1">
                    <Calendar className="h-2.5 w-2.5" />
                    {w.luna}
                  </Badge>
                </div>
                <CardContent className="p-2.5">
                  <p className="text-sm font-semibold text-foreground line-clamp-1">{w.titlu}</p>
                  {w.personaj && (
                    <p className="text-xs text-muted-foreground">cu {w.personaj}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedWorkshop} onOpenChange={(open) => { if (!open) setSelectedWorkshop(null); }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {selectedWorkshop && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-lg">
                  {selectedWorkshop.titlu}
                </DialogTitle>
              </DialogHeader>

              <img
                src={selectedWorkshop.imagine_url}
                alt={selectedWorkshop.titlu}
                className="w-full h-48 object-cover rounded-lg"
              />

              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline" className="gap-1">
                  <Calendar className="h-3 w-3" />
                  {selectedWorkshop.luna}
                </Badge>
                {selectedWorkshop.personaj && (
                  <Badge
                    className="text-white"
                    style={{ backgroundColor: CHARACTER_COLORS[selectedWorkshop.personaj] || 'hsl(var(--primary))' }}
                  >
                    cu {selectedWorkshop.personaj}
                  </Badge>
                )}
              </div>

              <p className="text-sm text-muted-foreground">{selectedWorkshop.descriere}</p>

              {selectedWorkshop.ce_invatam && (
                <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold text-foreground">Ce învățăm?</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedWorkshop.ce_invatam}</p>
                </div>
              )}

              {selectedWorkshop.ce_primim && (
                <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Gift className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-semibold text-foreground">Ce primim?</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedWorkshop.ce_primim}</p>
                </div>
              )}

              <Button onClick={handleBook} className="w-full gap-2 mt-2">
                <ExternalLink className="h-4 w-4" />
                PROGRAMEAZĂ ACEST ATELIER
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
