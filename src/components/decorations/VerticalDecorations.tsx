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
      {/* Additional: small daisy cluster */}
      <g transform="translate(200, 350)">
        <circle cx="0" cy="0" r="3" />
        <ellipse cx="0" cy="-8" rx="3" ry="6" />
        <ellipse cx="0" cy="-8" rx="3" ry="6" transform="rotate(72)" />
        <ellipse cx="0" cy="-8" rx="3" ry="6" transform="rotate(144)" />
        <ellipse cx="0" cy="-8" rx="3" ry="6" transform="rotate(216)" />
        <ellipse cx="0" cy="-8" rx="3" ry="6" transform="rotate(288)" />
        <path d="M0,8 C-1,20 1,35 -2,50" />
      </g>
      {/* Additional: ladybug */}
      <g transform="translate(1250, 500)">
        <ellipse cx="0" cy="0" rx="10" ry="12" />
        <line x1="0" y1="-12" x2="0" y2="12" />
        <circle cx="-4" cy="-4" r="2" />
        <circle cx="4" cy="2" r="2" />
        <circle cx="-3" cy="6" r="1.5" />
        <circle cx="0" cy="-14" r="5" />
        <path d="M-3,-18 C-6,-26 -4,-28 -2,-24" />
        <path d="M3,-18 C6,-26 4,-28 2,-24" />
      </g>
      {/* Additional: small butterfly */}
      <g transform="translate(900, 900)">
        <path d="M0,0 C-8,-3 -9,-12 -4,-16 C-1,-19 3,-19 6,-16 C11,-12 9,-3 0,0" />
        <path d="M0,0 C-6,3 -8,10 -4,14 C-1,17 3,17 6,14 C10,10 8,3 0,0" />
        <path d="M-3,-8 C-1,-5 1,-5 3,-8" />
      </g>
      {/* Additional: sunflower */}
      <g transform="translate(1350, 850)">
        <circle cx="0" cy="0" r="7" />
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(a => (
          <ellipse key={a} cx="0" cy="-14" rx="4" ry="8" transform={`rotate(${a})`} />
        ))}
        <path d="M0,14 C1,40 -1,60 2,85" />
        <path d="M0,45 C-15,38 -18,52 -6,54" />
        <path d="M1,60 C14,55 16,68 6,70" />
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
      {/* Additional: globe */}
      <g transform="translate(200, 350)">
        <circle cx="0" cy="0" r="18" />
        <ellipse cx="0" cy="0" rx="8" ry="18" />
        <path d="M-18,0 L18,0" />
        <path d="M-16,-8 C-8,-6 8,-6 16,-8" />
        <path d="M-16,8 C-8,10 8,10 16,8" />
      </g>
      {/* Additional: calculator */}
      <g transform="translate(1300, 550)">
        <rect x="-14" y="-22" width="28" height="44" rx="3" />
        <rect x="-10" y="-18" width="20" height="10" rx="1" />
        <circle cx="-5" cy="-1" r="2" />
        <circle cx="5" cy="-1" r="2" />
        <circle cx="-5" cy="9" r="2" />
        <circle cx="5" cy="9" r="2" />
        <circle cx="-5" cy="17" r="2" />
        <rect x="2" y="7" width="6" height="12" rx="1" />
      </g>
      {/* Additional: apple */}
      <g transform="translate(950, 920)">
        <path d="M0,-14 C-12,-14 -18,-6 -16,4 C-14,14 -6,20 0,22 C6,20 14,14 16,4 C18,-6 12,-14 0,-14" />
        <path d="M0,-14 C2,-20 4,-24 2,-28" />
        <path d="M2,-22 C8,-24 12,-20 10,-16" />
      </g>
      {/* Additional: ABC */}
      <g transform="translate(1250, 880)">
        <path d="M-15,10 L-10,-10 L-5,10" />
        <line x1="-13" y1="3" x2="-7" y2="3" />
        <path d="M0,-10 L0,10 C0,10 8,10 8,3 C8,-4 0,-4 0,-4 C0,-4 7,-4 7,-10" />
        <path d="M15,10 C20,10 24,5 24,0 C24,-5 20,-10 15,-10" />
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
      {/* Additional: heartbeat */}
      <g transform="translate(200, 350)">
        <path d="M-30,0 L-15,0 L-10,-15 L-5,20 L0,-10 L5,5 L10,0 L30,0" />
      </g>
      {/* Additional: syringe */}
      <g transform="translate(1300, 550) rotate(-45)">
        <rect x="-3" y="-25" width="6" height="35" rx="1" />
        <line x1="-6" y1="-25" x2="6" y2="-25" />
        <line x1="0" y1="10" x2="0" y2="20" />
        <line x1="-3" y1="-15" x2="-7" y2="-15" />
        <line x1="-3" y1="-8" x2="-7" y2="-8" />
        <line x1="-3" y1="-1" x2="-7" y2="-1" />
      </g>
      {/* Additional: bandage cross */}
      <g transform="translate(950, 920)">
        <rect x="-18" y="-6" width="36" height="12" rx="3" />
        <rect x="-6" y="-18" width="12" height="36" rx="3" />
        <circle cx="0" cy="0" r="2" />
        <circle cx="-4" cy="-4" r="1" />
        <circle cx="4" cy="4" r="1" />
      </g>
      {/* Additional: DNA helix */}
      <g transform="translate(1250, 880)">
        <path d="M-8,-20 C-8,-10 8,-10 8,-20" />
        <path d="M-8,-10 C-8,0 8,0 8,-10" />
        <path d="M-8,0 C-8,10 8,10 8,0" />
        <path d="M-8,10 C-8,20 8,20 8,10" />
        <line x1="-5" y1="-15" x2="5" y2="-15" />
        <line x1="-5" y1="-5" x2="5" y2="-5" />
        <line x1="-5" y1="5" x2="5" y2="5" />
        <line x1="-5" y1="15" x2="5" y2="15" />
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
      {/* Additional: shovel */}
      <g transform="translate(200, 350) rotate(-20)">
        <rect x="-2" y="-40" width="4" height="60" rx="1" />
        <path d="M-8,20 C-10,30 -6,38 0,40 C6,38 10,30 8,20" />
      </g>
      {/* Additional: traffic cone */}
      <g transform="translate(1300, 550)">
        <path d="M-5,-25 L-15,10 L15,10 L5,-25" />
        <line x1="-18" y1="10" x2="18" y2="10" />
        <line x1="-9" y1="-8" x2="9" y2="-8" />
        <line x1="-12" y1="2" x2="12" y2="2" />
      </g>
      {/* Additional: wheelbarrow */}
      <g transform="translate(950, 920)">
        <path d="M-20,-10 L-10,-15 L15,-15 L20,-5 L-10,-5 Z" />
        <circle cx="22" cy="0" r="6" />
        <line x1="-20" y1="-10" x2="-30" y2="5" />
        <line x1="-10" y1="-5" x2="-25" y2="5" />
      </g>
      {/* Additional: level tool */}
      <g transform="translate(1250, 880) rotate(10)">
        <rect x="-25" y="-4" width="50" height="8" rx="2" />
        <rect x="-6" y="-3" width="12" height="6" rx="3" />
        <circle cx="0" cy="0" r="2" />
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
      {/* Additional: oil can */}
      <g transform="translate(200, 350)">
        <rect x="-10" y="-8" width="20" height="16" rx="3" />
        <path d="M10,-4 L20,-10 L22,-8 L12,0" />
        <path d="M-5,-8 L-5,-14 L5,-14 L5,-8" />
      </g>
      {/* Additional: tire */}
      <g transform="translate(1300, 550)">
        <circle cx="0" cy="0" r="18" />
        <circle cx="0" cy="0" r="10" />
        <circle cx="0" cy="0" r="4" />
        <line x1="0" y1="-10" x2="0" y2="-18" />
        <line x1="0" y1="10" x2="0" y2="18" />
        <line x1="-10" y1="0" x2="-18" y2="0" />
        <line x1="10" y1="0" x2="18" y2="0" />
      </g>
      {/* Additional: spark plug */}
      <g transform="translate(950, 920)">
        <rect x="-4" y="-20" width="8" height="15" rx="2" />
        <rect x="-6" y="-5" width="12" height="6" rx="1" />
        <path d="M-3,1 L-6,12 L3,6 L-3,18" />
      </g>
      {/* Additional: piston */}
      <g transform="translate(1250, 880)">
        <rect x="-10" y="-15" width="20" height="20" rx="2" />
        <line x1="0" y1="-15" x2="0" y2="-30" />
        <circle cx="0" cy="-30" r="3" />
        <line x1="-10" y1="-8" x2="10" y2="-8" />
        <line x1="-10" y1="0" x2="10" y2="0" />
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
      {/* Additional: key */}
      <g transform="translate(200, 350)">
        <circle cx="0" cy="0" r="8" />
        <circle cx="0" cy="0" r="4" />
        <line x1="8" y1="0" x2="30" y2="0" />
        <line x1="25" y1="0" x2="25" y2="6" />
        <line x1="30" y1="0" x2="30" y2="8" />
      </g>
      {/* Additional: fence */}
      <g transform="translate(1300, 550)">
        <line x1="-20" y1="-5" x2="20" y2="-5" />
        <line x1="-20" y1="5" x2="20" y2="5" />
        <line x1="-18" y1="-12" x2="-18" y2="10" />
        <line x1="-8" y1="-12" x2="-8" y2="10" />
        <line x1="2" y1="-12" x2="2" y2="10" />
        <line x1="12" y1="-12" x2="12" y2="10" />
        <path d="M-20,-12 L-18,-16 L-16,-12" />
        <path d="M-10,-12 L-8,-16 L-6,-12" />
        <path d="M0,-12 L2,-16 L4,-12" />
        <path d="M10,-12 L12,-16 L14,-12" />
      </g>
      {/* Additional: mailbox */}
      <g transform="translate(950, 920)">
        <path d="M-10,-10 C-10,-20 10,-20 10,-10 L10,5 L-10,5 Z" />
        <line x1="0" y1="5" x2="0" y2="25" />
        <line x1="-6" y1="25" x2="6" y2="25" />
        <line x1="10" y1="-5" x2="16" y2="-5" />
        <line x1="16" y1="-5" x2="16" y2="-10" />
      </g>
      {/* Additional: tree */}
      <g transform="translate(1250, 880)">
        <line x1="0" y1="10" x2="0" y2="30" />
        <circle cx="0" cy="-5" r="16" />
        <circle cx="-10" cy="0" r="10" />
        <circle cx="10" cy="0" r="10" />
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
      {/* Additional: violin */}
      <g transform="translate(200, 350)">
        <ellipse cx="0" cy="-10" rx="8" ry="10" />
        <ellipse cx="0" cy="12" rx="10" ry="12" />
        <path d="M-5,0 C-2,2 2,2 5,0" />
        <line x1="0" y1="-20" x2="0" y2="-45" />
        <line x1="-3" y1="-45" x2="3" y2="-45" />
        <path d="M8,-5 C12,-2 12,2 8,5" />
        <path d="M-8,-5 C-12,-2 -12,2 -8,5" />
      </g>
      {/* Additional: palette */}
      <g transform="translate(1300, 550)">
        <path d="M-18,0 C-18,-15 -5,-22 8,-18 C20,-14 24,-2 20,10 C16,20 5,22 -5,18 C-12,16 -18,10 -18,0" />
        <circle cx="-8" cy="-8" r="3" />
        <circle cx="4" cy="-12" r="2.5" />
        <circle cx="12" cy="-4" r="2.5" />
        <circle cx="10" cy="8" r="2" />
        <circle cx="-2" cy="10" r="2" />
      </g>
      {/* Additional: star */}
      <g transform="translate(950, 920)">
        <path d="M0,-16 L4,-5 L16,-5 L6,3 L10,14 L0,7 L-10,14 L-6,3 L-16,-5 L-4,-5 Z" />
      </g>
      {/* Additional: harp */}
      <g transform="translate(1250, 880)">
        <path d="M-10,20 L-10,-15 C-10,-25 10,-25 15,-15 L15,10" />
        <path d="M-10,20 C0,22 10,18 15,10" />
        <line x1="-8" y1="-10" x2="13" y2="8" />
        <line x1="-8" y1="-2" x2="14" y2="4" />
        <line x1="-8" y1="6" x2="14" y2="0" />
        <line x1="-8" y1="14" x2="14" y2="-4" />
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
      {/* Additional: backpack */}
      <g transform="translate(200, 350)">
        <rect x="-12" y="-15" width="24" height="30" rx="5" />
        <rect x="-8" y="-5" width="16" height="12" rx="2" />
        <path d="M-8,-15 C-8,-22 8,-22 8,-15" />
        <line x1="-12" y1="-8" x2="-16" y2="-8" />
        <line x1="12" y1="-8" x2="16" y2="-8" />
      </g>
      {/* Additional: wifi signal */}
      <g transform="translate(1300, 550)">
        <circle cx="0" cy="8" r="2" />
        <path d="M-8,4 C-8,-2 8,-2 8,4" />
        <path d="M-14,0 C-14,-8 14,-8 14,0" />
        <path d="M-20,-4 C-20,-14 20,-14 20,-4" />
      </g>
      {/* Additional: microscope */}
      <g transform="translate(950, 920)">
        <circle cx="5" cy="-20" r="6" />
        <line x1="5" y1="-14" x2="0" y2="10" />
        <line x1="-10" y1="10" x2="10" y2="10" />
        <line x1="-8" y1="10" x2="-8" y2="15" />
        <line x1="8" y1="10" x2="8" y2="15" />
        <line x1="-12" y1="15" x2="12" y2="15" />
        <line x1="-5" y1="0" x2="8" y2="0" />
      </g>
      {/* Additional: headphones */}
      <g transform="translate(1250, 880)">
        <path d="M-15,5 C-15,-10 -10,-18 0,-18 C10,-18 15,-10 15,5" />
        <rect x="-18" y="2" width="8" height="14" rx="3" />
        <rect x="10" y="2" width="8" height="14" rx="3" />
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

