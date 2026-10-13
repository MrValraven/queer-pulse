// pulse-progress: a QueerPulse take on johnnyvizz's savvy-progress (MIT, see NOTICE).
//
// Cosmetic only. The mod watches subagents start, step and finish, and draws them.
// It registers no tool the model can call, never rewrites a prompt or a tool call,
// reads no settings, environment, files or network. Its one command, /pulse, is
// typed by a person.
import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { AgentRun, View } from '../types'

const agents = atom({ plugin: 'pulse-progress', key: 'agents' } as const, [])
const view = atom({ plugin: 'pulse-progress', key: 'view' } as const, {
  isCompact: false,
  isDoneCollapsed: false,
  isBandHidden: false,
  didAutoOpen: false,
})
const now = atom({ plugin: 'pulse-progress', key: 'now' } as const, 0)

const PANE = 'pulse-agents'
const PANE_TITLE = 'Pulse · agents'
const MAX_RUNS = 200

// QueerPulse tokens (src/styles/tokens/colors.css), copied as hex: a mod cannot read CSS variables.
const CORAL = '#e8775a'
const ROSE = '#b0628f'
const JADE = '#4a8c6f'
const JADE_SOFT = '#7cd7ad'
// Lilac is the one non-token colour: peach (--accent-soft) was unreadable as text on cream.
const LILAC = '#8a72cf'
const MUTED = '#9a8fa8'
const FONT = "'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"
const SERIF = "Fraunces,Georgia,serif"

// ---------------------------------------------------------------------------
// Roles: what a subagent type looks like. Unknown types are pride crabs.

type Role = 'engineer' | 'reviewer' | 'explore' | 'plan' | 'pride'

const roleOf = (type: string): Role => {
  const bare = type.replace(/^[^:]*:/, '').toLowerCase()
  if (bare === 'explore') return 'explore'
  if (bare === 'plan') return 'plan'
  if (/reviewer$/.test(bare)) return 'reviewer'
  if (/(engineer|animator)$/.test(bare)) return 'engineer'
  return 'pride'
}

const ROLE_COLOR: Record<Role, string> = {
  engineer: CORAL,
  reviewer: ROSE,
  explore: JADE,
  plan: LILAC,
  pride: MUTED,
}

// ---------------------------------------------------------------------------
// Numbers.

// USD per million tokens: input, output, cache read, cache write (1-hour rate).
// List prices as savvy-progress had them on 2026-10-10; the first match wins.
type Price = [input: number, output: number, cacheRead: number, cacheWrite: number]
const PRICES: [RegExp, Price][] = [
  [/(fable|mythos)-5-1/, [10, 50, 0.25, 20]],
  [/fable|mythos/, [10, 50, 1, 20]],
  [/opus-5-5/, [4, 20, 0.2, 8]],
  [/opus/, [5, 25, 0.5, 10]],
  [/sonnet-5-5/, [2, 10, 0.1, 4]],
  [/sonnet-5/, [2, 10, 0.2, 4]],
  [/sonnet/, [3, 15, 0.3, 6]],
  [/haiku-5-5/, [0.1, 0.5, 0.01, 0.2]],
  [/haiku/, [1, 5, 0.1, 2]],
]

type Usage = {
  input_tokens: number
  output_tokens: number
  cache_read_input_tokens: number
  cache_creation_input_tokens: number
}

const sumTokens = (u: Usage): number =>
  (u.input_tokens || 0) + (u.output_tokens || 0) + (u.cache_read_input_tokens || 0) + (u.cache_creation_input_tokens || 0)

const costOf = (model: string, u: Usage): number => {
  const [i, o, r, w] = PRICES.find(([re]) => re.test(model.toLowerCase()))?.[1] ?? [4, 20, 0.2, 8]
  return (
    ((u.input_tokens || 0) * i +
      (u.output_tokens || 0) * o +
      (u.cache_read_input_tokens || 0) * r +
      (u.cache_creation_input_tokens || 0) * w) /
    1e6
  )
}

const windowOf = (model: string): number => (/haiku-4|claude-3/i.test(model) ? 200_000 : 1_000_000)

const modelName = (id: string): string => {
  const m = /(fable|mythos|opus|sonnet|haiku)-(\d+)(?:-(\d{1,2})(?!\d))?/i.exec(id)
  const [, family = '', major = '', minor] = m ?? []
  if (!family) return id.replace(/^claude-/, '').replace(/\[.*\]$/, '') || '—'
  return `${family.charAt(0).toUpperCase()}${family.slice(1).toLowerCase()} ${major}${minor ? '.' + minor : ''}`
}

