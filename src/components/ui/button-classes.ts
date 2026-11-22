/**
 * The button's classes, in one place: `buttonVariants` (./button.tsx) is
 * built from them, and `buttonClass` gives the same string without
 * class-variance-authority and tailwind-merge (about 8 KB gzip), for client
 * code that loads with the public pages (studio issue #79). For the
 * variants and sizes it accepts, the base and the variant and size never set
 * the same property, so the plain join equals
 * `cn(buttonVariants({ variant, size }))`; a test checks every combination.
 * `destructive` changes the focus ring colour and `sm` and `lg` repeat
 * `rounded-md` (`sm` also the gap), which needs tailwind-merge: use `Button`
 * for those.
 */
export const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive";

export const BUTTON_VARIANTS = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/90',
  destructive:
    'bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
  outline:
    'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  ghost: 'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
  link: 'text-primary underline-offset-4 hover:underline',
} as const;

export const BUTTON_SIZES = {
  default: 'h-9 px-4 py-2 has-[>svg]:px-3',
  sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
  lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
  icon: 'size-9',
  'icon-sm': 'size-8',
  'icon-lg': 'size-10',
} as const;

export type ButtonClassVariant = Exclude<
  keyof typeof BUTTON_VARIANTS,
  'destructive'
>;
export type ButtonClassSize = Exclude<keyof typeof BUTTON_SIZES, 'sm' | 'lg'>;

/** `cn(buttonVariants({ variant, size }))`, without the class tooling. */
export function buttonClass(
  variant: ButtonClassVariant = 'default',
  size: ButtonClassSize = 'default'
): string {
  return `${BUTTON_BASE} ${BUTTON_VARIANTS[variant]} ${BUTTON_SIZES[size]}`;
}
