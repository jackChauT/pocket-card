import Image from 'next/image';
import { MAX_QTY, product, type Variant } from '@/lib/catalog';

type IconProps = { size?: number; className?: string };
const svg = (size: number, className?: string, strokeWidth = 1.5) => ({
  width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth,
  strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true, className,
});

export const LockIcon = ({ size = 16, className }: IconProps) => (
  <svg {...svg(size, className)}><rect x="5" y="11" width="14" height="9" rx="1" /><path d="M8 11 V8 a4 4 0 0 1 8 0 V11" /></svg>
);
export const BagIcon = ({ size = 20, className }: IconProps) => (
  <svg {...svg(size, className)}><path d="M5 8 H19 L18 20 H6 Z" /><path d="M9 8 V6.5 a3 3 0 0 1 6 0 V8" /></svg>
);
export const ChatIcon = ({ size = 18, className }: IconProps) => (
  <svg {...svg(size, className)}><path d="M4 20 L5.3 16.2 A8 8 0 1 1 8 18.8 Z" /></svg>
);
export const UploadIcon = ({ size = 26, className }: IconProps) => (
  <svg {...svg(size, className, 1.4)}><path d="M12 15 V4" /><path d="M7.5 8.5 L12 4 L16.5 8.5" /><path d="M4 15 V19 H20 V15" /></svg>
);
export const ChevronIcon = ({ size = 14, className }: IconProps) => (
  <svg {...svg(size, className, 1.6)}><path d="M6 9 L12 15 L18 9" /></svg>
);

export function CardImage({ variant = 'ready', alt = '', className = '', sizes, priority }: {
  variant?: Variant; alt?: string; className?: string; sizes: string; priority?: boolean;
}) {
  return (
    <Image
      src={variant === 'personalised' ? product.images.personalised : product.images.ready}
      width={product.imageSize.width}
      height={product.imageSize.height}
      alt={alt}
      sizes={sizes}
      priority={priority}
      className={`art h-auto ${className}`}
    />
  );
}

export function Thumb({ variant, size }: { variant: Variant; size: string }) {
  return (
    <div className={`${size} flex shrink-0 items-center justify-center bg-tile`} style={{ aspectRatio: '4 / 5' }}>
      <CardImage variant={variant} sizes="96px" className="w-[62%] shadow-[0_6px_14px_-6px_rgba(33,30,26,0.3)]" />
    </div>
  );
}

export function Stepper({ value, onChange, size = 'md', labels }: {
  value: number; onChange: (n: number) => void; size?: 'sm' | 'md' | 'lg';
  labels: { group: string; decrease: string; increase: string };
}) {
  const h = { sm: 'h-11', md: 'h-12', lg: 'h-12 md:h-14' }[size];
  const btn = `step ${size === 'sm' ? 'w-10' : 'w-12'} h-full text-lg`;
  return (
    <div role="group" aria-label={labels.group} className={`flex ${h} items-center rounded-[2px] border border-line-input`}>
      <button type="button" className={btn} aria-label={labels.decrease} disabled={value <= 1} onClick={() => onChange(value - 1)}>−</button>
      <span aria-live="polite" className="w-8 text-center">{value}</span>
      <button type="button" className={btn} aria-label={labels.increase} disabled={value >= MAX_QTY} onClick={() => onChange(value + 1)}>+</button>
    </div>
  );
}
