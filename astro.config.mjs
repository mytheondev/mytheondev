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
      themes: {
        light: "github-light-default",
        dark: "github-dark-default",
      },
      defaultColor: false,
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
        themeVariables: mermaidThemeVariables("dark"),
      },
    }),
    mdx(),
    sitemap({
      filter: (page) => !page.includes("/404"),
    }),
  ],
  fonts: [
    {
      provider: fontProviders.google(),
      name: "Geist",
      cssVariable: "--font-geist",
      weights: [400, 500, 600, 700],
      styles: ["normal"],
      fallbacks: ["sans-serif"],
    },
    {
      provider: fontProviders.google(),
      name: "Geist Mono",
      cssVariable: "--font-geist-mono",
      weights: [400, 500],
      styles: ["normal"],
      fallbacks: ["monospace"],
    },
    {
      provider: fontProviders.google(),
      name: "Bricolage Grotesque",
      cssVariable: "--font-bricolage",
      weights: [500, 600, 700],
      styles: ["normal"],
      fallbacks: ["sans-serif"],
    },
  ],
});
