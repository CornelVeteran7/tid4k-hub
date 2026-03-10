/**
 * Vertical-specific decorative SVG elements for background and sidebar.
 * Each vertical gets unique line-art themed objects.
 * Contour/topographic lines are handled separately and stay the same.
 */

import type { VerticalType } from '@/config/verticalConfig';

/* ── Kids: flowers, bees, butterflies ── */
function KidsDecorations({ stroke, opacity }: { stroke: string; opacity: number }) {
  return (
    <g stroke={stroke} strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={opacity}>
      {/* 5-petal daisy */}
      <g transform="translate(1080, 180)">
        <ellipse cx="0" cy="-12" rx="5" ry="10" />
        <ellipse cx="0" cy="-12" rx="5" ry="10" transform="rotate(72)" />
        <ellipse cx="0" cy="-12" rx="5" ry="10" transform="rotate(144)" />
        <ellipse cx="0" cy="-12" rx="5" ry="10" transform="rotate(216)" />
        <ellipse cx="0" cy="-12" rx="5" ry="10" transform="rotate(288)" />
        <circle cx="0" cy="0" r="4" />
        <path d="M0,10 C-2,30 2,50 -4,70" />
        <path d="M-2,40 C-14,35 -16,48 -4,50" />
      </g>
      {/* Tulip */}
      <g transform="translate(650, 480)">
        <path d="M0,-20 C-8,-18 -14,-8 -12,0 C-10,6 -4,10 0,8" />
        <path d="M0,-20 C8,-18 14,-8 12,0 C10,6 4,10 0,8" />
        <path d="M0,8 C1,30 -1,50 2,72" />
        <path d="M0,35 C-12,28 -14,40 -4,44" />
      </g>
      {/* Bee */}
      <g transform="translate(720, 750)">
        <ellipse cx="0" cy="0" rx="10" ry="6" />
        <line x1="-3" y1="-5.5" x2="-3" y2="5.5" />
        <line x1="2" y1="-6" x2="2" y2="6" />
        <circle cx="12" cy="0" r="4" />
        <path d="M14,-3 C16,-10 20,-12 22,-9" />
        <path d="M15,-2 C19,-8 23,-7 24,-4" />
        <ellipse cx="-2" cy="-9" rx="7" ry="4" transform="rotate(-15, -2, -9)" />
        <ellipse cx="3" cy="-10" rx="6" ry="3.5" transform="rotate(10, 3, -10)" />
      </g>
      {/* Butterfly */}
      <g transform="translate(350, 100)">
        <path d="M0,0 C-10,-4 -12,-16 -6,-22 C-2,-26 4,-26 8,-22 C14,-16 12,-4 0,0" />
        <path d="M-4,-10 C-2,-6 2,-6 4,-10" />
        <path d="M0,0 C2,20 -1,40 3,60" />
        <path d="M1,25 C10,20 12,30 4,34" />
      </g>
    </g>
  );
}

/* ── Schools: books, pencils, rulers, graduation cap ── */
function SchoolsDecorations({ stroke, opacity }: { stroke: string; opacity: number }) {
  return (
    <g stroke={stroke} strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={opacity}>
      {/* Open book */}
      <g transform="translate(1080, 180)">
        <path d="M0,0 C-15,-5 -35,-5 -40,5 L-40,40 C-35,30 -15,30 0,35" />
        <path d="M0,0 C15,-5 35,-5 40,5 L40,40 C35,30 15,30 0,35" />
        <line x1="0" y1="0" x2="0" y2="35" />
        <line x1="-30" y1="10" x2="-10" y2="8" />
        <line x1="-30" y1="18" x2="-10" y2="16" />
        <line x1="10" y1="8" x2="30" y2="10" />
        <line x1="10" y1="16" x2="30" y2="18" />
      </g>
      {/* Pencil */}
      <g transform="translate(650, 480) rotate(-30)">
        <rect x="-4" y="-40" width="8" height="60" rx="1" />
        <path d="M-4,20 L0,28 L4,20" />
        <line x1="-4" y1="-30" x2="4" y2="-30" />
      </g>
      {/* Ruler */}
      <g transform="translate(350, 100) rotate(15)">
        <rect x="-5" y="-35" width="10" height="70" rx="1" />
        <line x1="-5" y1="-25" x2="-1" y2="-25" />
        <line x1="-5" y1="-15" x2="0" y2="-15" />
        <line x1="-5" y1="-5" x2="-1" y2="-5" />
        <line x1="-5" y1="5" x2="0" y2="5" />
        <line x1="-5" y1="15" x2="-1" y2="15" />
        <line x1="-5" y1="25" x2="0" y2="25" />
      </g>
      {/* Graduation cap */}
      <g transform="translate(720, 750)">
        <path d="M-30,0 L0,-15 L30,0 L0,15 Z" />
        <line x1="0" y1="15" x2="0" y2="30" />
        <path d="M-12,25 C-12,35 12,35 12,25" />
        <line x1="25" y1="-2" x2="25" y2="20" />
        <circle cx="25" cy="22" r="3" />
      </g>
    </g>
  );
}

