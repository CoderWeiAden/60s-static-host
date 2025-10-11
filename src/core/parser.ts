import pangu from 'pangu'
import { load } from 'cheerio'
import { debug } from '../utils'
import { REGEX_PATTERNS, USER_AGENT } from '../config'

import type { ParsedArticle } from '../types'

const EMPTY_RESULT = { news: [], cover: '', image: '', tip: '', audio: { music: '', news: '' } }

export async function parseArticleUrl(url: string): Promise<ParsedArticle> {
  debug('url', url)

  const html = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
    .then(e => e.text())
    .catch(() => fetch(url).then(e => e.text()))

  const $ = load(html)
  const news: string[] = []

  let tip = ''

  const data = $('div.rich_media_content section p, section')
    .toArray()
    .map(e => $(e).text())
    .filter(e => e.length >= 6)
    .filter(text => !/；\d+、/.test(text))
    .map(e => pangu.spacingText(e.trim()))

  debug('data', data)

  for (const line of data) {
    if (REGEX_PATTERNS.NEWS.test(line)) {
      news.push(
        line
          .replace(REGEX_PATTERNS.NEWS, '')
          .replace(REGEX_PATTERNS.END, '')
          .replace(REGEX_PATTERNS.AD, '')
      )
    } else if (REGEX_PATTERNS.TIP.test(line)) {
      tip = line
        .replace(REGEX_PATTERNS.TIP, '')
        .replace(REGEX_PATTERNS.END, ''.replace(REGEX_PATTERNS.AD, ''))
    }
  }

  const images = $('img')
    .map((_, e) => $(e).attr('data-src') || '')
    .toArray()
    .filter(e => !!e)

  debug('images', images)

  const image = images.at(-1) || images.at(0) || ''

  // const image = images.at(-3) || images.at(0) || ''

  // const cover =
  //   $('img')
  //     .map((_, e) => ({
  //       src: $(e).attr('data-src') || '',
  //       dataS: $(e).attr('data-s') || '',
  //     }))
  //     .toArray()
  //     .filter(e => e.dataS === '300,640')
  //     .at(0)?.src || ''

  const cover = images.at(0) || ''

  debug('news', news)
  debug('tip', tip)
  debug('image', image)
  debug('cover', cover)

  return {
    news,
    image,
    tip,
    cover,
    audio: { music: '', news: '' },
  }
}

const prompt = `
# 你是一个 HTML 结构解析工具，能够熟练、完美的完成 HTML 内容解析和文本优化目标。接下来你需要解析一个微信公众号文章的 HTML，并按照要求通过指定的格式返回指定的内容。

## 返回 JSON 字段说明

- news: 新闻列表，string[] 类型，大概 15 条，以具实际况决定，是 html 里正文的主要内容。
- cover: 新闻封面图片 URL，string 类型，在 “今日简报” 标题下面方、农历等信息的上面的长方形封面图片，如果不存在则返回空字符串。
- image: 图片版本新闻的 URL，string 类型，在 “简报图片版” 类似标题下方的图片，如果不存在则返回空字符串。
- tip: 每日一句，string 类型，可能是【微语】、【每日一句】、【每日金句】 等 prefix 文本的后面，通常是文章的最后一段。

## 针对每一项新闻文本的要求

- 移除每条新闻的前缀序号和标点或其他标记和末尾的标点符号。
- 移除可能出现在新闻后面的广告，如“；公众号：每天100秒看世界”类似格式。
- 所有文本的内容排版符合“盘古之白”，在中日韩字符和英文字母、罗马数字等必要位置添加空格，以提升可读性。
- 百分号与数字、摄氏度和数字等场景中间无需空格，如 “8%”、“12℃”。

你完全遵循原始 HTML 文本内容，不会添加、构造任何不存在的新闻和 URL 链接。 以下是示例解析结果的格式和 URL 格式，仅供参考。请以实际 HTML 为准。

## 示例格式

请不要返回示例数据或基于这个数据进行生成。请遵循原文进行解析。

{
  "news": [
      "中央气象台：25 日至 29 日寒潮来袭，我国大部地区降温剧烈，大部地区气温下降 8～12℃，局地最高降幅超 20℃",
      "民政部：截至 2024 年底，我国 60 岁及以上老年人口达到 3.1 亿，占总人口 22%",
      "海南 10 岁小孩哥出海钓鱼从陵水漂流一夜到三亚，邻居：捕鱼遇风浪被漂走，系疍家人水性好，家长：回家怕挨打又躲起来了",
      "加拿大、德国、英国、芬兰、丹麦等国提醒本国赴美公民：小心被捕",
      "当地 23 日，以方确认哈马斯政治局高层夫妇被以军炸死！以色列连续三周禁止援助物资进入加沙，联合国官员发文警告：援助物资的分发大幅减少，面粉仅够 6 天分发",
      // ... 更多新闻
  ],
  "image": "https://mmbiz.qpic.cn/sz_mmbiz_png/O3P1rGdfJibIX7H04XgRWzlvibEHuj3rBS3OOjTjygibMpuekbndnWCWiccJ4vsrjak8wJv3VpVicwiaUXFInnyB0s9w/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1",
  "cover": "https://mmbiz.qpic.cn/sz_mmbiz_png/O3P1rGdfJibIX7H04XgRWzlvibEHuj3rBSEoIElyBGOumg51zy9okALUEia96Ezqc66jccSzgNnUPBNHvnXKSowqg/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1",
  "tip": "人生中有些事，不竭尽全力，你永远无法知晓自己的出色"
}
`

