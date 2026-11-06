const HEX = /^#[0-9a-f]{6}$/i;

export const DEFAULT_ACCENT = "#C8F25C";

export const normalizeAccent = (value?: string) =>
  value && HEX.test(value) ? value : DEFAULT_ACCENT;

// WCAG relative luminance
const luminance = (hex: string) => {
  const channels = [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255);
  const [r, g, b] = channels.map((value) =>
    value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4),
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/**
 * Text colour to place on top of the accent. Any accent picked in the admin
 * stays readable: ink on light accents, white on dark ones.
 */
export const contrastTextFor = (hex: string) => {
  const lum = luminance(normalizeAccent(hex));
  const onInk = (lum + 0.05) / (luminance("#0a0b0d") + 0.05);
  const onWhite = (1.05) / (lum + 0.05);
  return onInk >= onWhite ? "#0a0b0d" : "#ffffff";
};
