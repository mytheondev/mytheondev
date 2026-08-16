import type { ImageMetadata } from "astro";
import defaultOgImage from "../assets/og-image.png";

const postImages = import.meta.glob<{ default: ImageMetadata }>("../assets/*.png", {
  eager: true,
});

export { defaultOgImage };

export function ogImageForSlug(slug: string): ImageMetadata {
  if (!slug || slug === "og-image") return defaultOgImage;
  const match = postImages[`../assets/${slug}.png`];
  return match?.default ?? defaultOgImage;
}
