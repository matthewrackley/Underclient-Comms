export const theme = {
  color: {
    bg: "#0b0f14",
    bgGlow: "#121826",
    surface: "#141b24",
    surfaceAlt: "#0f151d",
    border: "#1f2a36",
    text: "#e7edf5",
    textMuted: "#93a4b7",
    textSubtle: "#6e7f93",
    accent: "#ff8a3d",
    accentSoft: "#ffb07a",
    danger: "#ff5a5f",
    success: "#30d158",
    focus: "#7bdff2",
    link: "#048eff"
  },
  radius: {
    sm: "10px",
    md: "16px",
    lg: "22px",
    pill: "999px"
  },
  space: {
    xs: "6px",
    sm: "10px",
    md: "16px",
    lg: "24px",
    xl: "32px",
    xxl: "44px"
  },
  shadow: {
    soft: "0 10px 30px rgba(0, 0, 0, 0.25)",
    sharp: "0 12px 0 rgba(8, 10, 14, 0.6)"
  },
  font: {
    display: "'Space Grotesk', 'Segoe UI', sans-serif",
    body: "'IBM Plex Serif', 'Georgia', serif"
  }
} as const;