const runModel = (a: AgentRun): string => (a.effort ? `${modelName(a.model)} · ${a.effort}` : modelName(a.model))

const fmtTokens = (n: number): string =>
  n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${Math.round(n / 1e3)}k` : `${Math.round(n)}`
const fmtCost = (usd: number): string => `$${usd < 10 ? usd.toFixed(2) : usd.toFixed(1)}`
const fmtTime = (ms: number): string => {
  const s = Math.max(0, Math.round(ms / 1000))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const ss = String(s % 60).padStart(2, '0')
  return h ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`
}

const elapsed = (a: AgentRun, at: number): number => (a.endedAt ?? Math.max(at, a.startedAt)) - a.startedAt
const ctxOf = (a: AgentRun): number => (a.contextMax ? Math.min(100, Math.round((a.contextTokens / a.contextMax) * 100)) : 0)

const totals = (list: AgentRun[], at: number) => {
  const start = Math.min(...list.map(a => a.startedAt))
  const end = Math.max(...list.map(a => a.endedAt ?? Math.max(at, a.startedAt)))
  return {
    cost: list.reduce((s, a) => s + a.costUsd, 0),
    tokens: list.reduce((s, a) => s + a.tokens, 0),
    time: list.length ? end - start : 0,
  }
}

// The band's progress: finished runs out of all runs since the last dismiss.
const progress = (list: AgentRun[]) => {
  const done = list.filter(a => a.status !== 'running').length
  return { done, total: list.length, ratio: list.length ? done / list.length : 0, isFinished: list.length > 0 && done === list.length }
}

// ---------------------------------------------------------------------------
// Text in SVG.

const xml = (s: string): string =>
  s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] ?? c)

const WIDE = /[ᄀ-ᅟ⺀-〾ぁ-㏿㐀-䶿一-鿿가-힣豈-﫿！-｠\u{1F300}-\u{1FAFF}]/u
const charEm = (ch: string): number =>
  WIDE.test(ch) ? 1 : /[\s.,:;'|!il1()[\]]/.test(ch) ? 0.3 : /[A-Zmw@%]/.test(ch) ? 0.72 : 0.56
const textWidth = (s: string, size: number): number => [...s].reduce((w, ch) => w + charEm(ch) * size, 0)

const fitText = (s: string, size: number, maxW: number): string => {
  if (textWidth(s, size) <= maxW) return s
  let out = ''
  for (const ch of s) {
    if (textWidth(out + ch + '…', size) > maxW) break
    out += ch
  }
  return out + '…'
}

// ---------------------------------------------------------------------------
// Colour: the bar runs coral → rose → jade along its length, so it warms into jade as work lands.

const hex = (c: string): number[] => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16))
const mix = (a: string, b: string, t: number): string =>
  '#' + hex(a).map((v, i) => Math.round(v + ((hex(b)[i] ?? 0) - v) * t).toString(16).padStart(2, '0')).join('')
const pulseAt = (t: number): string => (t < 0.5 ? mix(CORAL, ROSE, t * 2) : mix(ROSE, JADE, (t - 0.5) * 2))

const noise = (x: number, y: number): number => {
  const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
  return s - Math.floor(s)
}

// ---------------------------------------------------------------------------
// Pixel crabs (sprites from savvy-progress, after DockCrab's Clawd), one costume per role.

const CLAY = '#D97757'
const INK = '#1F1E1D'
const CRAB_BOX = 30

type Fill = (x: number, y: number, w: number, h: number, c: string, cls?: string) => void

const stamp = (f: Fill, x: number, y: number, rows: string[], map: Record<string, string>, cls?: string): void =>
  rows.forEach((row, dy) => [...row].forEach((ch, dx) => map[ch] && f(x + dx, y + dy, 1, 1, map[ch] ?? '', cls)))

const crabBody = (f: Fill, armFront = 0, armCls?: string): void => {
  f(7, 10, 16, 12, CLAY)
  f(3, 14, 4, 4, CLAY)
  f(23, 14 + armFront, 4, 4, CLAY, armCls)
  f(9, 12, 2, 2, INK)
  f(19, 12, 2, 2, INK)
  f(7, 22, 2, 4, CLAY, 'la')
  f(17, 22, 2, 4, CLAY, 'la')
  f(11, 22, 2, 4, CLAY, 'lb')
  f(21, 22, 2, 4, CLAY, 'lb')
}