/** Stroke colors per vertical — light strokes for dark backgrounds */
const BACKGROUND_STROKE: Record<string, string> = {
  culture: 'hsl(40 30% 70%)',   // gold-tinted for dark noir
  kids: 'hsl(200 42% 21%)',
  schools: 'hsl(200 42% 21%)',
  medicine: 'hsl(200 50% 35%)',
  construction: 'hsl(30 20% 30%)',
  workshops: 'hsl(215 20% 30%)',
  living: 'hsl(145 25% 30%)',
  students: 'hsl(200 42% 21%)',
};

/** Background decorations — replaces flowers/bees in Dashboard BackgroundShapes */
export function BackgroundDecorations({ vertical }: { vertical: VerticalType }) {
  const Component = DECORATION_MAP[vertical] || KidsDecorations;
  const stroke = BACKGROUND_STROKE[vertical] || BACKGROUND_STROKE.kids;
  return <Component stroke={stroke} opacity={1} />;
}

/** Sidebar decorations — separate smaller SVGs placed in sidebar space, NOT scaled from background */
export function SidebarDecorations({ vertical }: { vertical: VerticalType }) {
  const Component = SIDEBAR_MAP[vertical] || KidsSidebar;
  return <Component />;
}

/* ─── Sidebar-specific smaller decorations (drawn for 280x900 viewport) ─── */

