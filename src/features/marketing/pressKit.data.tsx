import { type ReactNode } from 'react'

export const BOILER = [
  { id: 'short', label: '25 words · for headers, intros', wc: '25 words · 154 char', text: 'QueerPulse is a queer professional network rooted in Lisbon — connecting LGBTQ+ professionals, creatives, activists and community members for work, community, culture and mutual support.' },
  { id: 'med', label: '60 words · for press releases, capsule bios', wc: '60 words · 408 char', text: 'QueerPulse is a queer professional network rooted in Lisbon, founded in 2024. We connect LGBTQ+ professionals, creatives, activists and community members for work, community, culture and mutual support. Membership is by invitation, operationally protected, and free at the solidarity tier. The platform runs a magazine, a podcast, a safe-spaces network, and a micro-grants fund disbursed by the community itself.' },
  { id: 'long', label: '130 words · for longer features, "about" sections', wc: '130 words', text: 'QueerPulse is a Lisbon-based queer professional network, founded in 2024 by eight community members in the back room of Café Beirão. It is operated by Associação QueerPulse, a not-for-profit registered in Portugal (NIPC 517 426 884), and supported by Sustainer memberships, one-off donations, and three programme grants. Membership is by vouched invitation. The platform supports a magazine, a podcast (The Back Room), a verified safe-spaces network across Lisbon, a micro-grants fund disbursed within 14 days by a rotating community circle, and an operational partnership with ILGA Portugal for legal aid and helpline handoffs. Annual transparency reports are independently audited and published publicly.' },
]

export const LOGOS: { display: string; mark: string; meta: ReactNode }[] = [
  { display: 'displayCream', mark: 'markDark', meta: <><b>Primary · light</b> · for cream/white backgrounds</> },
  { display: 'displayPlum', mark: 'markLight', meta: <><b>Inverse · plum</b> · for dark backgrounds</> },
  { display: 'displayCoral', mark: 'markLight markCoral', meta: <><b>Coral · solidarity</b> · use sparingly · pride contexts</> },
]

export const SWATCHES = [
  { bg: '#2D1B3D', name: 'Plum', hex: '#2D1B3D', meta: 'Brand anchor · headings, dark surfaces' },
  { bg: '#E8775A', name: 'Coral', hex: '#E8775A', meta: 'Accent · CTAs, italic emphasis, the pulse dot' },
  { bg: '#F7F3EE', name: 'Cream', hex: '#F7F3EE', meta: 'Page background · never pure white', border: true },
  { bg: '#4A8C6F', name: 'Jade', hex: '#4A8C6F', meta: 'Verified · live · success' },
]

export const IMAGES = [
  { tint: 'tintA', label: '01 · Founding members at Café Beirão' },
  { tint: 'tintB', label: '02 · Open clinic night, in progress' },
  { tint: 'tintC', label: '03 · The print magazine, fanned' },
  { tint: 'tintA', label: '04 · Trans Hub office · Mouraria' },
  { tint: 'tintB', label: '05 · A gathering · Atelier Pulso' },
  { tint: 'tintC', label: '06 · Map detail · safe spaces' },
]

export const TEAM: { ph: string; phCls: string; name: ReactNode; role: string; desc: ReactNode; langs: ReactNode; email: string }[] = [
  { ph: 'MR', phCls: '', name: <>Marta <em>Reis</em></>, role: 'Co-founder · Editor in chief', desc: <>For: editorial decisions, the magazine, governance, the manifesto. <em>Not for: individual member stories, moderation decisions.</em></>, langs: <><b>EN · PT · ES</b> · available on 48h notice</>, email: 'marta@queerpulse.app' },
  { ph: 'CV', phCls: 'phJade', name: <>Catarina <em>Vaz</em></>, role: 'Co-founder · Co-treasurer · Trans Hub', desc: 'For: trans-affirming healthcare, finances, transparency, mutual aid, ILGA partnership.', langs: <><b>EN · PT</b> · available on 24h notice</>, email: 'catarina@queerpulse.app' },
  { ph: 'AB', phCls: 'phPlum', name: <>André <em>Bento</em></>, role: 'Co-founder · Co-treasurer · Design', desc: 'For: platform design, technical decisions, partnerships, infrastructure. Photographer for in-house imagery.', langs: <><b>EN · PT</b> · available on 72h notice</>, email: 'andre@queerpulse.app' },
]

export const FACTS: { b: ReactNode; s: string }[] = [
  { b: <><em>2024</em></>, s: 'Founded · Lisbon' },
  { b: <>1,847</>, s: 'Active members at year-end 2025' },
  { b: <><em>96</em>%</>, s: 'Of every euro goes to programs' },
  { b: <>€<em>278</em>k</>, s: 'Total raised in 2025' },
  { b: <>284</>, s: 'Gatherings held in 2025' },
  { b: <><em>147</em></>, s: 'Micro-grants disbursed in 2025' },
  { b: <><em>42</em></>, s: 'Verified safe spaces in Lisbon' },
  { b: <>9</>, s: 'Magazine issues to date' },
  { b: <>22<em>%</em></>, s: 'Trans / non-binary members' },
]

export const COVERAGE: { source: string; title: ReactNode; meta: string; day: string; month: string }[] = [
  { source: 'Público · 4 Mar 2026', title: <>"Em Lisboa, uma rede profissional <em>queer e independente</em>."</>, meta: 'Long-form feature · by Ana Sá Lopes · 6,400 words', day: '04', month: ' Mar' },
  { source: 'Vice Portugal · 18 Feb 2026', title: <>The platform that <em>refuses to scale.</em></>, meta: 'Interview with Marta Reis · 22 min read', day: '18', month: ' Feb' },
  { source: 'FT Weekend · 24 Jan 2026', title: <>Inside Lisbon's quietest queer institution.</>, meta: 'Long-form magazine piece · syndicated to FT.com', day: '24', month: ' Jan' },
  { source: 'Mensagem de Lisboa · 11 Nov 2025', title: <>A Câmara dos <em>Anjos.</em></>, meta: 'Local-press feature on the neighbourhood', day: '11', month: ' Nov' },
  { source: 'Are.na Annual · Dec 2024', title: <>The 12 platforms we wished existed in 2024.</>, meta: "Editor's pick · positioned #4", day: '12', month: ' Dec' },
]

export const DOWNLOADS = [
  { ic: 'ZIP', icCls: 'dlZip', title: 'Complete press kit', desc: 'Marks, photography, boilerplate, fact sheet · 38 MB' },
  { ic: 'SVG', icCls: '', title: 'Marks · SVG bundle', desc: '3 variations · cleared for editorial use · 18 KB' },
  { ic: 'PNG', icCls: '', title: 'Marks · PNG @ 2x', desc: 'For Word docs, slides, web · 8 MB' },
  { ic: 'JPG', icCls: '', title: 'Photography · 6 images', desc: '3000 × 2000 px · model-released · 24 MB' },
  { ic: 'PDF', icCls: '', title: 'Fact sheet', desc: 'One-page printable · EN & PT versions · 380 KB' },
  { ic: 'PDF', icCls: '', title: '2025 transparency report', desc: '84 pages · audited · 4.2 MB' },
]
