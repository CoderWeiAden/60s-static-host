import fs from 'node:fs'
import path from 'node:path'
import { PATHS } from '../src/constants'

const CDN_BASE_URL = 'https://cdn.jsdmirror.com/gh/vikiboss/60s-static-host@main/static/images'

interface NewsData {
  date: string
  news: string[]
  cover?: string
  tip?: string
  audio?: {
    music?: string
    news?: string
  }
  image?: string
  link?: string
  created?: string
  created_at?: number
  updated?: string
  updated_at?: number
}

async function updateImageUrls(): Promise<void> {
  const projectRoot = new URL('..', import.meta.url).pathname.replace(/\/$/, '')
  const static60sPath = path.resolve(projectRoot, PATHS.STATIC_60S)

  // 获取所有 JSON 文件
  const jsonFiles = fs
    .readdirSync(static60sPath)
    .filter(file => file.endsWith('.json'))
    .sort()

  console.log(`Found ${jsonFiles.length} JSON files`)

  let updatedCount = 0
  let skippedCount = 0
  let errorCount = 0

  // 遍历每个 JSON 文件
  for (const file of jsonFiles) {
    const filePath = path.resolve(static60sPath, file)
    const date = file.replace('.json', '')

    try {
      // 读取 JSON 文件
      const content = fs.readFileSync(filePath, 'utf-8')
      const data: NewsData = JSON.parse(content)

      // 期望的图片 URL
      const expectedImageUrl = `${CDN_BASE_URL}/${date}.png`

      // 检查是否需要更新
      if (data.image === expectedImageUrl) {
        skippedCount++
        continue
      }

      // 更新 image 字段
      data.image = expectedImageUrl

      // 写回文件
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8')
      console.log(`✓ Updated ${file}`)
      updatedCount++
    } catch (error) {
      console.error(`✗ Failed to update ${file}:`, error)
      errorCount++
    }
  }

  console.log('=== Update Summary ===')
  console.log(`Total: ${jsonFiles.length}`)
  console.log(`Updated: ${updatedCount}`)
  console.log(`Skipped: ${skippedCount}`)
  console.log(`Failed: ${errorCount}`)
}

updateImageUrls().catch(error => {
  console.error('Error updating image URLs:', error)
  process.exit(1)
})