/* ── Medicine: stethoscope, pill, medical cross, tooth ── */
function MedicineDecorations({ stroke, opacity }: { stroke: string; opacity: number }) {
  return (
    <g stroke={stroke} strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={opacity}>
      {/* Stethoscope */}
      <g transform="translate(1080, 180)">
        <path d="M-10,-25 C-10,-15 -15,0 -15,15 C-15,30 0,35 10,30 C20,25 20,10 10,10 C5,10 0,15 0,20" />
        <circle cx="0" cy="22" r="3" />
        <circle cx="-10" cy="-28" r="4" />
        <circle cx="5" cy="-28" r="4" />
      </g>
      {/* Medical cross */}
      <g transform="translate(650, 480)">
        <rect x="-20" y="-20" width="40" height="40" rx="5" />
        <line x1="0" y1="-10" x2="0" y2="10" strokeWidth="3" />
        <line x1="-10" y1="0" x2="10" y2="0" strokeWidth="3" />
      </g>
      {/* Pill capsule */}
      <g transform="translate(350, 100) rotate(30)">
        <rect x="-6" y="-18" width="12" height="36" rx="6" />
        <line x1="-6" y1="0" x2="6" y2="0" />
      </g>
      {/* Tooth */}
      <g transform="translate(720, 750)">
        <path d="M-12,-20 C-18,-20 -22,-12 -20,-4 C-18,6 -16,20 -10,28 C-6,34 -2,20 0,10 C2,20 6,34 10,28 C16,20 18,6 20,-4 C22,-12 18,-20 12,-20 C8,-20 4,-16 0,-14 C-4,-16 -8,-20 -12,-20" />
      </g>
    </g>
  );
}

/* ── Construction: bricks, hard hat, crane hook, truck ── */
function ConstructionDecorations({ stroke, opacity }: { stroke: string; opacity: number }) {
  return (
    <g stroke={stroke} strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={opacity}>
      {/* Hard hat */}
      <g transform="translate(1080, 180)">
        <path d="M-25,5 L-25,0 C-25,-20 25,-20 25,0 L25,5" />
        <line x1="-30" y1="5" x2="30" y2="5" />
        <line x1="-28" y1="5" x2="-28" y2="12" />
        <line x1="28" y1="5" x2="28" y2="12" />
        <line x1="-28" y1="12" x2="28" y2="12" />
        <line x1="0" y1="-20" x2="0" y2="5" />
      </g>
      {/* Bricks */}
      <g transform="translate(650, 480)">
        <rect x="-30" y="-10" width="25" height="10" />
        <rect x="-2" y="-10" width="25" height="10" />
        <rect x="-18" y="0" width="25" height="10" />
        <rect x="10" y="0" width="25" height="10" />
        <rect x="-30" y="10" width="25" height="10" />
        <rect x="-2" y="10" width="25" height="10" />
      </g>
      {/* Crane hook */}
      <g transform="translate(350, 100)">
        <line x1="0" y1="-40" x2="0" y2="0" />
        <path d="M-10,0 C-10,15 10,15 10,0" />
        <line x1="-12" y1="0" x2="12" y2="0" />
        <circle cx="0" cy="18" r="4" />
      </g>
      {/* Truck */}
      <g transform="translate(720, 750)">
        <rect x="-30" y="-15" width="35" height="20" rx="2" />
        <path d="M5,-15 L5,-5 L20,-5 L25,0 L25,5 L5,5" />
        <circle cx="-18" cy="8" r="5" />
        <circle cx="18" cy="8" r="5" />
        <line x1="-12" y1="5" x2="12" y2="5" />
      </g>
    </g>
  );
}

