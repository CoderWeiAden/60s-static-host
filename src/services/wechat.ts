import { debug } from '../utils'
import { USER_AGENT } from '../config'

import type { FetchOptions, FetchResponse } from '../types'

export async function fetchArticles(options: FetchOptions): Promise<FetchResponse> {
  const { fakeid, token, cookie, query = '' } = options

  debug('options', options)

  const url = new URL('https://mp.weixin.qq.com/cgi-bin/appmsg')

  Object.entries({
    action: 'list_ex',
    fakeid,
    query,
    begin: options?.begin ?? 0,
    count: options?.count ?? 4,
    type: 9,
    need_author_name: 1,
    token,
    lang: 'zh_CN',
    f: 'json',
    ajax: 1,
  }).forEach(([key, value]) => {
    url.searchParams.append(key, value.toString())
  })

  debug('url', url.toString())

  return fetch(url, {
    headers: {
      Cookie: cookie,
      'X-Requested-With': 'XMLHttpRequest',
      Referer: `https://mp.weixin.qq.com/cgi-bin/appmsg?t=media%2Fappmsg_edit_v2&action=edit&isNew=1&type=10&token=${token}&lang=zh_CN&timestamp=${Date.now()}`,
      'User-Agent': USER_AGENT,
    },
  })
    .then(e => {
      if (e.status !== 200) {
        e.text().then(text => {
          throw new Error(`fetch failed, status: ${e.status}, result: ${text}`)
        })
      } else {
        return e.json()
      }
    })
    .then(e => {
      debug('data', e)
      debug('app_msg_cnt', e?.app_msg_cnt)
      debug('app_msg_list', e?.app_msg_list)
      debug('title list', e?.app_msg_list?.map((e: any) => e.title)?.join(', '))

      return {
        isOK: e?.base_resp?.ret === 0,
        list: e?.app_msg_list || [],
        count: e?.app_msg_cnt || 0,
        error: e?.base_resp?.ret === 0 ? null : e?.base_resp?.err_msg,
      }
    })
    .catch(err => {
      console.error(err)

      return {
        isOK: false,
        list: [],
        count: 0,
        error: err,
      }
    })
}
