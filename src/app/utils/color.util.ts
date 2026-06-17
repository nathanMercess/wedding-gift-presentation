export abstract class ColorUtil {
  private static readonly HEX_PATTERN = /^#?([0-9a-f]{6}|[0-9a-f]{3})$/i;

  public static parseHex(hex: string): { r: number; g: number; b: number } | null {
    const value = hex?.trim();

    if (!value || !this.HEX_PATTERN.test(value))
      return null;

    let normalized = value.replace('#', '');

    if (normalized.length === 3)
      normalized = normalized.split('').map((c: string): string => c + c).join('');

    return {
      r: parseInt(normalized.slice(0, 2), 16),
      g: parseInt(normalized.slice(2, 4), 16),
      b: parseInt(normalized.slice(4, 6), 16),
    };
  }

  public static toHex(r: number, g: number, b: number): string {
    const channel = (value: number): string =>
      Math.round(Math.max(0, Math.min(255, value))).toString(16).padStart(2, '0');

    return `#${channel(r)}${channel(g)}${channel(b)}`;
  }

  public static lighten(hex: string, amount: number): string {
    const rgb = this.parseHex(hex);

    if (!rgb)
      return hex;

    const ratio = Math.max(0, Math.min(1, amount));

    return this.toHex(
      rgb.r + (255 - rgb.r) * ratio,
      rgb.g + (255 - rgb.g) * ratio,
      rgb.b + (255 - rgb.b) * ratio,
    );
  }

  public static darken(hex: string, amount: number): string {
    const rgb = this.parseHex(hex);

    if (!rgb)
      return hex;

    const ratio = Math.max(0, Math.min(1, amount));

    return this.toHex(
      rgb.r * (1 - ratio),
      rgb.g * (1 - ratio),
      rgb.b * (1 - ratio),
    );
  }
}