/* ── Workshops: wrench, gear, car, checklist ── */
function WorkshopsDecorations({ stroke, opacity }: { stroke: string; opacity: number }) {
  return (
    <g stroke={stroke} strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={opacity}>
      {/* Wrench */}
      <g transform="translate(1080, 180) rotate(45)">
        <path d="M-5,-30 C-12,-30 -15,-22 -12,-16 L0,0 L12,-16 C15,-22 12,-30 5,-30 C2,-28 -2,-28 -5,-30" />
        <rect x="-3" y="0" width="6" height="40" rx="1" />
      </g>
      {/* Gear */}
      <g transform="translate(650, 480)">
        <circle cx="0" cy="0" r="12" />
        <circle cx="0" cy="0" r="5" />
        {[0,45,90,135,180,225,270,315].map(a => (
          <line key={a} x1="0" y1="-11" x2="0" y2="-17" transform={`rotate(${a})`} strokeWidth="4" />
        ))}
      </g>
      {/* Car silhouette */}
      <g transform="translate(720, 750)">
        <path d="M-30,0 L-25,-8 L-15,-15 L15,-15 L25,-8 L30,0 L30,5 L-30,5 Z" />
        <circle cx="-18" cy="8" r="5" />
        <circle cx="18" cy="8" r="5" />
        <line x1="-12" y1="5" x2="12" y2="5" />
      </g>
      {/* Checklist */}
      <g transform="translate(350, 100)">
        <rect x="-15" y="-25" width="30" height="50" rx="3" />
        <line x1="-8" y1="-15" x2="8" y2="-15" />
        <line x1="-8" y1="-5" x2="8" y2="-5" />
        <line x1="-8" y1="5" x2="8" y2="5" />
        <line x1="-8" y1="15" x2="8" y2="15" />
        <path d="M-12,-15 L-10,-13 L-7,-17" />
        <path d="M-12,-5 L-10,-3 L-7,-7" />
      </g>
    </g>
  );
}

/* ── Living: house, plant, sun, bed ── */
function LivingDecorations({ stroke, opacity }: { stroke: string; opacity: number }) {
  return (
    <g stroke={stroke} strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={opacity}>
      {/* House outline */}
      <g transform="translate(1080, 180)">
        <path d="M-25,10 L0,-15 L25,10" />
        <rect x="-20" y="10" width="40" height="25" />
        <rect x="-8" y="18" width="16" height="17" />
        <rect x="-18" y="15" width="8" height="8" />
        <line x1="-14" y1="19" x2="-14" y2="19" />
      </g>
      {/* Potted plant */}
      <g transform="translate(650, 480)">
        <path d="M-8,15 L-12,35 L12,35 L8,15" />
        <line x1="0" y1="15" x2="0" y2="-5" />
        <path d="M0,-5 C-15,-10 -18,-25 -5,-25 C0,-25 0,-15 0,-5" />
        <path d="M0,-5 C15,-10 18,-25 5,-25 C0,-25 0,-15 0,-5" />
        <path d="M0,-10 C-8,-20 -5,-30 5,-28 C8,-27 5,-18 0,-10" />
      </g>
      {/* Sun */}
      <g transform="translate(350, 100)">
        <circle cx="0" cy="0" r="12" />
        {[0,45,90,135,180,225,270,315].map(a => (
          <line key={a} x1="0" y1="-17" x2="0" y2="-22" transform={`rotate(${a})`} />
        ))}
      </g>
      {/* Bed */}
      <g transform="translate(720, 750)">
        <rect x="-30" y="-5" width="60" height="20" rx="3" />
        <path d="M-30,-5 C-30,-15 -20,-18 -15,-15 C-10,-18 0,-15 0,-5" />
        <line x1="-30" y1="15" x2="-30" y2="22" />
        <line x1="30" y1="15" x2="30" y2="22" />
      </g>
    </g>
  );
}

