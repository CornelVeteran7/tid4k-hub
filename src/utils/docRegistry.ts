import { format } from 'date-fns';

/**
 * Documentation auto-update registry.
 * Maps source files to their documentation files.
 * 
 * Usage: After modifying a source file, call `getAffectedDocs(filePath)`
 * to find which documentation files should be reviewed/updated.
 */

export interface DocMapping {
  docFile: string;
  triggerPatterns: string[];
  description: string;
}

export const DOC_REGISTRY: DocMapping[] = [
  {
    docFile: 'docs/APP_OVERVIEW.md',
    triggerPatterns: ['src/App.tsx', 'src/config/verticalConfig.ts', 'package.json'],
    description: 'Architecture, verticals, tech stack',
  },
  {
    docFile: 'docs/PAGES.md',
    triggerPatterns: ['src/pages/'],
    description: 'All page routes and features',
  },
  {
    docFile: 'docs/API.md',
    triggerPatterns: ['src/api/'],
    description: 'API function signatures and behavior',
  },
  {
    docFile: 'docs/HOOKS.md',
    triggerPatterns: ['src/hooks/', 'src/config/moduleConfig.tsx'],
    description: 'Custom hooks and context hooks',
  },
  {
    docFile: 'docs/CONTEXTS.md',
    triggerPatterns: ['src/contexts/'],
    description: 'React context providers',
  },
  {
    docFile: 'docs/TYPES.md',
    triggerPatterns: ['src/types/'],
    description: 'TypeScript interfaces',
  },
  {
    docFile: 'docs/ROLES.md',
    triggerPatterns: ['src/utils/roles.ts', 'src/contexts/AuthContext.tsx'],
    description: 'Role system and access control',
  },
  {
    docFile: 'docs/THEMING.md',
    triggerPatterns: ['src/index.css', 'src/utils/branding.ts', 'src/components/admin/ThemeEditorTab.tsx', 'src/components/InkyAssistant.tsx'],
    description: 'Theming system',
  },
  {
    docFile: 'docs/GUEST_ACCESS.md',
    triggerPatterns: ['src/hooks/useGuestSession.ts', 'src/api/guestTokens.ts', 'src/pages/QRCancelarie.tsx', 'supabase/functions/validate-guest-token/'],
    description: 'Guest access system',
  },
  {
    docFile: 'docs/DATABASE.md',
    triggerPatterns: ['src/integrations/supabase/types.ts', 'supabase/migrations/'],
    description: 'Database schema',
  },
  {
    docFile: 'docs/SPONSORS.md',
    triggerPatterns: ['src/api/sponsors.ts', 'src/pages/SponsorAdmin.tsx', 'src/components/sponsor/'],
    description: 'Sponsor system',
  },
];

/**
 * Given a modified file path, returns which doc files should be updated.
 */
export function getAffectedDocs(modifiedFilePath: string): DocMapping[] {
  return DOC_REGISTRY.filter(mapping =>
    mapping.triggerPatterns.some(pattern => {
      if (pattern.endsWith('/')) {
        return modifiedFilePath.startsWith(pattern);
      }
      return modifiedFilePath === pattern;
    })
  );
}

/**
 * Returns a formatted reminder string for which docs need updating.
 */
export function getDocUpdateReminder(modifiedFiles: string[]): string {
  const affected = new Set<string>();
  for (const file of modifiedFiles) {
    for (const doc of getAffectedDocs(file)) {
      affected.add(`${doc.docFile} — ${doc.description}`);
    }
  }
  if (affected.size === 0) return '';
  const today = format(new Date(), 'yyyy-MM-dd');
  return `📝 Docs to update (${today}):\n${[...affected].map(d => `  • ${d}`).join('\n')}`;
}
