// Hex copies of the semantic tokens in src/styles/global.css.
// Mermaid's theming engine only accepts hex, not CSS variables or color-mix().

export type ThemeMode = "light" | "dark";

const palettes = {
  light: {
    bg: "#f7f8fb",
    surface: "#ffffff",
    surface2: "#eef0f6",
    ink: "#0f172a",
    muted: "#475569",
    brand: "#4338ca",
    onBrand: "#ffffff",
  },
  dark: {
    bg: "#0b0d12",
    surface: "#12151c",
    surface2: "#1a1f2c",
    ink: "#e6e8ee",
    muted: "#9aa3b5",
    brand: "#8b9cff",
    onBrand: "#0b0d12",
  },
} as const;

export const mermaidFontFamily =
  '"Geist", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif';

export const mermaidFontSize = "14px";

export function mermaidThemeVariables(mode: ThemeMode) {
  const { bg, surface, surface2, ink, muted, brand, onBrand } = palettes[mode];

  return {
    darkMode: mode === "dark",
    background: surface,
    fontFamily: mermaidFontFamily,
    fontSize: mermaidFontSize,
    primaryColor: surface2,
    primaryTextColor: ink,
    primaryBorderColor: muted,
    secondaryColor: muted,
    secondaryTextColor: bg,
    secondaryBorderColor: muted,
    tertiaryColor: surface,
    tertiaryTextColor: ink,
    tertiaryBorderColor: muted,
    lineColor: muted,
    textColor: ink,
    mainBkg: surface2,
    nodeBkg: surface2,
    arrowheadColor: muted,
    noteBkgColor: surface2,
    noteTextColor: ink,
    noteBorderColor: brand,
    nodeBorder: muted,
    clusterBkg: surface,
    clusterBorder: muted,
    defaultLinkColor: muted,
    titleColor: ink,
    edgeLabelBackground: surface,
    nodeTextColor: ink,
    actorBkg: surface2,
    actorBorder: muted,
    actorTextColor: ink,
    actorLineColor: muted,
    signalColor: ink,
    signalTextColor: ink,
    labelBoxBkgColor: surface2,
    labelBoxBorderColor: muted,
    labelTextColor: ink,
    loopTextColor: ink,
    activationBorderColor: muted,
    activationBkgColor: muted,
    sequenceNumberColor: bg,
    git0: brand,
    git1: muted,
    git2: ink,
    git3: brand,
    git4: muted,
    git5: ink,
    git6: brand,
    git7: muted,
    gitInv0: onBrand,
    gitInv1: bg,
    gitInv2: bg,
    gitInv3: onBrand,
    gitInv4: bg,
    gitInv5: bg,
    gitInv6: onBrand,
    gitInv7: bg,
    gitBranchLabel0: onBrand,
    gitBranchLabel1: bg,
    gitBranchLabel2: bg,
    gitBranchLabel3: onBrand,
    gitBranchLabel4: bg,
    gitBranchLabel5: bg,
    gitBranchLabel6: onBrand,
    gitBranchLabel7: bg,
    commitLabelColor: ink,
    commitLabelBackground: surface2,
    tagLabelColor: onBrand,
    tagLabelBackground: brand,
    tagLabelBorder: brand,
  };
}

export function mermaidClientConfig(mode: ThemeMode) {
  return {
    startOnLoad: false,
    theme: "base" as const,
    htmlLabels: true,
    fontFamily: mermaidFontFamily,
    themeVariables: mermaidThemeVariables(mode),
    gitGraph: {
      mainBranchName: "main",
      showCommitLabel: true,
      showBranches: true,
      rotateCommitLabel: true,
    },
  };
}