/* ── Culture: theater masks, musical note, spotlight, curtain ── */
function CultureDecorations({ stroke, opacity }: { stroke: string; opacity: number }) {
  return (
    <g stroke={stroke} strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={opacity}>
      {/* Theater masks */}
      <g transform="translate(1080, 180)">
        {/* Happy mask */}
        <path d="M-22,-15 C-22,-25 -5,-28 0,-18 C5,-28 22,-25 22,-15 C22,0 12,12 0,15 C-12,12 -22,0 -22,-15" />
        <circle cx="-8" cy="-8" r="2.5" />
        <circle cx="8" cy="-8" r="2.5" />
        <path d="M-8,2 C-4,8 4,8 8,2" />
      </g>
      {/* Musical note */}
      <g transform="translate(650, 480)">
        <ellipse cx="-8" cy="20" rx="8" ry="5" transform="rotate(-15, -8, 20)" />
        <line x1="-1" y1="17" x2="-1" y2="-20" />
        <path d="M-1,-20 C8,-22 15,-15 10,-8" />
        <ellipse cx="10" cy="8" rx="7" ry="5" transform="rotate(-15, 10, 8)" />
        <line x1="17" y1="5" x2="17" y2="-20" />
        <line x1="-1" y1="-20" x2="17" y2="-20" />
      </g>
      {/* Spotlight */}
      <g transform="translate(350, 100)">
        <circle cx="0" cy="0" r="8" />
        <path d="M-6,6 L-20,35" />
        <path d="M6,6 L20,35" />
        <path d="M-20,35 C-10,40 10,40 20,35" />
        <circle cx="0" cy="0" r="3" />
      </g>
      {/* Curtain swag */}
      <g transform="translate(720, 750)">
        <path d="M-35,-15 C-35,10 -20,20 0,5 C20,20 35,10 35,-15" />
        <line x1="-35" y1="-15" x2="-35" y2="-30" />
        <line x1="35" y1="-15" x2="35" y2="-30" />
        <line x1="-35" y1="-30" x2="35" y2="-30" />
        <path d="M-30,-15 C-30,5 -15,12 0,0" />
        <path d="M30,-15 C30,5 15,12 0,0" />
      </g>
    </g>
  );
}

/* ── Students: laptop, coffee cup, notebook, lightbulb ── */
function StudentsDecorations({ stroke, opacity }: { stroke: string; opacity: number }) {
  return (
    <g stroke={stroke} strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={opacity}>
      {/* Laptop */}
      <g transform="translate(1080, 180)">
        <rect x="-25" y="-20" width="50" height="30" rx="3" />
        <path d="M-30,10 L-35,18 L35,18 L30,10" />
        <rect x="-18" y="-15" width="36" height="20" rx="1" />
      </g>
      {/* Coffee cup */}
      <g transform="translate(650, 480)">
        <path d="M-12,-15 L-8,15 L8,15 L12,-15" />
        <path d="M12,-5 C20,-5 22,5 15,8" />
        <path d="M-5,-20 C-5,-28 5,-28 5,-20" />
        <path d="M-10,-20 C-10,-30 0,-32 0,-22" />
        <line x1="-14" y1="-15" x2="14" y2="-15" />
      </g>
      {/* Notebook */}
      <g transform="translate(350, 100)">
        <rect x="-15" y="-22" width="30" height="44" rx="2" />
        <line x1="-12" y1="-12" x2="8" y2="-12" />
        <line x1="-12" y1="-4" x2="8" y2="-4" />
        <line x1="-12" y1="4" x2="8" y2="4" />
        <line x1="-12" y1="12" x2="4" y2="12" />
        <line x1="-15" y1="-15" x2="-18" y2="-15" />
        <line x1="-15" y1="-5" x2="-18" y2="-5" />
        <line x1="-15" y1="5" x2="-18" y2="5" />
        <line x1="-15" y1="15" x2="-18" y2="15" />
      </g>
      {/* Lightbulb */}
      <g transform="translate(720, 750)">
        <path d="M-10,5 C-16,-2 -16,-15 -8,-22 C-2,-27 2,-27 8,-22 C16,-15 16,-2 10,5" />
        <line x1="-8" y1="5" x2="8" y2="5" />
        <line x1="-6" y1="10" x2="6" y2="10" />
        <line x1="-4" y1="15" x2="4" y2="15" />
        <path d="M-3,-10 L0,-5 L3,-10" />
      </g>
    </g>
  );
}

const DECORATION_MAP: Record<VerticalType, React.FC<{ stroke: string; opacity: number }>> = {
  kids: KidsDecorations,
  schools: SchoolsDecorations,
  medicine: MedicineDecorations,
  construction: ConstructionDecorations,
  workshops: WorkshopsDecorations,
  living: LivingDecorations,
  culture: CultureDecorations,
  students: StudentsDecorations,
};

/** Background decorations — replaces flowers/bees in Dashboard BackgroundShapes */
export function BackgroundDecorations({ vertical }: { vertical: VerticalType }) {
  const Component = DECORATION_MAP[vertical] || KidsDecorations;
  return <Component stroke="hsl(200 42% 21%)" opacity={1} />;
}

/** Sidebar decorations — white stroke themed elements */
export function SidebarDecorations({ vertical }: { vertical: VerticalType }) {
  const Component = DECORATION_MAP[vertical] || KidsDecorations;
  // Scale down to fit sidebar viewport (280x900) from background viewport (1440x1024)
  return (
    <g transform="scale(0.2, 0.88) translate(-40, 0)">
      <Component stroke="white" opacity={0.45} />
    </g>
  );
}
