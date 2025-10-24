import fs from 'node:fs'
import path from 'node:path'
import { PATHS } from '../constants'

export class StorageService {
  private readonly projectRoot = getProjectRoot()
  private readonly static60sPath = path.resolve(this.projectRoot, PATHS.STATIC_60S)
  private readonly staticImagesPath = path.resolve(this.projectRoot, PATHS.STATIC_IMAGES)

  constructor() {
    ensureDir(this.static60sPath)
    ensureDir(this.staticImagesPath)
  }

  getDataFilePath(date: string): string {
    return path.resolve(this.static60sPath, `${date}.json`)
  }

  getImageFilePath(date: string): string {
    return path.resolve(this.staticImagesPath, `${date}.png`)
  }

  hasData(date: string): boolean {
    return fileExists(this.getDataFilePath(date))
  }

  hasImage(date: string): boolean {
    return fileExists(this.getImageFilePath(date))
  }

  saveData(date: string, data: SavedData): void {
    const filePath = this.getDataFilePath(date)
    writeJsonFile(filePath, data)
    console.log(`Data of [${date}] saved`)
  }

  loadData(date: string): SavedData | null {
    const filePath = this.getDataFilePath(date)
    if (!fileExists(filePath)) {
      return null
    }
    return readJsonFile<SavedData>(filePath)
  }
}

export const storage = new StorageService()

export function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath)
}

export function readJsonFile<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

export function writeJsonFile<T>(filePath: string, data: T): void {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
}

export function getProjectRoot(): string {
  return new URL('..', import.meta.url).pathname
}

export interface ParsedArticle {
  news: string[]
  image: string
  tip: string
  cover: string
  audio: {
    music: string
    news: string
  }
}

export interface SavedData extends ParsedArticle {
  date: string
  link: string
  created: string
  created_at: number
  updated: string
  updated_at: number
}
