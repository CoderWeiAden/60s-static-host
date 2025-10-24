import { Suspense } from 'react'
import { IS_IN_CI } from '../constants'
import puppeteer, { Browser } from 'puppeteer-core'
import { renderToReadableStream } from 'react-dom/server'

class RenderService {
  #browser: Browser | null = null

  async prepare(): Promise<void> {
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
    await this.#browser?.close()
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

    const context = await this.#browser.createBrowserContext()
    const page = await context.newPage()

    await page.setViewport({
      deviceScaleFactor: 2,
      height: 1200,
      width: 2400,
    })

    await page.setContent(html)
    await page.waitForSelector('#main')

    const el = (await page.$('#main'))!

    return Buffer.from(await el.screenshot({ type: 'png', encoding: 'binary' }))
  }

  async renderReactToString(children: React.ReactElement): Promise<string> {
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