const PRIDE = ['#E40303', '#FF8C00', '#FFED00', '#008026', '#24408E', '#732982']

const COSTUMES: Record<Role, (f: Fill, t: string) => void> = {
  // Pride: holds a six-stripe flag that waves while the crab works.
  pride: f => {
    crabBody(f, -4)
    f(25, 1, 1, 13, '#8E929A')
    PRIDE.forEach((c, i) => f(26, 1 + i, 4, 1, c, 'flag'))
  },
  // Engineer: hard hat; the wrench turns a bolt.
  engineer: (f, t) => {
    crabBody(f)
    stamp(f, 6, 4, ['.....yyyyyyyy.....', '...yyyyyhhyyyyy...', '..yyyyyyhhyyyyyy..', '..yyyyyyhhyyyyyy..', '.yyyyyyyhhyyyyyyy.', 'dddddddddddddddddd'], { y: '#F5C542', h: '#FBE08A', d: '#C99A1E' })
    f(13, 5, 4, 2, t)
    stamp(f, 0, 10, ['.s.s', 'sss.', '.s..', '.s..'], { s: '#8E929A' }, 'it')
  },
  // Reviewer: deerstalker; the magnifier sweeps and glints.
  reviewer: (f, t) => {
    crabBody(f, -4, 'it')
    stamp(f, 6, 3, ['......bbbbbb......', '....bbcbbcbbbb....', '...bbbbbbbbbbbb...', '..bcbbcbbcbbcbbb..', '.bbbbbbbbbbbbbbbb.', 'dddddddddddddddddd'], { b: '#7A4A26', c: '#A0703F', d: '#5A3519' })
    f(6, 9, 18, 1, t)
    stamp(f, 23, 1, ['.kkk.', 'k...k', 'k...k', 'k...k', '.kkk.'], { k: '#3A3A3C' }, 'it')
    f(24, 2, 3, 3, 'rgba(169,214,245,.7)', 'it'); f(25, 6, 1, 4, '#7A4A26', 'it'); f(24, 2, 1, 1, '#fff', 'gl')
  },
  // Explore: pirate scout; the cutlass fences.
  explore: (f, t) => {
    crabBody(f)
    stamp(f, 5, 3, ['.kk..............kk.', '.kkk....kkkk....kkk.', '..kkkkkkkwwkkkkkkk..', '..kkkkkkkkkkkkkkkk..', '.gggggggggggggggggg.'], { k: '#55514C', w: '#F8F6F1', g: t })
    f(7, 11, 11, 1, INK); f(18, 11, 4, 3, INK)
    f(27, 6, 1, 9, '#C9CCD2', 'it'); f(26, 15, 3, 1, '#7A4A26', 'it')
  },
  // Plan: astronaut in a glass dome; floats, and the antenna and the star blink.
  plan: (f, t) => {
    crabBody(f)
    f(6, 7, 18, 1, '#E6E8EE'); f(5, 8, 1, 14, '#E6E8EE'); f(24, 8, 1, 14, '#E6E8EE'); f(6, 22, 18, 1, '#C9CCD2')
    f(6, 8, 18, 14, 'rgba(169,214,245,.32)'); f(8, 9, 2, 1, '#fff'); f(8, 10, 1, 2, '#fff')
    f(14, 4, 2, 3, '#C9CCD2'); f(14, 2, 2, 2, t, 'ant'); f(13, 18, 4, 2, t)
    f(27, 3, 1, 3, '#F5C542', 'star'); f(26, 4, 3, 1, '#F5C542', 'star')
  },
}

