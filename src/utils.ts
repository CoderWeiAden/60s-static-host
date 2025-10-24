export function debug(name: string, ...values: unknown[]): void {
  console.log(
    `[${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}] [DEBUG] [${name}] => `,
    ...values,
    `\n`
  )
}

export function log(...values: unknown[]): void {
  console.log(
    `[${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}] [LOG]`,
    ...values,
    `\n`
  )
}

export function getInputArgValue(argName: string): string | undefined {
  return process.argv
    .find(arg => arg.startsWith(`--${argName}`))
    ?.split('=')[1]
    ?.trim()
}

export function localeDate(ts: number | string | Date = Date.now()) {
  const today = ts instanceof Date ? ts : new Date(ts)

  const formatter = new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Shanghai',
  })

  return formatter.format(today).replace(/\//g, '-')
}

export function localeTime(ts: number | string | Date = Date.now()) {
  const now = ts instanceof Date ? ts : new Date(ts)

  const formatter = new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hourCycle: 'h23',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Asia/Shanghai',
  })

  return formatter.format(now)
}

export function isValidDateFormat(dateString: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateString)
}
