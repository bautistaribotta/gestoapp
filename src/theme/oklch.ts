export type OklchColor = `oklch(${string})`;

const OKLCH_PATTERN =
  /^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)(?:deg)?\s*(?:\/\s*([\d.]+)(%?)\s*)?\)$/;

function toGammaChannel(linear: number) {
  const value = linear <= 0.0031308 ? 12.92 * linear : 1.055 * Math.pow(linear, 1 / 2.4) - 0.055;
  return Math.round(Math.min(Math.max(value, 0), 1) * 255);
}

/**
 * React Native no interpreta oklch(), así que los colores se declaran en oklch
 * y se convierten a rgba() una sola vez al cargar el tema.
 */
export function oklchToRgba(color: OklchColor): string {
  const match = OKLCH_PATTERN.exec(color);
  if (!match) {
    throw new Error(`Color oklch inválido: ${color}`);
  }

  const [, l, lPercent, c, h, alpha, alphaPercent] = match;
  const lightness = Number(l) / (lPercent ? 100 : 1);
  const chroma = Number(c);
  const hue = (Number(h) * Math.PI) / 180;
  const opacity = alpha === undefined ? 1 : Number(alpha) / (alphaPercent ? 100 : 1);

  const a = chroma * Math.cos(hue);
  const b = chroma * Math.sin(hue);

  const lCone = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const mCone = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const sCone = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;

  const red = 4.0767416621 * lCone - 3.3077115913 * mCone + 0.2309699292 * sCone;
  const green = -1.2684380046 * lCone + 2.6097574011 * mCone - 0.3413193965 * sCone;
  const blue = -0.0041960863 * lCone - 0.7034186147 * mCone + 1.707614701 * sCone;

  return `rgba(${toGammaChannel(red)}, ${toGammaChannel(green)}, ${toGammaChannel(blue)}, ${opacity})`;
}