function KidsSidebar() {
  return (
    <g stroke="white" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.35">
      {/* Small flower */}
      <g transform="translate(220, 120)">
        <circle cx="0" cy="0" r="4" />
        <ellipse cx="0" cy="-9" rx="4" ry="7" />
        <ellipse cx="0" cy="-9" rx="4" ry="7" transform="rotate(72)" />
        <ellipse cx="0" cy="-9" rx="4" ry="7" transform="rotate(144)" />
        <ellipse cx="0" cy="-9" rx="4" ry="7" transform="rotate(216)" />
        <ellipse cx="0" cy="-9" rx="4" ry="7" transform="rotate(288)" />
        <path d="M0,10 C-1,25 1,40 -2,55" />
      </g>
      {/* Bee */}
      <g transform="translate(40, 350)">
        <ellipse cx="0" cy="0" rx="8" ry="5" />
        <line x1="-2" y1="-4.5" x2="-2" y2="4.5" />
        <line x1="2" y1="-5" x2="2" y2="5" />
        <circle cx="10" cy="0" r="3" />
        <ellipse cx="-1" cy="-7" rx="5" ry="3" transform="rotate(-15, -1, -7)" />
        <ellipse cx="3" cy="-8" rx="5" ry="3" transform="rotate(10, 3, -8)" />
      </g>
      {/* Butterfly */}
      <g transform="translate(200, 550)">
        <path d="M0,0 C-7,-3 -9,-12 -5,-16 C-2,-19 2,-19 5,-16 C9,-12 7,-3 0,0" />
        <path d="M0,0 C-5,3 -7,9 -4,12 C-1,15 1,15 4,12 C7,9 5,3 0,0" />
      </g>
      {/* Tulip */}
      <g transform="translate(50, 720)">
        <path d="M0,-15 C-6,-13 -10,-6 -9,0 C-7,4 -3,7 0,6" />
        <path d="M0,-15 C6,-13 10,-6 9,0 C7,4 3,7 0,6" />
        <path d="M0,6 C0,20 0,40 1,50" />
      </g>
    </g>
  );
}