const generationConfig = {
  responseMimeType: 'application/json',
  responseSchema: {
    type: 'object',
    properties: {
      news: { type: 'array', items: { type: 'string' } },
      cover: { type: 'string' },
      image: { type: 'string' },
      tip: { type: 'string' },
    },
    propertyOrdering: ['news', 'cover', 'image', 'tip'],
    required: ['news', 'cover', 'image', 'tip'],
  },
}

export async function parseArticleUrlViaLLM(url: string): Promise<ParsedArticle> {
  debug('url', url)

  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    console.error("No Gemini API key provided, can't use LLM to parse article.")
    return EMPTY_RESULT
  }

  const html = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
    .then(e => e.text())
    .catch(() => fetch(url).then(e => e.text()))

  const $ = load(html)

  const model = 'gemini-2.5-flash'
  const mainHtml = $('#page-content').html() || ''

  if (!mainHtml) {
    console.error('No main HTML content found in the article.')
    return EMPTY_RESULT
  }

  debug('model', model)

  debug('main html length', mainHtml.length)

  const timeStart = performance.now()

  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: prompt }] },
      contents: [{ role: 'user', parts: [{ text: mainHtml }] }],
      generationConfig,
    }),
  }

  const thirdApi = `https://google-ai.deno.dev/v1beta/models/${model}:generateContent?key=${apiKey}`
  const officialApi = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

  const response = await (
    await fetch(thirdApi, options)
  )
    .json()
    .catch(async error => {
      console.warn('First Gemini API request failed, retrying official domain...', error)
      return await (await fetch(officialApi, options)).json()
    })
    .catch(error => {
      console.error('Both Gemini API requests failed:', error)
      return null
    })

  if (!response) {
    console.error('No response from Gemini API.')
    return EMPTY_RESULT
  }

  debug('LLM request cost (ms)', Math.round((performance.now() - timeStart) * 1000) / 1000)

  // console.log('Gemini response:', JSON.stringify(response, null, 2))
  try {
    const data = JSON.parse(response?.candidates?.[0]?.content?.parts?.[0]?.text || '{}')

    debug('LLM data', data)

    if (!('news' in data) || !('cover' in data) || !('image' in data) || !('tip' in data)) {
      console.error('Invalid Gemini response format:', data)

      return EMPTY_RESULT
    }

    return {
      news: data.news || [],
      cover: data.cover || '',
      image: data.image || '',
      tip: data.tip || '',
      audio: { music: '', news: '' },
    }
  } catch {
    console.error('Failed to parse Gemini response:', response?.candidates?.[0]?.content?.parts)

    return EMPTY_RESULT
  }
}

// parseArticleUrl(
//   'http://mp.weixin.qq.com/s?__biz=Mzk3NTMzOTU1Mg==&mid=2247486384&idx=2&sn=b737ac572f301ce208a4f7ca051c22e9&chksm=c4cc62fff3bbebe90448d7f9d0da47a34c081abc9dd6b88f766e9925ded39ec2fe8958a5b401#rd'
// )
//   .then(console.log)
//   .catch(console.error)
