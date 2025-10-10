import { fetchArticles } from '../services/wechat'
import { parseArticleUrl, parseArticleUrlViaLLM } from './parser'
import { debug, localeTime } from '../utils'
import { getWeChatConfig } from '../config'

import type { SavedData } from '../types'

export async function fetchAndProcessArticle(date: string): Promise<SavedData | null> {
  const [year, month, day] = date.split('-').map(Number)
  const queryDate = `${month}月${day}日`
  const queryWord = '读懂世界'
  const query = `${queryDate} ${queryWord}`

  debug('year month day', { year, month, day })
  debug('query', query)

  console.log(`Fetching data of [${date}], query: ${query}`)

  const wechatConfig = getWeChatConfig()
  const result = await fetchArticles({ ...wechatConfig, query })

  if (!result.isOK) {
    throw new Error(result.error)
  }

  const targetArticle = result.list.find(e => {
    const isTitleMatch = [queryDate, queryWord].every(word => e.title.includes(word))
    const articleDate = new Date(e.update_time * 1000)
    const isDateMatch = articleDate.getFullYear() === year && articleDate.getMonth() + 1 === month
    return isTitleMatch && isDateMatch
  })

  if (!targetArticle) {
    console.log(`Expected article not found, need ${queryDate} and ${queryWord}`)
    return null
  }

  const detailLink = targetArticle.link

  let parsedArticle = await parseArticleUrlViaLLM(detailLink)

  if (!parsedArticle.news.length) {
    console.log('LLM parser failed, fallback to standard parser...')

    parsedArticle = await parseArticleUrl(detailLink)
  }

  if (!parsedArticle.news.length) {
    console.log(`No news found in article: ${detailLink}`)
    return null
  }

  const data: SavedData = {
    date: date,
    ...parsedArticle,
    cover: parsedArticle.cover || targetArticle.cover,
    link: detailLink.split('&chksm=')[0] || '',
    created: localeTime(targetArticle.create_time * 1000),
    created_at: targetArticle.create_time * 1000,
    updated: localeTime(targetArticle.update_time * 1000),
    updated_at: targetArticle.update_time * 1000,
  }

  debug('final data', data)

  return data
}
