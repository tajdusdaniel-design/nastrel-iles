import { readdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const publicDir = path.resolve('public');

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  let count = 0;

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      count += await walk(fullPath);
      continue;
    }

    if (!/\.(jpe?g|png)$/i.test(entry.name)) continue;

    const webpPath = fullPath.replace(/\.(jpe?g|png)$/i, '.webp');
    try {
      await sharp(fullPath).webp({ quality: 82 }).toFile(webpPath);
      count += 1;
      console.log(`✓ ${path.relative(publicDir, webpPath)}`);
    } catch (error) {
      console.warn(`⚠ skipped ${path.relative(publicDir, fullPath)}: ${error.message}`);
    }
  }

  return count;
}

const converted = await walk(publicDir);
console.log(`\nConverted ${converted} image(s) to WebP.`);
