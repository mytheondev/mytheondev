// Hex copies of @theme tokens in src/styles/global.css.
// Mermaid's theming engine only accepts hex, not CSS variables or color-mix().

const surface = "#0b0d10";
const surface2 = "#16181a";
const ink = "#ebebeb";
const muted = "#adaeb0";
const brand = "#e0ed34";

export const mermaidFontFamily =
  '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace';

export const mermaidFontSize = "14px";

export const mermaidThemeVariables = {
  darkMode: true,
  background: surface,
  fontFamily: mermaidFontFamily,
  fontSize: mermaidFontSize,
  primaryColor: surface2,
  primaryTextColor: ink,
  primaryBorderColor: muted,
  secondaryColor: muted,
  secondaryTextColor: surface,
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
  sequenceNumberColor: surface,
  git0: brand,
  git1: muted,
  git2: ink,
  git3: brand,
  git4: muted,
  git5: ink,
  git6: brand,
  git7: muted,
  gitInv0: surface,
  gitInv1: surface,
  gitInv2: surface,
  gitInv3: surface,
  gitInv4: surface,
  gitInv5: surface,
  gitInv6: surface,
  gitInv7: surface,
  gitBranchLabel0: surface,
  gitBranchLabel1: surface,
  gitBranchLabel2: surface,
  gitBranchLabel3: surface,
  gitBranchLabel4: surface,
  gitBranchLabel5: surface,
  gitBranchLabel6: surface,
  gitBranchLabel7: surface,
  commitLabelColor: ink,
  commitLabelBackground: surface2,
  tagLabelColor: surface,
  tagLabelBackground: brand,
  tagLabelBorder: brand,
};

export const mermaidClientConfig = {
  startOnLoad: false,
  theme: "base" as const,
  htmlLabels: true,
  fontFamily: mermaidFontFamily,
  themeVariables: mermaidThemeVariables,
  gitGraph: {
    mainBranchName: "main",
    showCommitLabel: true,
    showBranches: true,
    rotateCommitLabel: true,
  },
};
