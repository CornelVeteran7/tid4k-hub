import { createContext, useContext, useState, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface ExternalLinkContextType {
  openLink: (url: string) => void;
}

const ExternalLinkContext = createContext<ExternalLinkContextType>({ openLink: () => {} });

export const useExternalLink = () => useContext(ExternalLinkContext);

export function ExternalLinkProvider({ children }: { children: React.ReactNode }) {
  const [url, setUrl] = useState<string | null>(null);

  const openLink = useCallback((linkUrl: string) => {
    setUrl(linkUrl);
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
