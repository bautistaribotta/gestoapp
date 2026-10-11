import { oklchToRgba, type OklchColor } from './oklch';

const palette = {
  ink: 'oklch(0.21 0.012 250)',
  inkPressed: 'oklch(0.30 0.012 250)',
  /** Texto corrido largo, como los documentos legales. */
  textBody: 'oklch(0.30 0.012 250)',
  textSecondary: 'oklch(0.38 0.012 250)',
  textMuted: 'oklch(0.47 0.012 250)',
  borderStrong: 'oklch(0.62 0.012 250)',
  border: 'oklch(0.89 0.006 250)',
  sunken: 'oklch(0.95 0.004 250)',
  background: 'oklch(0.975 0.003 250)',
  surface: 'oklch(1 0 0)',
  alertText: 'oklch(0.42 0.11 30)',
  alertBorder: 'oklch(0.80 0.06 30)',
  alertSoft: 'oklch(0.97 0.015 30)',
  alertStrong: 'oklch(0.50 0.10 30)',
  /** Bebé del logo; mismo tono que el ladrillo, pero sin función de alerta. */
  logoAccent: 'oklch(0.50 0.10 30)',
  transparent: 'oklch(0 0 0 / 0)',
  shadow: 'oklch(0.21 0.012 250 / 0.15)',
  scrim: 'oklch(0.21 0.012 250 / 0.5)',
  toastShadow: 'oklch(0.21 0.012 250 / 0.25)',
  toastMuted: 'oklch(0.85 0.006 250)',
} as const satisfies Record<string, OklchColor>;

type ColorName = keyof typeof palette;

export const colors = Object.fromEntries(
  Object.entries(palette).map(([name, value]) => [name, oklchToRgba(value)]),
) as Record<ColorName, string>;

export const fonts = {
  regular: 'AtkinsonHyperlegibleNext_400Regular',
  medium: 'AtkinsonHyperlegibleNext_500Medium',
  semibold: 'AtkinsonHyperlegibleNext_600SemiBold',
  bold: 'AtkinsonHyperlegibleNext_700Bold',
  mono: 'AtkinsonHyperlegibleMono_400Regular',
  monoMedium: 'AtkinsonHyperlegibleMono_500Medium',
  monoBold: 'AtkinsonHyperlegibleMono_700Bold',
} as const;
