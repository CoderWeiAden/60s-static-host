import { wechat } from './services/wechat'
import { renderer } from './services/renderer'
import { NewsCard } from './components/news'
import { WECHAT_ACCOUNTS } from './constants'
import { storage, type SavedData } from './services/storage'
import { parsePostViaLLM as parsePostViaLLM } from './services/parser'
import { parsePostViaLLM as parsePostViaParser } from './services/parser'
import {
  debug,
  formatSavedData,
  getInputArgValue,
  isValidDateFormat,
  localeDate,
  localeTime,
  log,
} from './utils'

update60s().catch(error => {
  console.error('Error updating 60s:', error)
  process.exit(1)
})

export async function update60s(): Promise<void> {
  const inputDate = getInputArgValue('date')

  debug('inputDate', inputDate || '[EMPTY DATE]')

  if (inputDate && !isValidDateFormat(inputDate)) {
    console.error('Invalid date format, expect: YYYY-MM-DD')
    process.exit(1)
  }

  const date = inputDate || localeDate()

  debug('date', date)

  if (storage.hasData(date) && storage.hasImage(date)) {
    log(`Data & Image of [${date}] already exists, skipped`)
    process.exit(0)
  }

  if (storage.hasData(date)) {
    const data = await storage.loadData(date)

    if (!data) {
      console.warn(`No data found for date: ${date}`)
      process.exit(1)
    }

    log(`Data of [${date}] found, generating image...`)

    await saveImage(data)

    process.exit(0)
  }

  const [year, month, day] = date.split('-').map(Number)
  const queryDate = `${month}月${day}日`

  debug('year-month-day', { year, month, day })

  for (const account of WECHAT_ACCOUNTS) {
    await new Promise(resolve => setTimeout(resolve, 5000 * Math.random()))

    const queryWord = account.query || '读懂世界'
    const query = `${queryDate} ${queryWord}`

    debug('fetch-account', account.name)
    debug('account-query', query)

    const result = await wechat.fetchPosts({ fakeId: account.fakeId, query })

    if (!result.isOK) {
      console.warn(`Failed to fetch posts for account: ${account.name}, error: ${result.error}`)
      continue
    }

    if (result.posts.length === 0) {
      console.warn(`No posts found for account: ${account.name}, wechatId: ${account.wechatId}`)
      continue
    }

    debug('result.posts', result.posts)
    debug('result.posts.length', result.posts.length)

    const targetArticle = result.posts.find(e => {
      const isTitleMatch = [queryDate, queryWord].every(word => e.title.includes(word))
      const uptime = new Date(e.update_time * 1000)
      const isDateMatch = uptime.getFullYear() === year && uptime.getMonth() + 1 === month
      return isTitleMatch && isDateMatch
    })

    if (!targetArticle) {
      console.warn(`Expected article not found for account: ${account.name}`)
      continue
    }

    debug('targetArticle', targetArticle)

    const parsed = await parsePostViaLLM(targetArticle.link).catch(async error => {
      console.warn(`LLM parser failed, fallback to standard parser...`, error)

      try {
        return await parsePostViaParser(targetArticle.link)
      } catch (error) {
        console.warn(`Standard parser failed, error: ${error}`)
        return null
      }
    })

    if (!parsed) {
      console.warn(`Post parsing failed for account: ${account.name}, link: ${targetArticle.link}`)
      process.exit(1)
    }

    if (!parsed.news.length) {
      console.warn(`No news found for account: ${account.name}, link: ${targetArticle.link}`)
      process.exit(1)
    }

    debug('parsed', parsed)

    const data: SavedData = {
      date: date,
      ...parsed,
      image: `https://cdn.jsdmirror.com/gh/vikiboss/60s-static-host@main/static/images/${date}.png`,
      cover: parsed.cover || targetArticle.cover,
      link: targetArticle.link?.split('&chksm=')[0] || '',
      created: localeTime(targetArticle.create_time * 1000),
      created_at: targetArticle.create_time * 1000,
      updated: localeTime(targetArticle.update_time * 1000),
      updated_at: targetArticle.update_time * 1000,
    }

    debug('data', data)

    await storage.saveData(data)
    await saveImage(data)

    log('Update 60s completed')

    break
  }
}

async function saveImage(data: SavedData): Promise<void> {
  await renderer.prepare()
  const buffer = await renderer.render(<NewsCard data={formatSavedData(data)} />)
  await renderer.destroy()
  await storage.saveImage(data.date, buffer)
}
