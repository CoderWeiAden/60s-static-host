class RenderService {
  render(template: string, data: Record<string, any>): string {
    return template.replace(/\{\{(.*?)\}\}/g, (_, key) => data[key.trim()] || '')
  }
}
