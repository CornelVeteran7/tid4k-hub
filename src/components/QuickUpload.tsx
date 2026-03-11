import { useState, useRef, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useGroup } from '@/contexts/GroupContext';
import { useAuth } from '@/contexts/AuthContext';
import { isStaff } from '@/utils/roles';
import { uploadDocument } from '@/api/documents';
import { Camera, FileText, X, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const ADMIN_PATHS = ['/admin', '/sponsori', '/rapoarte', '/infodisplay', '/orar-cancelarie', '/social-facebook', '/social-whatsapp'];

const CATEGORIES = [
  { value: 'fotografii', label: 'Fotografie', icon: Camera },
  { value: 'activitati', label: 'Activitate', icon: FileText },
  { value: 'teme', label: 'Temă', icon: FileText },
  { value: 'administrativ', label: 'Administrativ', icon: FileText },
] as const;

export default function QuickUpload() {
  const [showPicker, setShowPicker] = useState(false);
  const [pickerPos, setPickerPos] = useState({ x: 0, y: 0 });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingCategory = useRef<string | null>(null);
  const location = useLocation();
  const { currentGroup } = useGroup();
  const { user } = useAuth();

  const canUpload = isStaff(user?.status || '', user?.nume_prenume || '');
  const isAdminPage = ADMIN_PATHS.some(p => location.pathname.startsWith(p));

  const handleDblClick = useCallback((e: MouseEvent) => {
    // Don't trigger on interactive elements
    const target = e.target as HTMLElement;
    if (
      target.closest('button, a, input, textarea, select, [role="dialog"], [role="menu"], [data-radix-popper-content-wrapper], .quick-upload-picker')
    ) return;

    e.preventDefault();
    setPickerPos({ x: e.clientX, y: e.clientY });
    setShowPicker(true);
  }, []);

  useEffect(() => {
    if (isAdminPage) return;

    document.addEventListener('dblclick', handleDblClick);
    return () => document.removeEventListener('dblclick', handleDblClick);
  }, [handleDblClick, isAdminPage]);

  // Close on Escape
  useEffect(() => {
    if (!showPicker) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowPicker(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [showPicker]);

  const handleCategorySelect = (cat: string) => {
    pendingCategory.current = cat;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pendingCategory.current) return;

    setSelectedFile(file);
    setUploading(true);
    const grupa = currentGroup?.id || 'default';

    try {
      await uploadDocument(grupa, file, pendingCategory.current);
      toast.success(`„${file.name}" încărcat cu succes!`);
    } catch {
      toast.error('Eroare la încărcare. Încearcă din nou.');
    } finally {
      setUploading(false);
      setShowPicker(false);
      setSelectedFile(null);
      pendingCategory.current = null;
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Adjust position so picker stays on screen
  const adjustedPos = {
    x: Math.min(pickerPos.x, window.innerWidth - 220),
    y: Math.min(pickerPos.y, window.innerHeight - 260),
  };

  if (isAdminPage || !canUpload) return null;

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf,.doc,.docx"
        className="hidden"
        onChange={handleFileChange}
      />

      <AnimatePresence>
        {showPicker && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-[9999] bg-black/20 backdrop-blur-[2px]"
              onClick={() => setShowPicker(false)}
            />

            {/* Picker */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ type: 'spring', damping: 25, stiffness: 400 }}
              className="quick-upload-picker fixed z-[10000] w-52 rounded-xl border border-border bg-card shadow-xl overflow-hidden"
              style={{ left: adjustedPos.x, top: adjustedPos.y }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-border bg-muted/50">
                <div className="flex items-center gap-2">
                  <Upload className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Încărcare rapidă</span>
                </div>
                <button onClick={() => setShowPicker(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Category options */}
              <div className="p-1.5 space-y-0.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => handleCategorySelect(cat.value)}
                    disabled={uploading}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50"
                  >
                    <cat.icon className="h-4 w-4 text-muted-foreground" />
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>

              {/* Uploading indicator */}
              {uploading && selectedFile && (
                <div className="px-3 py-2 border-t border-border bg-muted/30">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span className="text-xs text-muted-foreground truncate">{selectedFile.name}</span>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
