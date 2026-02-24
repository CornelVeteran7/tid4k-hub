import { createContext, useContext, useState, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ExternalLink, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExternalLinkContextType {
  openLink: (url: string) => void;
}

const ExternalLinkContext = createContext<ExternalLinkContextType>({ openLink: () => {} });

export const useExternalLink = () => useContext(ExternalLinkContext);

export function ExternalLinkProvider({ children }: { children: React.ReactNode }) {
  const [url, setUrl] = useState<string | null>(null);
  const [iframeBlocked, setIframeBlocked] = useState(false);

  const openLink = useCallback((linkUrl: string) => {
    setIframeBlocked(false);
    setUrl(linkUrl);
  }, []);

  const handleClose = () => {
    setUrl(null);
    setIframeBlocked(false);
  };

  return (
    <ExternalLinkContext.Provider value={{ openLink }}>
      {children}
      <Dialog open={!!url} onOpenChange={(open) => { if (!open) handleClose(); }}>
        <DialogContent className="max-w-[95vw] w-full max-h-[90vh] h-[90vh] p-0 overflow-hidden">
          {url && !iframeBlocked && (
            <iframe
              src={url}
              className="w-full h-full border-0"
              title="Link extern"
              onError={() => setIframeBlocked(true)}
              onLoad={(e) => {
                // Some browsers block iframe silently — try to detect
                try {
                  const iframe = e.currentTarget;
                  // If we can't access contentWindow.location, it's likely blocked
                  if (iframe.contentWindow && !iframe.contentWindow.length && iframe.contentDocument === null) {
                    setIframeBlocked(true);
                  }
                } catch {
                  // Cross-origin access denied = page loaded fine in iframe
                }
              }}
            />
          )}
          {url && iframeBlocked && (
            <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
              <AlertTriangle className="h-12 w-12 text-warning" />
              <h3 className="text-lg font-semibold">Pagina nu poate fi afișată aici</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Site-ul <strong>{new URL(url).hostname}</strong> nu permite afișarea într-un cadru încorporat.
              </p>
              <Button onClick={() => window.open(url, '_blank', 'noopener,noreferrer')} className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Deschide în tab nou
              </Button>
            </div>
          )}
          {/* Fallback timer — if iframe doesn't visually load in 3s, show option */}
          {url && !iframeBlocked && <IframeBlockedFallback url={url} onBlocked={() => setIframeBlocked(true)} />}
        </DialogContent>
      </Dialog>
    </ExternalLinkContext.Provider>
  );
}

function IframeBlockedFallback({ url, onBlocked }: { url: string; onBlocked: () => void }) {
  const [showFallback, setShowFallback] = useState(false);

  useState(() => {
    const timer = setTimeout(() => setShowFallback(true), 4000);
    return () => clearTimeout(timer);
  });

  if (!showFallback) return null;

  return (
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
  );
}
