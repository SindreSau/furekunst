import { fileURLToPath } from "node:url";
import path from "node:path";
import { statSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMG_DIR = path.join(__dirname, "..", "src", "assets", "img");

const targets = [
  { file: "lazy-dogs.jpg", maxWidth: 1754, quality: 70, maxBytes: 250 * 1024 },
  { file: "labrador.jpeg", maxWidth: 900, quality: 72, maxBytes: 120 * 1024 },
  { file: "sjimpanse.jpeg", maxWidth: 900, quality: 72, maxBytes: 120 * 1024 },
  { file: "hjort.jpeg", maxWidth: 900, quality: 72, maxBytes: 120 * 1024 },
  { file: "profilbilde.jpeg", maxWidth: 1000, quality: 75, maxBytes: 200 * 1024 },
];

let allOk = true;

for (const { file, maxWidth, quality, maxBytes } of targets) {
  const src = path.join(IMG_DIR, file);

  let meta;
  try {
    meta = await sharp(src).metadata();
  } catch (err) {
    console.warn(`[warn] skipping ${file}: ${err.message}`);
    allOk = false;
    continue;
  }
  const origSize = statSync(src).size;

  const resize = { width: maxWidth, withoutEnlargement: true };

  // `.rotate()` applies the source's EXIF orientation to the pixels so the
  // stored file matches how it should be displayed (the original lazy-dogs.jpg
  // is stored portrait with orientation 8; without this it displays vertical).
  const buf = await sharp(src)
    .rotate()
    .withMetadata()
    .resize(resize)
    .jpeg({ quality, mozjpeg: true })
    .toBuffer();

  let attempts = 1;
  let finalBuf = buf;
  while (finalBuf.length > maxBytes && quality - attempts * 5 >= 40) {
    finalBuf = await sharp(src)
      .rotate()
      .withMetadata()
      .resize(resize)
      .jpeg({ quality: quality - attempts * 5, mozjpeg: true })
      .toBuffer();
    attempts += 1;
  }

  writeFileSync(src, finalBuf);

  const outMeta = await sharp(src).metadata();
  console.log(
    `[ok] ${file}  ${(meta.width ?? 0)}x${meta.height ?? 0} -> ${outMeta.width}x${outMeta.height}, ` +
      `${(origSize / 1024).toFixed(0)} KB -> ${(finalBuf.length / 1024).toFixed(0)} KB ` +
      `(${((finalBuf.length / origSize) * 100).toFixed(0)}%) quality=${quality - (attempts - 1) * 5}`,
  );
}

if (!allOk) {
  console.warn("[warn] some images were skipped — check the warnings above");
}
