export function fmt(ts: number | string | null | undefined): string {
  if (!ts) return ''
  const d = new Date(ts)
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short', month: 'short', day: 'numeric',
    year: 'numeric', hour: 'numeric', minute: '2-digit'
  }).format(d)
}