function SchoolsSidebar() {
  return (
    <g stroke="white" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.35">
      {/* Book */}
      <g transform="translate(210, 130)">
        <path d="M0,0 C-10,-4 -25,-4 -28,3 L-28,28 C-25,20 -10,20 0,24" />
        <path d="M0,0 C10,-4 25,-4 28,3 L28,28 C25,20 10,20 0,24" />
        <line x1="0" y1="0" x2="0" y2="24" />
      </g>
      {/* Pencil */}
      <g transform="translate(40, 400) rotate(-20)">
        <rect x="-3" y="-28" width="6" height="42" rx="1" />
        <path d="M-3,14 L0,20 L3,14" />
        <line x1="-3" y1="-20" x2="3" y2="-20" />
      </g>
      {/* Graduation cap */}
      <g transform="translate(200, 600)">
        <path d="M-22,0 L0,-10 L22,0 L0,10 Z" />
        <line x1="0" y1="10" x2="0" y2="22" />
        <path d="M-8,18 C-8,24 8,24 8,18" />
      </g>
      {/* Globe */}
      <g transform="translate(60, 750)">
        <circle cx="0" cy="0" r="14" />
        <ellipse cx="0" cy="0" rx="6" ry="14" />
        <line x1="-14" y1="0" x2="14" y2="0" />
      </g>
    </g>
  );
}

