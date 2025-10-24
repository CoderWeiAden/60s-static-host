import { wechat } from '../services/wechat'
import { WECHAT_ACCOUNTS } from '../constants'
import { storage, type SavedData } from '../services/storage'
import { parsePost as parsePostViaLLM } from '../services/parser/llm-parser'
import { parsePost as parsePostViaParser } from '../services/parser/parser'
import { debug, getInputArgValue, isValidDateFormat, localeDate, localeTime } from '../utils'

export async function runUpdateCommand(): Promise<void> {
  const inputDate = getInputArgValue('date')

  debug('inputDate', inputDate || '[EMPTY DATE]')

  if (inputDate && !isValidDateFormat(inputDate)) {
    console.error('Invalid date format, expect: YYYY-MM-DD')
    process.exit(1)
  }

  const date = inputDate || localeDate()

  debug('date', date)

  if (storage.hasData(date)) {
    console.log(`Data of [${date}] already exists, skipped`)
    process.exit(0)
  }

  const [year, month, day] = date.split('-').map(Number)
  const queryDate = `${month}月${day}日`
  const queryWord = '读懂世界'
  const query = `${queryDate} ${queryWord}`

  debug('year-month-day', { year, month, day })

  debug('query', query)

  for (const account of WECHAT_ACCOUNTS) {
    debug('fetch-account', account.name)

    const result = await wechat.fetchPosts({ fakeId: account.fakeId, query })

    if (!result.isOK) {
      console.warn(`Failed to fetch posts for account: ${account.name}, error: ${result.error}`)
      continue
    }

    if (result.posts.length === 0) {
      console.warn(`No posts found for account: ${account.name}`)
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

    debug('targetArticle.link', targetArticle.link)

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
      cover: parsed.cover || targetArticle.cover,
      link: targetArticle.link.split('&chksm=')[0] || '',
      created: localeTime(targetArticle.create_time * 1000),
      created_at: targetArticle.create_time * 1000,
      updated: localeTime(targetArticle.update_time * 1000),
      updated_at: targetArticle.update_time * 1000,
    }

    debug('data', data)

    storage.saveData(date, data)
  }
}
