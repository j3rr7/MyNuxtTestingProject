export function fmt(ts: number | string | null | undefined): string {
  if (!ts) return ''
  const d = new Date(ts)
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short', month: 'short', day: 'numeric',
    year: 'numeric', hour: 'numeric', minute: '2-digit'
  }).format(d)
}

export function fmtShort(
  iso: string,
  locale = 'en-US',
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }
): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const dtf = new Intl.DateTimeFormat(locale, options)
  return dtf.format(d)
}