// Pure CSS, run by the compositor. Every working crab walks; each costume moves its prop.
const CRAB_CSS = `<style>
.run .la{animation:st .5s steps(1) infinite}.run .lb{animation:st .5s steps(1) infinite -.25s}
.run .bd{animation:bob .5s steps(1) infinite -.125s}
.run g{transform-box:fill-box}
@keyframes st{50%{transform:translateY(-1px)}}@keyframes bob{50%{transform:translateY(1px)}}
@keyframes blink{50%{opacity:.15}}
.c-pride.run .flag{transform-origin:0 50%;animation:wave .5s steps(1) infinite}
.c-pride.run .flag:nth-child(even){animation-delay:-.25s}
@keyframes wave{50%{transform:skewY(-10deg) scaleX(.85)}}
.c-engineer.run .it{transform-origin:100% 100%;animation:twist .5s ease-in-out infinite}
@keyframes twist{50%{transform:rotate(-35deg)}}
.c-reviewer.run .it{animation:scan 1s steps(1) infinite}
.c-reviewer.run .gl{animation:blink 1s steps(1) infinite -.5s}
@keyframes scan{25%{transform:translate(-1px,1px)}50%{transform:translate(-2px,2px)}75%{transform:translate(-1px,1px)}}
.c-explore.run .it{transform-origin:50% 100%;animation:fence .5s ease-in-out infinite}
@keyframes fence{50%{transform:rotate(25deg)}}
.c-plan.run{animation:float 1s ease-in-out infinite}
.c-plan.run .la,.c-plan.run .lb,.c-plan.run .bd{animation:none}
.c-plan.run .ant{animation:blink 1s steps(1) infinite}
.c-plan.run .star{animation:blink .5s steps(1) infinite -.25s}
@keyframes float{50%{transform:translateY(-2px)}}
@media (prefers-reduced-motion: reduce){.run,.run g{animation:none!important}}
</style>`

const crab = (x: number, y: number, role: Role, isWalking = false, scale = 1.1): string => {
  const groups = new Map<string, string[]>([['bd', []]])
  const f: Fill = (cx, cy, w, h, c, cls = 'bd') => {
    if (!groups.has(cls)) groups.set(cls, [])
    groups.get(cls)?.push(`<rect x="${cx}" y="${cy}" width="${w}" height="${h}" fill="${c}"/>`)
  }
  COSTUMES[role](f, ROLE_COLOR[role])
  const group = (cls: string) => `<g class="${cls}">${(groups.get(cls) ?? []).join('')}</g>`
  const props = [...groups.keys()].filter(k => k !== 'bd' && k !== 'la' && k !== 'lb')
  const body = `<g class="bd">${(groups.get('bd') ?? []).join('')}${props.map(group).join('')}</g>`
  return `<g transform="translate(${x},${y}) scale(${scale})" shape-rendering="crispEdges"><g class="c-${role}${isWalking ? ' run' : ''}">${body}${group('la')}${group('lb')}</g></g>`
}

// ---------------------------------------------------------------------------
// Desktop drawings: each row is one SVG.

const H = 22
const BAR_H = 16
const CELL = 3
const CRAB_W = 26

