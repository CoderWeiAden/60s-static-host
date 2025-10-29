import { SolarDay } from 'tyme4ts'
import { localeTime } from '../utils'

interface NewsData {
  date: string
  news: string[]
  tip: string
  created_at: number
}

const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六']

function getDayOfWeek(date?: string) {
  const day = date ? new Date(date) : new Date()
  return `星期${WEEK_DAYS[day.getDay()]}`
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return { month: date.getMonth() + 1, day: date.getDate(), year: date.getFullYear() }
}

export function NewsCard({ data }: { data: NewsData }) {
  const { month, day, year } = formatDate(data.date)
  const lunarDate = SolarDay.fromYmd(year, month, day).getLunarDay().toString().replace('农历', '')

  return (
    <div className='max-w-3xl mx-auto bg-gradient-to-br from-stone-50/95 via-amber-50/90 to-stone-100/95 relative overflow-hidden'>
      <div className='absolute inset-0 opacity-[0.02]'>
        <div className='absolute top-12 left-8 w-2 h-2 bg-amber-400 rounded-full'></div>
        <div className='absolute top-20 right-12 w-1 h-1 bg-stone-400 rounded-full'></div>
        <div className='absolute bottom-20 left-12 w-1.5 h-1.5 bg-amber-300 rounded-full'></div>
      </div>

      <div className='absolute top-0 left-1/2 transform -translate-x-1/2 flex items-center space-x-2'>
        <div className='w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400/60 to-transparent rounded-full'></div>
        <div className='w-1.5 h-1.5 bg-amber-400/50 rounded-full'></div>
        <div className='w-16 h-0.5 bg-gradient-to-l from-transparent via-amber-400/60 to-transparent rounded-full'></div>
      </div>

      <div className='bg-gradient-to-r from-stone-50/80 via-amber-50/60 to-stone-50/80 px-8 py-8 border-b border-stone-200/60'>
        <div className='text-center space-y-3 relative'>
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
            <span>{getDayOfWeek(data.date)}</span>
            <span className='mx-4 text-amber-400/60'>❋</span>
            <span className='tracking-wider'>农历{lunarDate}</span>
          </div>
        </div>
      </div>

      <div className='px-8 py-5 bg-gradient-to-b from-white/80 to-stone-50/60 relative'>
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

      <div className='relative bg-amber-50/50 border-t border-stone-300/50 px-8 py-6'>
        <div className='text-center relative'>
          <div className='relative inline-block'>
            <p className='text-stone-700 leading-relaxed text-center px-6 italic relative z-10'>
              <span className='font-bold text-amber-600/36 mx-2'>「</span>
              {data.tip}
              <span className='font-bold text-amber-600/36 mx-2'>」</span>
            </p>
            <div className='absolute inset-0 bg-amber-50/30 rounded-lg transform rotate-0.5 scale-105 -z-10'></div>
          </div>
        </div>
      </div>

      <div className='bg-gradient-to-r from-stone-100/70 via-amber-50/40 to-stone-100/70 border-t border-stone-200/50 px-8 py-5 rounded-b-3xl'>
        <div className='flex items-center justify-between text-xs relative'>
          <div className='absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-px bg-gradient-to-r from-transparent via-amber-300/30 to-transparent'></div>

          <div className='text-stone-500 space-y-1.5 font-light'>
            <div className='tracking-wide'>更新时间：{localeTime(data.created_at)}</div>
            <div className='tracking-wider'>共 {data.news.length} 条精选新闻</div>
          </div>

          <div className='text-stone-500 text-right space-y-1.5 font-light'>
            <div className='tracking-wide'>@GitHub vikiboss/60s</div>
            <div className='text-[10px] tracking-widest'>
              React 界面 + TailwindCSS 样式 + Puppeteer 渲染
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
