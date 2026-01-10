import fs from "fs";
import path from "path";

export function getRandomEventImage(slug: string): string {
  const imageDir = path.join(process.cwd(), "public", "events", slug);
  try {
    const files = fs.readdirSync(imageDir);
    const images = files.filter((file) => /\.(jpg|jpeg|png|webp)$/i.test(file));
    if (images.length === 0) return "";
    const randomIndex = Math.floor(Math.random() * images.length);
    return `/events/${slug}/${images[randomIndex]}`;
  } catch {
    return "";
  }
}
