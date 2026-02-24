import { createContext, useContext, useState, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface ExternalLinkContextType {
  openLink: (url: string, forceModal?: boolean) => void;
}

const ExternalLinkContext = createContext<ExternalLinkContextType>({ openLink: () => {} });

export const useExternalLink = () => useContext(ExternalLinkContext);

// URLs matching these patterns will open in iframe modal; everything else opens in a new tab
const IFRAME_ALLOWED_PATTERNS = [
  /tid4kdemo\.ro/,
  /localhost/,
  /lovable\.app/,
];

function canIframe(url: string): boolean {
  return IFRAME_ALLOWED_PATTERNS.some(pattern => pattern.test(url));
}

export function ExternalLinkProvider({ children }: { children: React.ReactNode }) {
  const [url, setUrl] = useState<string | null>(null);

  const openLink = useCallback((linkUrl: string, forceModal?: boolean) => {
    if (forceModal || canIframe(linkUrl)) {
      setUrl(linkUrl);
    } else {
      window.open(linkUrl, '_blank', 'noopener,noreferrer');
    }
  }, []);

  return (
    <ExternalLinkContext.Provider value={{ openLink }}>
      {children}
      <Dialog open={!!url} onOpenChange={(open) => { if (!open) setUrl(null); }}>
        <DialogContent className="max-w-[95vw] w-full max-h-[90vh] h-[90vh] p-0 overflow-hidden">
          {url && (
            <iframe
              src={url}
              className="w-full h-full border-0"
              title="Link extern"
            />
          )}
        </DialogContent>
      </Dialog>
    </ExternalLinkContext.Provider>
  );
}