function MedicineSidebar() {
  return (
    <g stroke="white" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.35">
      {/* Stethoscope */}
      <g transform="translate(210, 130)">
        <path d="M-8,-18 C-8,-10 -12,0 -12,10 C-12,22 0,26 8,22 C14,18 14,8 8,8 C4,8 0,12 0,16" />
        <circle cx="0" cy="18" r="2.5" />
        <circle cx="-8" cy="-20" r="3" />
        <circle cx="4" cy="-20" r="3" />
      </g>
      {/* Medical cross */}
      <g transform="translate(50, 400)">
        <rect x="-14" y="-14" width="28" height="28" rx="4" />
        <line x1="0" y1="-7" x2="0" y2="7" strokeWidth="2.5" />
        <line x1="-7" y1="0" x2="7" y2="0" strokeWidth="2.5" />
      </g>
      {/* Heartbeat */}
      <g transform="translate(180, 600)">
        <path d="M-25,0 L-12,0 L-8,-12 L-4,15 L0,-8 L4,4 L8,0 L25,0" />
      </g>
      {/* Pill */}
      <g transform="translate(60, 750) rotate(25)">
        <rect x="-5" y="-14" width="10" height="28" rx="5" />
        <line x1="-5" y1="0" x2="5" y2="0" />
      </g>
    </g>
  );
}

