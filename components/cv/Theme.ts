export type ScoreTier = "green" | "amber" | "fail";

export function scoreTier(mark: number | null, validated: boolean): ScoreTier {
  if (!validated || mark === null) return "fail";
  if (mark >= 80) return "green";
  if (mark >= 50) return "amber";
  return "fail";
}

const TIER_COLORS: Record<ScoreTier, { color: string; bg: string; border: string }> = {
  green: { color: "#16a34a", bg: "rgba(34,197,94,0.10)",  border: "rgba(34,197,94,0.30)"  },
  amber: { color: "#ea580c", bg: "rgba(249,115,22,0.10)", border: "rgba(249,115,22,0.30)" },
  fail:  { color: "#dc2626", bg: "rgba(239,68,68,0.10)",  border: "rgba(239,68,68,0.30)"  },
};

const TIER_COLORS_DARK: Record<ScoreTier, { color: string; bg: string; border: string }> = {
  green: { color: "#22c55e", bg: "rgba(34,197,94,0.13)",  border: "rgba(34,197,94,0.28)"  },
  amber: { color: "#f97316", bg: "rgba(249,115,22,0.13)", border: "rgba(249,115,22,0.28)" },
  fail:  { color: "#ef4444", bg: "rgba(239,68,68,0.13)",  border: "rgba(239,68,68,0.28)"  },
};

export type ThemeTokens = {
  bg: string;
  cardBg: string;
  cardBorder: string;
  cardShadow: string;
  text: string;
  textSub: string;
  textMuted: string;
  hrColor: string;
  accent: string;
  tierColors: Record<ScoreTier, { color: string; bg: string; border: string }>;
};

export function tokens(dark: boolean): ThemeTokens {
  return dark
    ? {
        bg: "#0d1117",
        cardBg: "#161b22",
        cardBorder: "#30363d",
        cardShadow: "0 1px 3px rgba(0,0,0,0.4)",
        text: "#e6edf3",
        textSub: "#8b949e",
        textMuted: "#484f58",
        hrColor: "#21262d",
        accent: "#c9d1d9",
        tierColors: TIER_COLORS_DARK,
      }
    : {
        bg: "#f6f8fa",
        cardBg: "#ffffff",
        cardBorder: "#d0d7de",
        cardShadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
        text: "#1f2328",
        textSub: "#656d76",
        textMuted: "#9198a1",
        hrColor: "#d8dee4",
        accent: "#2c3e50",
        tierColors: TIER_COLORS,
      };
}

export function levelDisplay(level: number) {
  return { integer: Math.floor(level), pct: Math.round((level % 1) * 100) };
}
