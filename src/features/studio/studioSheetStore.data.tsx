import { type ReactNode } from 'react'

export const SPECS = ['Voice + piano', 'Key · D minor', 'PT lyrics', '4 pages', 'PDF · A4']

export const SPLIT: { c: string; nm: ReactNode; v: string }[] = [
  { c: 'var(--jade-light)', nm: <>Teresa Rocha · <em>transcriber</em></>, v: '€0.55' },
  { c: 'var(--accent)', nm: <>Mariana Sol · <em>composer</em></>, v: '€0.35' },
  { c: 'rgba(247,243,238,.3)', nm: 'The co-op · hosting & infra', v: '€0.10' },
]

export const ALSO: { pre: string; em: string; who: string; tag: string; tint: 'plum' | 'jade' | 'coral' }[] = [
  { pre: 'A ', em: 'Beja', who: 'Mariana Sol · piano', tag: '€1', tint: 'plum' },
  { pre: 'Cantiga para a ', em: 'vizinha', who: 'Coro de Outubro · SATB', tag: '€1', tint: 'jade' },
  { pre: 'The first ', em: 'Sunday', who: 'Helena P. · lead sheet', tag: 'Free read', tint: 'coral' },
  { pre: 'Salt water, ', em: 'slowly', who: 'Akin Diallo · guitar tab', tag: '€1', tint: 'plum' },
]