function ConstructionSidebar() {
  return (
    <g stroke="white" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.35">
      {/* Hard hat */}
      <g transform="translate(200, 130)">
        <path d="M-18,4 L-18,0 C-18,-14 18,-14 18,0 L18,4" />
        <line x1="-22" y1="4" x2="22" y2="4" />
        <line x1="-20" y1="4" x2="-20" y2="9" />
        <line x1="20" y1="4" x2="20" y2="9" />
        <line x1="-20" y1="9" x2="20" y2="9" />
      </g>
      {/* Crane hook */}
      <g transform="translate(50, 380)">
        <line x1="0" y1="-30" x2="0" y2="0" />
        <path d="M-8,0 C-8,12 8,12 8,0" />
        <line x1="-10" y1="0" x2="10" y2="0" />
        <circle cx="0" cy="14" r="3" />
      </g>
      {/* Bricks */}
      <g transform="translate(190, 580)">
        <rect x="-20" y="-8" width="18" height="8" />
        <rect x="0" y="-8" width="18" height="8" />
        <rect x="-12" y="0" width="18" height="8" />
        <rect x="8" y="0" width="18" height="8" />
      </g>
      {/* Traffic cone */}
      <g transform="translate(60, 750)">
        <path d="M-4,-18 L-10,8 L10,8 L4,-18" />
        <line x1="-12" y1="8" x2="12" y2="8" />
        <line x1="-7" y1="-5" x2="7" y2="-5" />
      </g>
    </g>
  );
}

function WorkshopsSidebar() {
  return (
    <g stroke="white" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.35">
      {/* Wrench */}
      <g transform="translate(210, 130) rotate(40)">
        <path d="M-4,-20 C-9,-20 -11,-14 -9,-10 L0,0 L9,-10 C11,-14 9,-20 4,-20 C2,-18 -2,-18 -4,-20" />
        <rect x="-2.5" y="0" width="5" height="28" rx="1" />
      </g>
      {/* Gear */}
      <g transform="translate(50, 380)">
        <circle cx="0" cy="0" r="10" />
        <circle cx="0" cy="0" r="4" />
        {[0,45,90,135,180,225,270,315].map(a => (
          <line key={a} x1="0" y1="-9" x2="0" y2="-14" transform={`rotate(${a})`} strokeWidth="3" />
        ))}
      </g>
      {/* Car */}
      <g transform="translate(190, 580)">
        <path d="M-22,0 L-18,-6 L-10,-10 L10,-10 L18,-6 L22,0 L22,4 L-22,4 Z" />
        <circle cx="-13" cy="6" r="4" />
        <circle cx="13" cy="6" r="4" />
      </g>
      {/* Tire */}
      <g transform="translate(60, 750)">
        <circle cx="0" cy="0" r="14" />
        <circle cx="0" cy="0" r="8" />
        <circle cx="0" cy="0" r="3" />
      </g>
    </g>
  );
}

function LivingSidebar() {
  return (
    <g stroke="white" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.35">
      {/* House */}
      <g transform="translate(200, 130)">
        <path d="M-18,8 L0,-10 L18,8" />
        <rect x="-14" y="8" width="28" height="18" />
        <rect x="-5" y="14" width="10" height="12" />
      </g>
      {/* Key */}
      <g transform="translate(50, 380)">
        <circle cx="0" cy="0" r="7" />
        <circle cx="0" cy="0" r="3" />
        <line x1="7" y1="0" x2="24" y2="0" />
        <line x1="20" y1="0" x2="20" y2="5" />
        <line x1="24" y1="0" x2="24" y2="6" />
      </g>
      {/* Plant */}
      <g transform="translate(190, 580)">
        <path d="M-6,12 L-9,28 L9,28 L6,12" />
        <line x1="0" y1="12" x2="0" y2="-4" />
        <path d="M0,-4 C-12,-8 -14,-18 -4,-18 C0,-18 0,-10 0,-4" />
        <path d="M0,-4 C12,-8 14,-18 4,-18 C0,-18 0,-10 0,-4" />
      </g>
      {/* Sun */}
      <g transform="translate(60, 750)">
        <circle cx="0" cy="0" r="9" />
        {[0,45,90,135,180,225,270,315].map(a => (
          <line key={a} x1="0" y1="-13" x2="0" y2="-17" transform={`rotate(${a})`} />
        ))}
      </g>
    </g>
  );
}

