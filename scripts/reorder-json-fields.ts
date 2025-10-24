import fs from 'node:fs'
import path from 'node:path'
import { PATHS } from '../src/constants'

interface NewsData {
  date: string
  news: string[]
  cover?: string
  tip?: string
  image?: string
  link?: string
  audio?: {
    music?: string
    news?: string
  }
  created?: string
  created_at?: number
  updated?: string
  updated_at?: number
}

// 定义字段顺序
const FIELD_ORDER = [
  'date',
  'news',
  'cover',
  'tip',
  'image',
  'link',
  'audio',
  'created',
  'created_at',
  'updated',
  'updated_at',
]

function reorderFields(data: NewsData): NewsData {
  const ordered: any = {}

  // 按照指定顺序添加字段
  for (const field of FIELD_ORDER) {
    if (field in data) {
      ordered[field] = data[field as keyof NewsData]
    }
  }

  // 添加任何未在 FIELD_ORDER 中列出的字段
  for (const key in data) {
    if (!FIELD_ORDER.includes(key)) {
      ordered[key] = data[key as keyof NewsData]
    }
  }

  return ordered
}

async function reorderJsonFields(): Promise<void> {
  const projectRoot = new URL('..', import.meta.url).pathname.replace(/\/$/, '')
  const static60sPath = path.resolve(projectRoot, PATHS.STATIC_60S)

  // 获取所有 JSON 文件
  const jsonFiles = fs
    .readdirSync(static60sPath)
    .filter(file => file.endsWith('.json'))
    .sort()

  console.log(`Found ${jsonFiles.length} JSON files`)

  let updatedCount = 0
  let errorCount = 0

  // 遍历每个 JSON 文件
  for (const file of jsonFiles) {
    const filePath = path.resolve(static60sPath, file)

    try {
      // 读取 JSON 文件
      const content = fs.readFileSync(filePath, 'utf-8')
      const data: NewsData = JSON.parse(content)

      // 重新排序字段
      const reordered = reorderFields(data)

      // 写回文件
      fs.writeFileSync(filePath, JSON.stringify(reordered, null, 2) + '\n', 'utf-8')
      console.log(`✓ Reordered ${file}`)
      updatedCount++
    } catch (error) {
      console.error(`✗ Failed to reorder ${file}:`, error)
      errorCount++
    }
  }

  console.log('\n=== Reorder Summary ===')
  console.log(`Total: ${jsonFiles.length}`)
  console.log(`Updated: ${updatedCount}`)
  console.log(`Failed: ${errorCount}`)
}

reorderJsonFields().catch(error => {
  console.error('Error reordering JSON fields:', error)
  process.exit(1)
})
