import { Suspense } from 'react'
import { IS_IN_CI } from '../constants'
import puppeteer, { Browser } from 'puppeteer-core'
import { renderToReadableStream } from 'react-dom/server'
import { log } from '../utils'

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
    return `
    <head>
      <meta charset="UTF-8" />
      <link rel="stylesheet" href="https://unpkg.com/@unocss/reset@66.5.4/tailwind.css"></link>
      <script src="https://unpkg.com/@unocss/runtime@66.5.4/uno.global.js"></script>
    </head>
    <body style="height: 100vh; width: 100vw;">
      <div id="main" style="display: inline-flex;">${html}</div>
    </body>`
  }
}

export const renderer = new RenderService()
