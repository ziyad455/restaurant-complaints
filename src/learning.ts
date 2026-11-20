export function wordCount(value: string): number {
  return value.trim().match(/\S+/g)?.length ?? 0
}

export function normalizedAnswer(value: string): string {
  return value.trim().toLowerCase().replace(/[.!?]+$/, '').trim()
}
