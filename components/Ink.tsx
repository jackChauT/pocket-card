// Hand-drawn ink marks that echo the card: red pen circles, wavy rules, line doodles.
// All decorative (aria-hidden). Lines draw themselves in via .ink-draw / .ink-draw-view (globals.css);
// with reduced motion they simply appear finished.
import Image from 'next/image';
import { product } from '@/lib/catalog';

const svgBase = { fill: 'none', stroke: 'currentColor', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };

// A quick pen loop that overshoots its start, like the circles on the card.
// No vector-effect: with non-scaling strokes Chrome mis-sizes pathLength dashes, leaving loops half drawn.
const LOOPS = [
  'M34 20 C82 3 168 5 190 40 C206 72 152 97 96 95 C40 93 5 75 8 48 C11 26 44 11 88 8',
  'M162 16 C120 2 32 6 12 38 C-2 66 46 96 102 95 C160 94 197 74 193 46 C190 24 152 9 104 8',
  'M40 86 C8 70 2 34 34 16 C68 -2 150 2 182 26 C206 46 192 82 150 92 C110 101 58 98 30 80',
];

/** Red pen circle drawn around inline text. */
export function InkCircle({ children, variant = 0 }: { children: React.ReactNode; variant?: number }) {
  return (
    <span className="relative inline-block whitespace-nowrap">
      {children}
      <svg {...svgBase} viewBox="0 0 200 100" preserveAspectRatio="none"
        className="ink-draw pointer-events-none absolute -inset-x-[7%] -inset-y-[20%] h-[140%] w-[114%] text-mark">
        <path d={LOOPS[variant % LOOPS.length]} pathLength={1} strokeWidth={3.2} />
      </svg>
    </span>
  );
}

// Rounder loops for square targets.
const RINGS = [
  'M60 22 C110 0 182 30 186 92 C190 156 140 190 92 186 C40 182 10 140 14 94 C17 52 50 24 104 14',
  'M150 26 C102 0 24 30 16 96 C9 158 62 192 110 186 C160 180 192 140 186 88 C181 44 146 20 92 18',
  'M40 160 C8 120 10 50 62 22 C112 -4 176 20 188 78 C200 136 160 186 100 188 C62 189 34 172 22 150',
];

/** Red pen ring around a block (the "look closer" lenses). Draws in as it scrolls into view. */
export function InkRing({ variant = 0, className = '' }: { variant?: number; className?: string }) {
  return (
    <svg {...svgBase} viewBox="0 0 200 200" className={`ink-draw-view pointer-events-none text-mark ${className}`}>
      <path d={RINGS[variant % RINGS.length]} pathLength={1} strokeWidth={1.7} />
    </svg>
  );
}