function CultureSidebar() {
  return (
    <g stroke="white" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.35">
      {/* Theater mask */}
      <g transform="translate(200, 130)">
        <path d="M-16,-10 C-16,-18 -4,-20 0,-12 C4,-20 16,-18 16,-10 C16,0 8,8 0,10 C-8,8 -16,0 -16,-10" />
        <circle cx="-6" cy="-5" r="2" />
        <circle cx="6" cy="-5" r="2" />
        <path d="M-5,2 C-3,6 3,6 5,2" />
      </g>
      {/* Musical note */}
      <g transform="translate(50, 380)">
        <ellipse cx="0" cy="12" rx="7" ry="4" transform="rotate(-15, 0, 12)" />
        <line x1="6" y1="10" x2="6" y2="-15" />
        <path d="M6,-15 C12,-17 16,-12 12,-7" />
      </g>
      {/* Star */}
      <g transform="translate(200, 580)">
        <path d="M0,-14 L3.5,-4.5 L14,-4.5 L5.5,2 L8.5,12 L0,6 L-8.5,12 L-5.5,2 L-14,-4.5 L-3.5,-4.5 Z" />
      </g>
      {/* Spotlight */}
      <g transform="translate(60, 750)">
        <circle cx="0" cy="0" r="6" />
        <path d="M-5,5 L-15,25" />
        <path d="M5,5 L15,25" />
        <path d="M-15,25 C-7,28 7,28 15,25" />
        <circle cx="0" cy="0" r="2.5" />
      </g>
    </g>
  );
}

function StudentsSidebar() {
  return (
    <g stroke="white" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.35">
      {/* Laptop */}
      <g transform="translate(200, 130)">
        <rect x="-18" y="-14" width="36" height="22" rx="2" />
        <path d="M-22,8 L-26,14 L26,14 L22,8" />
      </g>
      {/* Coffee */}
      <g transform="translate(50, 380)">
        <path d="M-9,-10 L-6,10 L6,10 L9,-10" />
        <path d="M9,-3 C15,-3 16,4 11,6" />
        <line x1="-11" y1="-10" x2="11" y2="-10" />
        <path d="M-3,-14 C-3,-20 3,-20 3,-14" />
      </g>
      {/* Lightbulb */}
      <g transform="translate(200, 580)">
        <path d="M-8,4 C-12,-2 -12,-12 -6,-16 C-2,-20 2,-20 6,-16 C12,-12 12,-2 8,4" />
        <line x1="-6" y1="4" x2="6" y2="4" />
        <line x1="-5" y1="8" x2="5" y2="8" />
        <line x1="-3" y1="12" x2="3" y2="12" />
      </g>
      {/* Wifi */}
      <g transform="translate(60, 750)">
        <circle cx="0" cy="6" r="2" />
        <path d="M-6,3 C-6,-2 6,-2 6,3" />
        <path d="M-12,0 C-12,-6 12,-6 12,0" />
        <path d="M-18,-3 C-18,-12 18,-12 18,-3" />
      </g>
    </g>
  );
}

const SIDEBAR_MAP: Record<VerticalType, React.FC> = {
  kids: KidsSidebar,
  schools: SchoolsSidebar,
  medicine: MedicineSidebar,
  construction: ConstructionSidebar,
  workshops: WorkshopsSidebar,
  living: LivingSidebar,
  culture: CultureSidebar,
  students: StudentsSidebar,
};