const bandSvg = (list: AgentRun[], W: number): string => {
  const p = progress(list)
  const running = list.length - p.done
  const title = 'Pulse'
  const BAR_X = Math.round(16 + textWidth(title, 14) + 12)
  const BAR_W = Math.max(60, W - BAR_X - 46 - CRAB_W)
  const fillW = Math.round(BAR_W * p.ratio)
  const cols = Math.floor(fillW / CELL)
  const rows = Math.floor(BAR_H / CELL)
  const dots: string[] = []
  // Dithered fill, sparse at the start and dense toward the head; each pixel takes the gradient at its spot.
  for (let c = 0; c < cols; c++) {
    const density = 0.35 + 0.6 * Math.pow(c / Math.max(1, cols), 1.2)
    const color = p.isFinished ? JADE : pulseAt((c * CELL) / BAR_W)
    for (let r = 0; r < rows; r++) {
      if (noise(c, r) < density) dots.push(`<rect class="t${Math.floor(noise(r, c) * 4)}" x="${c * CELL + 1}" y="${r * CELL + 1}" width="2" height="2" fill="${color}"/>`)
    }
  }
  const text = p.isFinished ? 'All done' : `${p.done}/${p.total} · ${running} working`
  const pillW = Math.round(18 + text.length * 6.6)
  const pillX = Math.max(0, Math.min(BAR_W - pillW, fillW - pillW))
  const pillColor = p.isFinished ? JADE : pulseAt(Math.min(1, (pillX + pillW) / BAR_W))
  const dot = p.isFinished ? JADE : CORAL
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<style>
.tx{fill:#2d1b3d}.m{fill:#8a7f95}.k{fill:#efe8e0}
@media (prefers-color-scheme: dark){.tx{fill:#f7f3ee}.m{fill:#a89cb4}.k{fill:#2a1e38}}
.t0,.t1,.t2,.t3{animation:tw 2.2s ease-in-out infinite}
.t1{animation-duration:2.8s;animation-delay:-.7s}.t2{animation-duration:1.9s;animation-delay:-1.3s}.t3{animation-duration:3.3s;animation-delay:-.4s}
@keyframes tw{0%,100%{opacity:1}50%{opacity:${p.isFinished ? 0.8 : 0.35}}}
@media (prefers-reduced-motion: reduce){.t0,.t1,.t2,.t3{animation:none}}
</style>
<defs><clipPath id="c"><rect width="${BAR_W}" height="${BAR_H}" rx="${BAR_H / 2}"/></clipPath></defs>
<circle cx="5" cy="${H / 2}" r="4" fill="${dot}"/>
<text class="tx" x="16" y="${H / 2 + 5}" font-family="${SERIF}" font-size="14" font-style="italic" font-weight="600">${title}</text>
<g transform="translate(${BAR_X},${(H - BAR_H) / 2})">
<rect class="k" width="${BAR_W}" height="${BAR_H}" rx="${BAR_H / 2}"/>
<g clip-path="url(#c)">${dots.join('')}</g>
<rect x="${pillX}" width="${pillW}" height="${BAR_H}" rx="${BAR_H / 2}" fill="${pillColor}"/>
<text x="${pillX + pillW / 2}" y="${BAR_H / 2 + 4}" text-anchor="middle" font-family="${FONT}" font-size="11" font-weight="600" fill="#ffffff">${xml(text)}</text>
</g>
<text class="m" x="${W - CRAB_W - 6}" y="${H / 2 + 4.5}" text-anchor="end" font-family="${FONT}" font-size="12.5" font-variant-numeric="tabular-nums">${Math.round(p.ratio * 100)}%</text>
${CRAB_CSS}${crab(W - CRAB_W + 1, 0, 'pride', running > 0, 0.8)}
</svg>`
}

const PANE_CSS = `<style>
.tx{fill:#2d1b3d}.s{fill:#6e6278}.m{fill:#a397ad}.k{fill:#efe8e0}.ln{stroke:#e8e0d6}.tile{fill:#ffffff;stroke:#e8e0d6}
@media (prefers-color-scheme: dark){.tx{fill:#f7f3ee}.s{fill:#b9aec4}.m{fill:#7f748a}.k{fill:#2a1e38}.ln{stroke:#33264a}.tile{fill:#1e1430;stroke:#33264a}}
.live{animation:p 1.6s ease-in-out infinite}@keyframes p{50%{opacity:.3}}
@media (prefers-reduced-motion: reduce){.live{animation:none}}
</style>`

const svg = (W: number, h: number, body: string): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${h}" viewBox="0 0 ${W} ${h}">${PANE_CSS}${CRAB_CSS}${body}</svg>`

const HEADER_H = 44

const headerSvg = (W: number, t: ReturnType<typeof totals>): string => {
  const gap = 6
  const tw = (W - gap * 2) / 3
  const tile = (i: number, k: string, v: string) =>
    `<rect class="tile" x="${i * (tw + gap) + 0.5}" y="0.5" width="${tw - 1}" height="40" rx="8"/>
<text class="s" x="${i * (tw + gap) + 9}" y="16" font-family="${FONT}" font-size="11">${k}</text>
<text class="tx" x="${i * (tw + gap) + 9}" y="33" font-family="${SERIF}" font-size="15" font-weight="600" font-variant-numeric="tabular-nums">${v}</text>`
  return svg(W, HEADER_H, `${tile(0, 'Cost', '≈' + fmtCost(t.cost))}${tile(1, 'Tokens', fmtTokens(t.tokens))}${tile(2, 'Time', fmtTime(t.time))}`)
}

const statusMark = (x: number, y: number, a: AgentRun, color: string): string => {
  if (a.status === 'running') return `<circle class="live" cx="${x}" cy="${y}" r="3.5" fill="${color}"/>`
  if (a.status === 'done') return `<path d="M${x - 5} ${y}l3.5 3.5 6.5-7" fill="none" stroke="${JADE}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`
  return `<path d="M${x - 4} ${y - 4}l8 8M${x + 4} ${y - 4}l-8 8" stroke="${CORAL}" stroke-width="1.8" stroke-linecap="round"/>`
}

const ROW_H = 66

const agentSvg = (W: number, a: AgentRun, at: number): string => {
  const role = roleOf(a.type)
  const color = ROLE_COLOR[role]
  const ctx = ctxOf(a)
  const barW = W - 42 - 22
  const fillW = Math.round(barW * (a.status === 'done' ? 1 : ctx / 100))
  const fill = a.status === 'done' ? JADE : a.status === 'failed' ? CORAL : color
  const meta = [runModel(a), ...(a.status === 'failed' ? ['stopped'] : [])].join('  ·  ')
  const stats = `ctx ${ctx}% · ${fmtTokens(a.contextTokens)}  ≈${fmtCost(a.costUsd)}  ${fmtTime(elapsed(a, at))}`
  return svg(
    W,
    ROW_H,
    `${crab(0, 14, role, a.status === 'running')}
<text class="tx" x="42" y="18" font-family="${FONT}" font-size="13" font-weight="600">${xml(fitText(a.description || a.type, 13, barW))}</text>
<text x="42" y="34" font-family="${FONT}" font-size="11"><tspan fill="${color}">${xml(a.type)}</tspan><tspan class="s">  ${xml(meta)}</tspan></text>
<text class="s" x="${42 + barW}" y="49" text-anchor="end" font-family="${FONT}" font-size="11" font-variant-numeric="tabular-nums">${stats}</text>
<rect class="k" x="42" y="55" width="${barW}" height="4" rx="2"/><rect x="42" y="55" width="${fillW}" height="4" rx="2" fill="${fill}"/>
${statusMark(W - 8, 16, a, color)}
<line class="ln" x1="0" y1="${ROW_H - 0.5}" x2="${W}" y2="${ROW_H - 0.5}"/>`,
  )
}

const compactSvg = (W: number, list: AgentRun[], t: ReturnType<typeof totals>): string => {
  const ordered = [...list.filter(a => a.status === 'running'), ...list.filter(a => a.status !== 'running')]
  const fit = Math.max(1, Math.floor((W - 150) / 36))
  const shown = ordered.slice(0, fit)
  const more = ordered.length - shown.length
  const body = shown.map((a, i) => crab(i * 36, 0, roleOf(a.type), a.status === 'running')).join('')
  return svg(
    W,
    32,
    `${body}${more ? `<text class="s" x="${shown.length * 36 + 4}" y="21" font-family="${FONT}" font-size="12">+${more}</text>` : ''}
<text class="s" x="${W}" y="21" text-anchor="end" font-family="${FONT}" font-size="12" font-variant-numeric="tabular-nums">≈${fmtCost(t.cost)} · ${fmtTokens(t.tokens)} · ${fmtTime(t.time)}</text>`,
  )
}

// ---------------------------------------------------------------------------
// Terminal drawing helpers.

const textBar = (ratio: number, width: number): string => {
  const filled = Math.round(width * Math.min(1, Math.max(0, ratio)))
  return '█'.repeat(filled) + '░'.repeat(Math.max(0, width - filled))
}

const STATUS_GLYPH: Record<string, string> = { running: '●', done: '✓', failed: '✗' }

// ---------------------------------------------------------------------------
// Pane open and close.

async function openPane($: EngineInterface): Promise<void> {
  const at = await $.clock.now()
  await update($, now, () => at)
  await $.ui.open({ id: PANE, title: PANE_TITLE })
}

async function togglePane($: EngineInterface): Promise<boolean> {
  if ((await $.ui.panes()).some(p => p.id === PANE)) {
    await $.ui.close({ id: PANE })
    return false
  }
  await openPane($)
  return true
}

export const register: Register = (on, options) => {
  on('session.start', async ($, e, next) => {
    const started = await next(e)
    await $.command.register({
      name: 'pulse',
      description: 'Show or hide the Pulse panel of subagents: running and finished, with model, context, cost and time',
    })
    // Ticks the running agents' clocks; quiet when nothing runs.
    $.clock.every(1000, () => {
      void (async () => {
        if (!(await read($, agents)).some(a => a.status === 'running')) return
        const at = await $.clock.now()
        await update($, now, () => at)
      })()
    })
    return started
  })

  on('command.run', { command: 'pulse' }, async ($, e) => {
    if ((e.args ?? '').trim() === 'open') {
      await openPane($)
      return { text: 'Pulse panel opened.' }
    }
    return { text: (await togglePane($)) ? 'Pulse panel opened.' : 'Pulse panel closed.' }
  })

  // Observe only: the spawn goes on exactly as it came in.
  on('agent.spawn', async ($, e, next) => {
    const started = await next(e)
    if (started.deny !== undefined) return started

    const at = await $.clock.now()
    const run: AgentRun = {
      id: started.agentId ?? e.tool_use_id,
      agentId: started.agentId,
      type: e.subagentType,
      description: e.description,
      model: started.model,
      status: 'running',
      startedAt: at,
      contextTokens: 0,
      contextMax: windowOf(started.model),
      tokens: 0,
      costUsd: 0,
      steps: 0,
    }
    await update($, agents, list => [...list.filter(a => a.id !== run.id), run].slice(-MAX_RUNS))
    await update($, now, () => at)
    const v = await update($, view, prev => ({ ...prev, isBandHidden: false }))
    if (options.autoOpen !== 'never' && v && !v.didAutoOpen) {
      await update($, view, prev => ({ ...prev, didAutoOpen: true }))
      void $.ui.open({ id: PANE, title: PANE_TITLE })
    }
    return started
  }).catch(($, e, next) => next(e)) // If drawing bookkeeping fails, the spawn still goes on unchanged.

  // Each model request of a subagent: live context, tokens and cost. The result passes through untouched.
  on('turn.step', async function* ($, e, next) {
    const result = yield* next(e)
    const agentId = e.agentId
    const usage = result.usage
    if (!agentId || !usage) return result

    const model = usage.model || e.model
    await update($, agents, list =>
      list.map((a): AgentRun =>
        a.agentId !== agentId
          ? a
          : {
              ...a,
              model,
              effort: typeof e.effort === 'string' ? e.effort : a.effort,
              status: 'running',
              endedAt: undefined,
              contextTokens: sumTokens(usage),
              contextMax: windowOf(model),
              tokens: a.tokens + sumTokens(usage),
              costUsd: a.costUsd + costOf(model, usage),
              steps: a.steps + 1,
            },
      ),
    )
    return result
  })

  on('turn.complete', async ($, e, next) => {
    const agentId = e.agentId
    if (agentId) {
      const at = await $.clock.now()
      await update($, agents, list =>
        list.map((a): AgentRun => {
          if (a.agentId !== agentId) return a
          // A run whose steps went unseen still gets the turn's own sum.
          const usage = a.steps === 0 ? e.usage : null
          return {
            ...a,
            status: e.reason === 'answer' ? 'done' : 'failed',
            endedAt: at,
            ...(usage
              ? { model: usage.model || a.model, contextTokens: sumTokens(usage), tokens: sumTokens(usage), costUsd: costOf(usage.model || a.model, usage) }
              : {}),
          }
        }),
      )
      await update($, now, () => at)
    }
    return next(e)
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const ui = $.ui.resolve(e)
    const { Box, Text, Button } = ui
    const list = await read($, agents)
    const v: View = await read($, view)
    const at = Math.max(await read($, now), ...list.map(a => a.startedAt), 0)
    const running = list.filter(a => a.status === 'running').reverse()
    const finished = list.filter(a => a.status !== 'running').reverse()
    const t = totals(list, at)
    const summary = `≈${fmtCost(t.cost)}, ${fmtTokens(t.tokens)} tokens, ${fmtTime(t.time)}`

    const toggleCompact = (
      <Button key="compact" label={v.isCompact ? 'Expand' : 'Collapse'} plain onPress={() => update($, view, prev => ({ ...prev, isCompact: !prev.isCompact }))} />
    )
    const toggleDone = (
      <Button
        key="done"
        label={`${v.isDoneCollapsed ? '▸' : '▾'} Finished · ${finished.length}`}
        plain
        onPress={() => update($, view, prev => ({ ...prev, isDoneCollapsed: !prev.isDoneCollapsed }))}
      />
    )
    const empty = <Text dimColor>No subagents yet. They show up here as soon as one starts.</Text>

    if (e.surface === 'desktop' && 'Svg' in ui) {
      const { Svg } = ui
      const W = Math.max(240, Math.min(900, (e.props.bodyColumns || 40) * 8 - 8))
      if (v.isCompact) {
        return (
          <Box flexDirection="column" gap={1}>
            <Svg source={compactSvg(W, list, t)} alt={`${list.length} agents, ${summary}`} width={W} height={32} />
            {toggleCompact}
          </Box>
        )
      }
      const rowOf = (a: AgentRun) => (
        <Svg key={a.id} source={agentSvg(W, a, at)} alt={`${a.description}: ${modelName(a.model)}, ${a.status}`} width={W} height={ROW_H} />
      )
      return (
        <Box flexDirection="column">
          <Svg source={headerSvg(W, t)} alt={summary} width={W} height={HEADER_H} />
          {toggleCompact}
          {list.length === 0 && empty}
          {running.length > 0 && <Text dimColor>Working · {running.length}</Text>}
          {running.map(rowOf)}
          {finished.length > 0 && toggleDone}
          {!v.isDoneCollapsed && finished.map(rowOf)}
        </Box>
      )
    }

    // Terminal: the same content in text rows.
    const barW = Math.max(6, Math.min(20, Math.max(24, e.props.bodyColumns || 40) - 34))
    const row = (a: AgentRun) => {
      const color = ROLE_COLOR[roleOf(a.type)]
      const ctx = ctxOf(a)
      return (
        <Box key={a.id} flexDirection="column" marginBottom={1}>
          <Box flexDirection="row" gap={1}>
            <Text color={color}>▣</Text>
            <Text bold wrap="truncate-end">{a.description || a.type}</Text>
            <Text color={a.status === 'failed' ? CORAL : a.status === 'done' ? JADE_SOFT : color}>{STATUS_GLYPH[a.status]}</Text>
          </Box>
          <Text dimColor wrap="truncate-end">  {a.type} · {runModel(a)}</Text>
          <Text wrap="truncate-end">
            {'  '}
            <Text color={a.status === 'done' ? JADE_SOFT : color}>{textBar(a.status === 'done' ? 1 : ctx / 100, barW)}</Text>
            <Text dimColor> ctx {ctx}% · {fmtTokens(a.contextTokens)} ≈{fmtCost(a.costUsd)} {fmtTime(elapsed(a, at))}</Text>
          </Text>
        </Box>
      )
    }
    return (
      <Box flexDirection="column">
        <Box flexDirection="row" justifyContent="space-between">
          <Text dimColor>≈{fmtCost(t.cost)} · {fmtTokens(t.tokens)} tokens · {fmtTime(t.time)}</Text>
          {toggleCompact}
        </Box>
        {v.isCompact ? (
          <Text wrap="truncate-end">
            {[...running, ...finished].map(a => (
              <Text key={a.id} color={ROLE_COLOR[roleOf(a.type)]}>{STATUS_GLYPH[a.status]} </Text>
            ))}
          </Text>
        ) : (
          <Box flexDirection="column" marginTop={1}>
            {list.length === 0 && empty}
            {running.length > 0 && <Text dimColor>Working · {running.length}</Text>}
            {running.map(row)}
            {finished.length > 0 && toggleDone}
            {!v.isDoneCollapsed && finished.map(row)}
          </Box>
        )}
      </Box>
    )
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const list = await read($, agents)
    const v = await read($, view)
    if (list.length === 0 || v.isBandHidden || e.props.hasSurvey) return next(e)
    // Other mods' bands draw beneath this row. Claude Code's own placeholder is never nested.
    const drawn = await Promise.resolve(next(e)).catch(() => null)
    const below = drawn && typeof drawn === 'object' && (drawn as { type?: string }).type !== 'engine' ? drawn : null

    const ui = $.ui.resolve(e)
    const { Box, Text, Button } = ui
    const p = progress(list)
    const crewButton = <Button key="pulse-agents" label={`×${list.length}`} plain onPress={() => void togglePane($)} />
    // Dismiss hides the band and forgets the finished runs; the next spawn brings it back.
    const dismiss = (
      <Button
        key="pulse-dismiss"
        label="✕"
        plain
        role="dismiss"
        onPress={async () => {
          await update($, agents, l => l.filter(a => a.status === 'running'))
          await update($, view, prev => ({ ...prev, isBandHidden: true }))
        }}
      />
    )

    if (e.surface !== 'terminal' && 'Svg' in ui) {
      const { Svg } = ui
      const width = Math.max(180, Math.min(1600, (e.props.bodyColumns || 100) * 8 - 96))
      return (
        <Box flexDirection="column">
          <Box flexDirection="row" alignItems="center" gap={1}>
            <Svg source={bandSvg(list, width)} alt={`Pulse: ${p.done} of ${p.total} subagents finished`} width={width} height={H} />
            {crewButton}
            {dismiss}
          </Box>
          {below}
        </Box>
      )
    }

    const width = Math.max(6, Math.min(40, e.props.bodyColumns - 40))
    return (
      <Box flexDirection="column">
        <Box flexDirection="row" gap={2}>
          <Text color={p.isFinished ? JADE_SOFT : CORAL}>● Pulse</Text>
          <Text color={p.isFinished ? JADE_SOFT : CORAL}>{textBar(p.ratio, width)}</Text>
          <Text bold>{p.isFinished ? 'All done' : `${p.done}/${p.total}`}</Text>
          <Text dimColor>{Math.round(p.ratio * 100)}%</Text>
          {crewButton}
          {dismiss}
        </Box>
        {below}
      </Box>
    )
  })
}