/** Wavy hand-drawn divider, used instead of straight borders between sections. */
export function InkRule({ className = '' }: { className?: string }) {
  return (
    <svg {...svgBase} viewBox="0 0 1200 12" preserveAspectRatio="none" className={`block h-3 w-full text-[#cfc5b7] ${className}`}>
      <path d="M2 7 C90 3 170 10 260 6 S430 2 520 7 S700 11 800 6 S980 2 1060 6 S1160 9 1198 5" strokeWidth={1.2} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** Line doodles for the three "how it works" steps: a folded card, a photo, an envelope. */
export function StepDoodle({ step, className = '' }: { step: number; className?: string }) {
  const paths = [
    // folded card with a tiny tree
    ['M9 9 L27 6 L29 38 L11 41 Z', 'M27 6 L37 10 L38 40 L29 38', 'M19 16 L15 27 L23 26 Z', 'M19 22 L14 31 L24 30 Z', 'M19 31 L19 34'],
    // snapshot photo with two figures
    ['M6 11 L37 8 L39 36 L8 39 Z', 'M10 15 L34 13 L35 29 L11 31 Z', 'M18 22 a2.5 2.5 0 1 0 0.1 0', 'M26 21 a2.5 2.5 0 1 0 0.1 0', 'M14 30 C15 25 21 25 22 29', 'M22 29 C23 24 29 24 30 28'],
    // envelope with a stamp
    ['M5 13 L38 10 L40 35 L7 38 Z', 'M5.5 14 L22 26 L38.5 11', 'M29 15 L35 14.5 L35.5 20.5 L29.5 21 Z'],
  ][step];
  return (
    <svg {...svgBase} viewBox="0 0 44 44" className={`size-11 text-ink ${className}`}>
      {paths.map((d) => <path key={d} d={d} strokeWidth={1.3} />)}
    </svg>
  );
}

/** Kraft-paper tape strip with torn ends. */
export function Tape({ className = '' }: { className?: string }) {
  return (
    <span aria-hidden className={`tape pointer-events-none absolute block h-[26px] w-[92px] ${className}`} />
  );
}

/** Perforated postage stamp + postmark, sits on the hero envelope. */
export function Stamp({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" aria-hidden className={`pointer-events-none ${className}`}>
      {/* stamp: scalloped edge = fat round-capped dashes in the envelope colour over a paper rect */}
      <g transform="rotate(4 40 52)">
        <rect x="12" y="14" width="56" height="70" fill="#FBF8F2" />
        <rect x="12" y="14" width="56" height="70" fill="none" stroke="#CFAE85" strokeWidth="5" strokeDasharray="0.01 6" strokeLinecap="round" />
        <rect x="19" y="21" width="42" height="44" fill="none" stroke="#211E1A" strokeWidth="0.9" />
        <path d="M40 27 L33 41 L47 41 Z M40 35 L31 52 L49 52 Z M40 52 L40 57" fill="none" stroke="#211E1A" strokeWidth="1" strokeLinejoin="round" />
        <path d="M40 23.5 l1 2.2 2.3 .3 -1.7 1.6 .5 2.3 -2.1 -1.2 -2.1 1.2 .5 -2.3 -1.7 -1.6 2.3 -.3 Z" fill="#D23B2A" />
        <text x="40" y="76" textAnchor="middle" fontSize="6.4" letterSpacing="1" fill="#211E1A" fontFamily="Georgia, serif">HONG KONG</text>
      </g>
      {/* postmark */}
      <g fill="none" stroke="#211E1A" strokeOpacity="0.55" strokeWidth="1">
        <circle cx="74" cy="70" r="20" />
        <circle cx="74" cy="70" r="15" />
        <path d="M50 92 C62 88 72 96 84 92 S106 88 116 92 M48 99 C60 95 70 103 82 99 S104 95 114 99 M52 106 C64 102 74 110 86 106 S108 102 118 106" />
        <text x="74" y="72.5" textAnchor="middle" fontSize="6" fill="#211E1A" fillOpacity="0.6" stroke="none" fontFamily="Georgia, serif">HK · 2026</text>
      </g>
    </svg>
  );
}

/** A round close-up of one detail in the illustration, ringed in red pen. */
export function Lens({ x, y, caption, variant }: { x: number; y: number; caption: string; variant: number }) {
  const { width, height } = product.imageSize;
  return (
    <figure className="flex flex-col items-center gap-5">
      <div className="relative size-[220px] md:size-[240px] lg:size-[268px]">
        <div className="grain absolute inset-0 overflow-hidden rounded-full bg-[#fbf8f2] shadow-[0_1px_1px_rgba(33,30,26,0.06),0_16px_34px_-14px_rgba(33,30,26,0.3)]">
          {/* 1:1 crop of the artwork, centred on (x, y) in source pixels */}
          <Image src={product.images.ready} width={width} height={height} alt="" sizes={`${width}px`}
            className="absolute max-w-none" style={{ width, height, left: `calc(50% - ${x}px)`, top: `calc(50% - ${y}px)` }} />
        </div>
        <InkRing variant={variant} className="absolute -inset-[7%] h-[114%] w-[114%]" />
      </div>
      <figcaption className="hand text-center text-xl text-text-2 md:text-[22px]">{caption}</figcaption>
    </figure>
  );
}

/** Rooftops, a tree and a lamp post in one ink line, above the footer. */
export function Skyline({ className = '' }: { className?: string }) {
  return (
    <svg {...svgBase} viewBox="0 0 1200 96" preserveAspectRatio="xMidYMax meet" className={`block w-full text-ink/35 ${className}`}>
      <path strokeWidth={1.2} vectorEffect="non-scaling-stroke" d="
        M70 92 L70 52 L98 30 L126 52 L126 92 M84 92 L84 74 L96 74 L96 92 M106 58 L118 58 L118 68 L106 68 Z M112 38 L112 26 L118 26 L118 44
        M126 70 L126 44 L150 22 L174 44 L174 92 M140 54 L160 54 L160 66 L140 66 Z M150 54 L150 66
        M290 92 L290 60 L330 60 L330 92 M286 60 C298 52 318 52 334 60 M300 72 L320 72 M300 80 L320 80
        M520 92 L520 86 M520 30 L506 54 L514 54 L500 76 L540 76 L526 54 L534 54 Z M520 24 l2 4 4 .5 -3 2.8 .8 4.2 -3.8 -2 -3.8 2 .8 -4.2 -3 -2.8 4 -.5 Z
        M720 92 L720 40 M714 40 L726 40 L724 30 L716 30 Z M712 30 L728 30
        M860 92 L860 62 L890 62 L890 92 M854 62 C866 54 884 54 896 62 M868 70 L882 70 L882 80 L868 80 Z
        M1010 92 L1010 50 L1040 26 L1070 50 L1070 92 M1024 92 L1024 72 L1036 72 L1036 92 M1046 58 L1060 58 L1060 68 L1046 68 Z
        M1070 66 L1070 48 L1092 34 L1114 48 L1114 92 M1084 56 L1100 56 L1100 66 L1084 66 Z
      " />
    </svg>
  );
}
