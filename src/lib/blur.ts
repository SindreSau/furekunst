import type { ImageMetadata } from 'astro'
import { existsSync, readdirSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const blurCache = new Map<string, string>()

// Pre-index known asset directories for robust filename resolution across Astro dev and build
const ROOT_DIR = process.cwd()
const ASSET_DIRS = [
  path.join(ROOT_DIR, 'src', 'assets', 'artworks'),
  path.join(ROOT_DIR, 'src', 'assets', 'img'),
]

function getFilesRecursively(dir: string): string[] {
  if (!existsSync(dir)) return []
  const entries = readdirSync(dir, { withFileTypes: true })
  const files: string[] = []
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...getFilesRecursively(fullPath))
    } else {
      files.push(fullPath)
    }
  }
  return files
}

let cachedAssetFiles: string[] | null = null

function getAssetFiles(): string[] {
  if (cachedAssetFiles) return cachedAssetFiles
  const files: string[] = []
  for (const dir of ASSET_DIRS) {
    files.push(...getFilesRecursively(dir))
  }
  cachedAssetFiles = files
  return files
}

function findSourceFile(identifier: string): string | null {
  if (existsSync(identifier)) return identifier

  // Clean the identifier (remove queries, hashes, leading slashes)
  const cleanId = identifier.split('?')[0].split('#')[0]
  const baseName = path.basename(cleanId)

  const allFiles = getAssetFiles()

  // Exact filename match
  const exactMatch = allFiles.find(f => path.basename(f) === baseName)
  if (exactMatch) return exactMatch

  // Match by base name without hash / extension (e.g. 'ei-ku' from 'ei-ku.B2b87f.jpeg')
  const strippedName = baseName.split('.')[0]
  const matched = allFiles.find(f =>
    path.basename(f).startsWith(strippedName + '.'),
  )
  if (matched) return matched

  return null
}

export async function getBlurDataUrl(
  image: ImageMetadata | string | undefined | null,
): Promise<string | null> {
  if (!image) return null

  const cacheKey = typeof image === 'string' ? image : image.src
  if (blurCache.has(cacheKey)) {
    return blurCache.get(cacheKey)!
  }

  try {
    let filePath: string | null = null

    if (typeof image === 'object' && image !== null) {
      const meta = image as ImageMetadata & { fsPath?: string }
      if (meta.fsPath && existsSync(meta.fsPath)) {
        filePath = meta.fsPath
      } else if (meta.src) {
        filePath = findSourceFile(meta.src)
      }
    } else if (typeof image === 'string') {
      filePath = findSourceFile(image)
    }

    if (!filePath) {
      return null
    }

    const buffer = await sharp(filePath)
      .rotate()
      .resize(20, 20, { fit: 'inside' })
      .webp({ quality: 20 })
      .toBuffer()

    const dataUrl = `data:image/webp;base64,${buffer.toString('base64')}`
    blurCache.set(cacheKey, dataUrl)
    return dataUrl
  } catch (error) {
    console.warn(
      `[getBlurDataUrl] Failed to generate blur placeholder for ${cacheKey}:`,
      error,
    )
    return null
  }
}
