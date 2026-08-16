// @ts-check

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import mermaid from "astro-mermaid";
import { defineConfig, fontProviders } from "astro/config";
import { mermaidFontFamily, mermaidThemeVariables } from "./src/lib/mermaid-theme";

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  site: "https://www.mytheon.dev",
  markdown: {
    shikiConfig: {
      theme: "github-dark-default",
      wrap: false,
    },
  },
  integrations: [
    mermaid({
      theme: "base",
      autoTheme: false,
      mermaidConfig: {
        htmlLabels: true,
        fontFamily: mermaidFontFamily,
        themeVariables: mermaidThemeVariables,
      },
    }),
    mdx(),
    sitemap(),
  ],
  fonts: [
    {
      provider: fontProviders.google(),
      name: "JetBrains Mono",
      cssVariable: "--font-jetbrains-mono",
      weights: [400, 500, 600, 700, 800],
      styles: ["normal"],
      fallbacks: ["monospace"],
    },
  ],
});
