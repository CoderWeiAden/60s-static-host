import { use } from 'react'

interface NewsData {
  date: string
  news: string[]
  tip: string
  api_updated: string
  day_of_week: string
  lunar_date: string
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return { month: date.getMonth() + 1, day: date.getDate(), year: date.getFullYear() }
}

const fetchData = async () => await (await fetch('https://60s.viki.moe/v2/60s')).json()

export function NewsCard() {
  const { data } = use(fetchData()) as { data: NewsData }

  const { month, day, year } = formatDate(data.date)

  return (
    <div className='max-w-3xl mx-auto bg-gradient-to-br from-stone-50/95 via-amber-50/90 to-stone-100/95 relative shadow-2xl rounded-3xl border border-stone-300/50 overflow-hidden'>
      {/* 背景装饰纹理 */}
      <div className='absolute inset-0 opacity-[0.02]'>
        <div className='absolute top-12 left-8 w-2 h-2 bg-amber-400 rounded-full'></div>
        <div className='absolute top-20 right-12 w-1 h-1 bg-stone-400 rounded-full'></div>
        <div className='absolute bottom-20 left-12 w-1.5 h-1.5 bg-amber-300 rounded-full'></div>
      </div>

      {/* 顶部装饰元素 */}
      <div className='absolute top-0 left-1/2 transform -translate-x-1/2 flex items-center space-x-2'>
        <div className='w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400/60 to-transparent rounded-full'></div>
        <div className='w-1.5 h-1.5 bg-amber-400/50 rounded-full'></div>
        <div className='w-16 h-0.5 bg-gradient-to-l from-transparent via-amber-400/60 to-transparent rounded-full'></div>
      </div>

      {/* 标题区域 */}
      <div className='bg-gradient-to-r from-stone-50/80 via-amber-50/60 to-stone-50/80 px-8 py-8 border-b border-stone-200/60'>
        <div className='text-center space-y-3 relative'>
          {/* 标题装饰花纹 */}
          <div className='absolute -top-2 left-1/2 transform -translate-x-1/2 flex space-x-1'>
            <div className='w-0.5 h-0.5 bg-amber-400/40 rounded-full'></div>
            <div className='w-1 h-0.5 bg-amber-300/40 rounded-full'></div>
            <div className='w-0.5 h-0.5 bg-amber-400/40 rounded-full'></div>
          </div>

          <h1 className='text-3xl font-extralight text-stone-800 tracking-[0.3em] leading-tight'>
            每天 <span className='font-normal text-amber-700 tracking-normal'>60s</span> 读懂世界
          </h1>
          <div className='text-base text-stone-600 tracking-[0.15em] space-x-1 font-light'>
            <span>
              {year}年{month}月{day}日
            </span>
            <span className='mx-4 text-amber-400/60'>❋</span>
            <span>{data.day_of_week}</span>
            <span className='mx-4 text-amber-400/60'>❋</span>
            <span className='tracking-wider'>农历{data.lunar_date}</span>
          </div>
        </div>
      </div>

      {/* 新闻内容区域 */}
      <div className='px-8 py-5 bg-gradient-to-b from-white/80 to-stone-50/60 relative'>
        {/* 内容区装饰 */}
        <div className='absolute top-4 right-6 w-8 h-px bg-gradient-to-r from-amber-200/30 to-transparent'></div>

        <div className='space-y-0'>
          {data.news.map((item, index) => (
            <div key={index} className='group relative'>
              <div className='flex items-start space-x-4 py-2 relative'>
                <div className='flex-shrink-0 w-4 h-4 rounded-full bg-stone-100/90 flex items-center justify-center text-[9px] text-stone-400 border border-stone-200/60 mt-1 shadow-sm'>
                  {String(index + 1)}
                </div>
                <div className='flex-1'>
                  <p className='text-stone-800 text-base leading-6 tracking-wide break-words'>
                    {item}
                  </p>
                </div>
              </div>
              {index < data.news.length - 1 && (
                <div className='flex items-center justify-center my-1'>
                  <div className='w-6 h-px bg-stone-200/40'></div>
                  <div className='mx-2 w-0.5 h-0.5 bg-amber-300/40 rounded-full'></div>
                  <div className='w-6 h-px bg-stone-200/40'></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 每日一言区域 - 简约便笺风格 */}
      <div className='relative bg-amber-50/50 border-t border-stone-300/50 px-8 py-6'>
        {/* 便笺效果 */}
        <div className='absolute top-0 right-6 w-3 h-3 bg-amber-200/40 transform rotate-45 translate-y-1'></div>
        <div className='absolute top-2 right-8 w-1 h-1 bg-amber-300/60 rounded-full'></div>

        <div className='text-center relative'>
          <div className='relative inline-block'>
            <p className='text-stone-700 leading-relaxed text-center px-6 italic relative z-10'>
              「 {data.tip} 」
            </p>
            {/* 便笺纸质感 */}
            <div className='absolute inset-0 bg-amber-50/30 rounded-lg transform rotate-0.5 scale-105 -z-0'></div>
          </div>
        </div>
      </div>

      {/* 底部信息区域 */}
      <div className='bg-gradient-to-r from-stone-100/70 via-amber-50/40 to-stone-100/70 border-t border-stone-200/50 px-8 py-5 rounded-b-3xl'>
        <div className='flex items-center justify-between text-xs relative'>
          {/* 底部装饰线 */}
          <div className='absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-px bg-gradient-to-r from-transparent via-amber-300/30 to-transparent'></div>

          <div className='text-stone-500 space-y-1.5 font-light'>
            <div className='tracking-wide'>更新时间：{data.api_updated}</div>
            <div className='text-stone-400 tracking-wider'>共 {data.news.length} 条精选新闻</div>
          </div>

          <div className='text-right text-stone-400 space-y-1.5 font-light'>
            <div className='tracking-wide'>基于 KiviBot 3.0</div>
            <div className='text-[10px] tracking-widest opacity-75'>
              React 界面 + TailwindCSS 样式 + Puppeteer 渲染
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
