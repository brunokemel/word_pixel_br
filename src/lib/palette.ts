export const COLOR_PALETTE = [
  "#ffffff", "#e4e4e4", "#888888", "#222222", "#ffa7d1", "#e50000", "#e59500", "#a06a42",
  "#e5d900", "#94e044", "#02be01", "#00d3dd", "#0083c7", "#0000ea", "#cf6ee4", "#820080",
  "#ffcae3", "#ff8a80", "#ffc857", "#fff59d", "#b9f6ca", "#69f0ae", "#84ffff", "#80d8ff",
  "#82b1ff", "#b388ff", "#ea80fc", "#ff80ab", "#795548", "#607d8b", "#17283a", "#0a111c",
] as const;

export const COLOR_GROUPS = [
  { id: "neutral", colorIds: [0, 1, 2, 3, 28, 29, 30, 31] },
  { id: "warm", colorIds: [4, 5, 6, 7, 16, 17, 18, 19] },
  { id: "nature", colorIds: [8, 9, 10, 11, 20, 21, 22, 23] },
  { id: "cool", colorIds: [12, 13, 14, 15, 24, 25, 26, 27] },
] as const;

export type ColorGroupId = (typeof COLOR_GROUPS)[number]["id"];

export function colorIdToHex(colorId: number): string {
  return COLOR_PALETTE[colorId] ?? COLOR_PALETTE[0];
}

export function hexToColorId(color: string): number {
  const index = COLOR_PALETTE.indexOf(color.toLowerCase() as (typeof COLOR_PALETTE)[number]);
  return index >= 0 ? index : 0;
}

export function colorGroupIdFor(color: string): ColorGroupId {
  const colorId = hexToColorId(color);
  return COLOR_GROUPS.find((group) => (group.colorIds as readonly number[]).includes(colorId))?.id ?? "neutral";
}
