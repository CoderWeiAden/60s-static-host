import fs from 'node:fs/promises'
import path from 'node:path'
import { log } from '../utils'
import { Suspense } from 'react'
import { IS_IN_CI } from '../constants'
import puppeteer, { Browser } from 'puppeteer-core'
import { renderToReadableStream } from 'react-dom/server'

class RenderService {
  #browser: Browser | null = null

  async prepare(): Promise<void> {
    log('Prepare renderer...')

    const executablePath = IS_IN_CI
      ? './.chromium/chrome-linux/chrome'
      : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

    this.#browser = await puppeteer.launch({
      headless: 'shell',
      executablePath,
      args: [
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--no-zygote',
        '--no-sandbox',
        '--hide-scrollbars',
        '--font-render-hinting=medium',
        // 明确指定使用简体中文字体
        '--lang=zh-CN',
      ],
    })
  }

  async destroy(): Promise<void> {
    log('Destroy renderer...')
    await this.#browser?.close()
    log('Renderer destroyed')
  }

  async render(children: React.ReactElement): Promise<Buffer> {
    const domString = await this.renderReactToString(children)
    const html = await this.wrapHtmlAndUnocss(domString)
    return await this.screenshot(html)
  }

  async screenshot(html: string): Promise<Buffer> {
    if (!this.#browser) {
      throw new Error('Browser not initialized')
    }

    log('Create browser context...')
    const context = await this.#browser.createBrowserContext()

    log('Create new page...')
    const page = await context.newPage()

    log('Set viewport...')
    await page.setViewport({ deviceScaleFactor: 1.6, height: 1200, width: 2000 })

    log('Set html content...')
    await page.setContent(html)

    log('Wait for main selector...')
    await page.waitForSelector('#main')

    log('Get main selector...')
    const el = (await page.$('#main'))!

    log('Screenshot...')
    const screenshot = await el.screenshot({
      type: 'png',
      encoding: 'binary',
      optimizeForSpeed: false,
    })

    log('Close browser context...')
    await context.close()

    return Buffer.from(screenshot)
  }

  async renderReactToString(children: React.ReactElement): Promise<string> {
    log('Render React to string...')
    const element = <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
    const stream = await renderToReadableStream(element)
    await stream.allReady
    return new Response(stream).text()
  }

  async wrapHtmlAndUnocss(html: string): Promise<string> {
    const __dirname = new URL('.', import.meta.url).pathname
    const template = await fs.readFile(path.join(__dirname, 'template.html'), 'utf-8')
    return template.replace('__HTML__', html)
  }
}

export const renderer = new RenderService()
