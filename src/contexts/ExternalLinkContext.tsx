import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExternalLinkContextType {
  openLink: (url: string) => void;
}

const ExternalLinkContext = createContext<ExternalLinkContextType>({ openLink: () => {} });

export const useExternalLink = () => useContext(ExternalLinkContext);

export function ExternalLinkProvider({ children }: { children: React.ReactNode }) {
  const [url, setUrl] = useState<string | null>(null);
  const [showFallback, setShowFallback] = useState(false);

  const openLink = useCallback((linkUrl: string) => {
    setShowFallback(false);
    setUrl(linkUrl);
  }, []);

  // Show "open in new tab" fallback after 5 seconds, in case iframe is blocked
  useEffect(() => {
    if (!url) return;
    setShowFallback(false);
    const timer = setTimeout(() => setShowFallback(true), 5000);
    return () => clearTimeout(timer);
  }, [url]);

  const handleClose = () => {
    setUrl(null);
    setShowFallback(false);
  };

  return (
    <ExternalLinkContext.Provider value={{ openLink }}>
      {children}
      <Dialog open={!!url} onOpenChange={(open) => { if (!open) handleClose(); }}>
        <DialogContent className="max-w-[95vw] w-full max-h-[90vh] h-[90vh] p-0 overflow-hidden">
          {url && (
            <iframe
              src={url}
              className="w-full h-full border-0"
              title="Link extern"
            />
          )}
          {url && showFallback && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 shadow-lg bg-background/95 backdrop-blur-sm"
                onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Pagina nu se încarcă? Deschide în tab nou
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </ExternalLinkContext.Provider>
  );
}
