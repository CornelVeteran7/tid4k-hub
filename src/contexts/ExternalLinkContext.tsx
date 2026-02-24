import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ExternalLink, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExternalLinkContextType {
  openLink: (url: string) => void;
}

const ExternalLinkContext = createContext<ExternalLinkContextType>({ openLink: () => {} });

export const useExternalLink = () => useContext(ExternalLinkContext);

export function ExternalLinkProvider({ children }: { children: React.ReactNode }) {
  const [url, setUrl] = useState<string | null>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  const openLink = useCallback((linkUrl: string) => {
    setIframeLoaded(false);
    setShowFallback(false);
    setUrl(linkUrl);
  }, []);

  // Show fallback button after 3s if iframe hasn't confirmed loading
  useEffect(() => {
    if (!url) return;
    const timer = setTimeout(() => {
      if (!iframeLoaded) setShowFallback(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, [url, iframeLoaded]);

  const handleClose = () => {
    setUrl(null);
    setIframeLoaded(false);
    setShowFallback(false);
    // No navigation — user stays exactly where they were
  };

  return (
    <ExternalLinkContext.Provider value={{ openLink }}>
      {children}
      <Dialog open={!!url} onOpenChange={(open) => { if (!open) handleClose(); }}>
        <DialogContent className="max-w-[95vw] w-full max-h-[90vh] h-[90vh] p-0 overflow-hidden">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 z-20 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 flex items-center justify-center hover:bg-background transition-colors shadow-sm"
          >
            <X className="h-4 w-4" />
          </button>

          {url && (
            <iframe
              src={url}
              className="w-full h-full border-0"
              title="Link extern"
              onLoad={() => setIframeLoaded(true)}
            />
          )}

          {/* Fallback — always visible after 3s, positioned at bottom */}
          {url && showFallback && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 shadow-lg bg-background/95 backdrop-blur-sm"
                onClick={() => {
                  window.open(url, '_blank', 'noopener,noreferrer');
                  handleClose();
                }}
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
