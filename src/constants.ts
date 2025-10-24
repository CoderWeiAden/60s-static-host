export const WECHAT_ACCOUNTS = [
  { name: '每天100秒读懂世界', fakeId: 'Mzg3NTQ0MjQwNg==', wechatId: 'TT100s-News' },
  { name: '每天60秒读懂世界', fakeId: 'MzkwNDc5NTA0Mw==', wechatId: 'mt36501' },
  { name: '每天3分钟读懂世界', fakeId: 'MzkwNjY1ODIxNw==', wechatId: 'hao36501' },
]

export const DEFAULT_WECHAT_FAKE_ID = WECHAT_ACCOUNTS[0]?.fakeId ?? ''
export const WECHAT_TOKEN = process.env.WECHAT_TOKEN ?? ''
export const WECHAT_COOKIE = process.env.WECHAT_COOKIE ?? ''
export const USER_AGENT = 'Mozilla/5.0 AppleWebKit/537.36 Chrome/132.0.0.0 Safari/537.36'
export const PATHS = { STATIC_60S: 'static/60s', STATIC_IMAGES: 'static/images' }

export const REGEX_PATTERNS = {
  AD: /[;；]?(公众号)?\s*:?\s*[^；]+?\s*100\s*秒((读懂世界)|(知天下))\s*[;；]?/,
  TIP: /^【([今每]日)?(微语|金句)】/,
  NEWS: /^\d+、/,
  END: /[；！～。，]\s*$/,
  DATE_FORMAT: /^\d{4}-\d{2}-\d{2}$/,
}
