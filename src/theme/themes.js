export const themes = {
  cosmicDark: {
    id: "cosmicDark",
    name: "Cosmic Dark",
    mode: "dark",
    icon: "🌌",

    bg: "#070b14",
    bgSecondary: "#0f172a",
    bgTertiary: "#111827",
    card: "rgba(17, 24, 39, 0.78)",
    cardSolid: "#111827",
    navbar: "rgba(7, 11, 20, 0.75)",

    text: "#f8fafc",
    textSecondary: "#cbd5e1",
    muted: "#94a3b8",

    primary: "#8b5cf6",
    primaryHover: "#7c3aed",
    secondary: "#22d3ee",
    accent: "#38bdf8",

    border: "rgba(139, 92, 246, 0.22)",
    borderStrong: "rgba(34, 211, 238, 0.35)",

    shadow: "0 10px 30px rgba(34, 211, 238, 0.12)",
    shadowHover: "0 16px 40px rgba(139, 92, 246, 0.20)",
    glow: "0 0 20px rgba(139, 92, 246, 0.35)",

    success: "#22c55e",
    warning: "#f59e0b",
    danger: "#ef4444",
    info: "#38bdf8",

    buttonText: "#ffffff",
    cardText: "#f8fafc",

    overlay: "rgba(2, 6, 23, 0.7)",
    glass: "blur(16px)",
    radius: "20px"
  },

  midnightMinimal: {
    id: "midnightMinimal",
    name: "Midnight Minimal",
    mode: "dark",
    icon: "🌑",

    bg: "#0b1120",
    bgSecondary: "#111827",
    bgTertiary: "#1f2937",
    card: "rgba(31, 41, 55, 0.95)",
    cardSolid: "#1f2937",
    navbar: "rgba(11, 17, 32, 0.92)",

    text: "#e5e7eb",
    textSecondary: "#cbd5e1",
    muted: "#9ca3af",

    primary: "#6366f1",
    primaryHover: "#4f46e5",
    secondary: "#94a3b8",
    accent: "#818cf8",

    border: "rgba(255, 255, 255, 0.08)",
    borderStrong: "rgba(99, 102, 241, 0.22)",

    shadow: "0 8px 20px rgba(0, 0, 0, 0.25)",
    shadowHover: "0 12px 28px rgba(0, 0, 0, 0.35)",
    glow: "none",

    success: "#22c55e",
    warning: "#f59e0b",
    danger: "#ef4444",
    info: "#60a5fa",

    buttonText: "#ffffff",
    cardText: "#e5e7eb",

    overlay: "rgba(0, 0, 0, 0.55)",
    glass: "blur(0px)",
    radius: "18px"
  },

  cleanGlass: {
    id: "cleanGlass",
    name: "Clean Glass",
    mode: "light",
    icon: "💎",

    bg: "#f8fafc",
    bgSecondary: "#eef2ff",
    bgTertiary: "#e2e8f0",
    card: "rgba(255, 255, 255, 0.78)",
    cardSolid: "#ffffff",
    navbar: "rgba(255, 255, 255, 0.75)",

    text: "#0f172a",
    textSecondary: "#1e293b",
    muted: "#475569",

    primary: "#7c3aed",
    primaryHover: "#6d28d9",
    secondary: "#38bdf8",
    accent: "#6366f1",

    border: "rgba(124, 58, 237, 0.14)",
    borderStrong: "rgba(56, 189, 248, 0.20)",

    shadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
    shadowHover: "0 16px 36px rgba(124, 58, 237, 0.12)",
    glow: "0 0 16px rgba(124, 58, 237, 0.12)",

    success: "#16a34a",
    warning: "#d97706",
    danger: "#dc2626",
    info: "#0284c7",

    buttonText: "#ffffff",
    cardText: "#0f172a",

    overlay: "rgba(255, 255, 255, 0.6)",
    glass: "blur(14px)",
    radius: "20px"
  },

  softPremium: {
    id: "softPremium",
    name: "Soft Premium",
    mode: "light",
    icon: "☀️",

    bg: "#fffdf8",
    bgSecondary: "#f5f3ff",
    bgTertiary: "#ede9fe",
    card: "rgba(255, 255, 255, 0.86)",
    cardSolid: "#ffffff",
    navbar: "rgba(255, 253, 248, 0.85)",

    text: "#1e1b4b",
    textSecondary: "#312e81",
    muted: "#64748b",

    primary: "#6d28d9",
    primaryHover: "#5b21b6",
    secondary: "#0ea5e9",
    accent: "#8b5cf6",

    border: "rgba(109, 40, 217, 0.12)",
    borderStrong: "rgba(14, 165, 233, 0.18)",

    shadow: "0 12px 28px rgba(109, 40, 217, 0.08)",
    shadowHover: "0 18px 36px rgba(109, 40, 217, 0.14)",
    glow: "0 0 18px rgba(139, 92, 246, 0.10)",

    success: "#16a34a",
    warning: "#d97706",
    danger: "#dc2626",
    info: "#0284c7",

    buttonText: "#ffffff",
    cardText: "#1e1b4b",

    overlay: "rgba(255, 255, 255, 0.65)",
    glass: "blur(12px)",
    radius: "22px"
  }
};

export const defaultTheme = "cosmicDark";

export const themeOptions = Object.values(themes);