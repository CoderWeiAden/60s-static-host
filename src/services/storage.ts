import fs from 'node:fs/promises'
import fsSync from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import { PATHS } from '../constants'
import { log } from '../utils'

export class StorageService {
  private readonly projectRoot = getProjectRoot()
  private readonly static60sPath = path.resolve(this.projectRoot, PATHS.STATIC_60S)
  private readonly staticImagesPath = path.resolve(this.projectRoot, PATHS.STATIC_IMAGES)

  constructor() {
    ensureDirSync(this.static60sPath)
    ensureDirSync(this.staticImagesPath)
  }

  getDataFilePath(date: string): string {
    return path.resolve(this.static60sPath, `${date}.json`)
  }

  getImageFilePath(date: string): string {
    return path.resolve(this.staticImagesPath, `${date}.png`)
  }

  hasData(date: string): boolean {
    return fileExistsSync(this.getDataFilePath(date))
  }

  hasImage(date: string): boolean {
    return fileExistsSync(this.getImageFilePath(date))
  }

  async saveData(date: string, data: SavedData): Promise<void> {
    const filePath = this.getDataFilePath(date)
    await writeJsonFile(filePath, data)
    log(`Data of [${date}] saved`)
  }

  async saveImage(date: string, image: Buffer): Promise<void> {
    const filePath = this.getImageFilePath(date)

    const optimizedImage = await sharp(image)
      .png({ compressionLevel: 9, quality: 95, palette: true, effort: 10 })
      .toBuffer()

    const originalSize = (image.length / 1024 / 1024).toFixed(2)
    const optimizedSize = (optimizedImage.length / 1024 / 1024).toFixed(2)
    const saved = ((1 - optimizedImage.length / image.length) * 100).toFixed(1)

    await fs.writeFile(filePath, optimizedImage)
    log(`Image of [${date}] saved (${originalSize}MB → ${optimizedSize}MB, saved ${saved}%)`)
  }

  async loadData(date: string): Promise<SavedData | null> {
    const filePath = this.getDataFilePath(date)
    if (!(await fileExists(filePath))) {
      return null
    }
    return await readJsonFile<SavedData>(filePath)
  }
}

export const storage = new StorageService()

export function ensureDirSync(dirPath: string): void {
  if (!fsSync.existsSync(dirPath)) {
    fsSync.mkdirSync(dirPath, { recursive: true })
  }
}

export async function ensureDir(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath)
  } catch {
    await fs.mkdir(dirPath, { recursive: true })
  }
}

export function fileExistsSync(filePath: string): boolean {
  return fsSync.existsSync(filePath)
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

export async function readJsonFile<T>(filePath: string): Promise<T> {
  const content = await fs.readFile(filePath, 'utf-8')
  return JSON.parse(content)
}

export async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2))
}

export function getProjectRoot(): string {
  return new URL('../..', import.meta.url).pathname
}

export interface ParsedArticle {
  news: string[]
  tip: string
  cover: string
  audio: {
    music: string
    news: string
  }
}

export interface SavedData extends ParsedArticle {
  date: string
  image: string
  link: string
  created: string
  created_at: number
  updated: string
  updated_at: number
}
