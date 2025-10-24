import fs from 'node:fs'

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
  return new URL('../..', import.meta.url).pathname
}

export function debug(name: any, value: any): void {
  console.log(`[${new Date().toISOString()}] [DEBUG] [${name}] => `, value, `\n`)
}

export function localeDate(ts: number | string | Date = Date.now()) {
  const today = ts instanceof Date ? ts : new Date(ts)

  const formatter = new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Shanghai',
  })

  return formatter.format(today).replace(/\//g, '-')
}

export function localeTime(ts: number | string | Date = Date.now()) {
  const now = ts instanceof Date ? ts : new Date(ts)

  const formatter = new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hourCycle: 'h23',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Asia/Shanghai',
  })

  return formatter.format(now)
}

export function isValidDateFormat(dateString: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateString)
}

export function getInputArgValue(argName: string): string | undefined {
  return process.argv
    .find(arg => arg.startsWith(`--${argName}`))
    ?.split('=')[1]
    ?.trim()
}
