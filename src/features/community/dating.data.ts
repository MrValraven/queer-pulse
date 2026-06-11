export interface App {
  icon: string
  iconBg: string
  iconColor: string
  name: string
  audience: string
  body: string
  tags: string[]
  quote: string
}

export const APPS: App[] = [
  { icon: 'Gr', iconBg: 'rgba(232,119,90,.15)', iconColor: 'var(--accent-ink)', name: 'Grindr', audience: 'Gay & bi men · Trans masc', body: "Still the highest user density for gay and bi men in Lisbon. Works. The culture varies enormously by who's on at any given time.", tags: ['Hookup-oriented', 'High volume', 'Variable culture'], quote: '"Works fine for what it is. Set your preferences clearly and you\'ll find your people. The community tends to cluster in Príncipe Real and Mouraria."' },
  { icon: 'Sc', iconBg: 'rgba(45,27,61,.1)', iconColor: 'var(--plum)', name: 'Scruff', audience: 'Gay & bi men · Bears · Masc-leaning', body: 'More conversational than Grindr. Better for people who want to talk first. Has events and group features that the queer community uses actively in Lisbon.', tags: ['Community features', 'More chat-first', 'Bears & masc'], quote: '"The Lisbon pool is smaller but the vibe is better. More likely to result in an actual conversation."' },
  { icon: 'HER', iconBg: 'rgba(74,140,111,.14)', iconColor: 'var(--jade)', name: 'HER', audience: 'Queer women · Non-binary', body: 'The main app for queer women and non-binary people in Lisbon. Smaller pool but genuinely community-oriented — has event listings and groups beyond just dating.', tags: ['Community-first', 'Events & groups', 'All relationships'], quote: '"Not huge in Lisbon but the quality of connections is better. Worth having alongside Tinder."' },
  { icon: 'Fe', iconBg: 'rgba(122,82,184,.14)', iconColor: '#7A52B8', name: 'Feeld', audience: 'All genders · ENM · Kink-adjacent', body: 'The go-to for ethical non-monogamy, open relationships, and kink in Lisbon. Very identity-inclusive. Growing fast in the community — well-used at events and socials too.', tags: ['ENM', 'Kink-adjacent', 'Identity-inclusive', 'Couples & singles'], quote: '"Best app for anyone who doesn\'t want to fit into a neat box. The community here uses it more than anywhere I\'ve lived."' },
  { icon: 'Ho', iconBg: 'rgba(232,119,90,.15)', iconColor: 'var(--accent-ink)', name: 'Hornet', audience: 'Gay & bi men · Community-focused', body: 'More community-oriented than Grindr — has news, stories, and group features. Better for people who want to know the city as well as date in it. Active in Lisbon.', tags: ['Community features', 'Local news', 'More than hookups'], quote: '"Used this to find events and community spots before I had a social network. Underrated."' },
  { icon: 'OK', iconBg: 'rgba(45,27,61,.08)', iconColor: 'var(--plum)', name: 'OkCupid', audience: 'All genders · Relationships', body: 'Best identity and pronoun options of any mainstream app. Question-matching means you arrive at conversations already knowing you have something in common. Slower pace, better for relationships over hookups.', tags: ['Best identity options', 'Relationship-focused', 'Slower pace'], quote: '"If you care about someone\'s politics and values before their photos, OkCupid is the one."' },
]

export const CULTURE: { num: string; title: string; text: string }[] = [
  { num: '01', title: "It's a small community", text: "Lisbon's queer community is intimate. You will meet the same people at events, through apps, and through friends within weeks of arriving. This is mostly wonderful — but it also means that how you treat people echoes. Be kind." },
  { num: '02', title: 'Pace is slower', text: 'Portuguese social and dating culture is generally slower than northern European or North American norms. Expect longer warm-up periods, more emphasis on in-person chemistry, and less pressure to define things quickly. This is a feature, not a bug.' },
  { num: '03', title: 'The language gap is real', text: "Dating across a language barrier is a specific experience. Some people find it freeing; others find it exhausting. The queer expat community is large enough that you can absolutely date within it — but you'll miss the broader community if you only date other expats." },
  { num: '04', title: 'Events are how people actually meet', text: 'Apps matter less here than in some cities. A significant portion of relationships in the QueerPulse community started at a community event, through a mutual introduction, or at a forum gathering. Show up to things.' },
]

export const STRUCTURES: { label: string; title: string; text: string }[] = [
  { label: 'Monogamy', title: 'One person, fully', text: "Completely valid and common. The community doesn't assume non-monogamy is more progressive — it's a preference, not a hierarchy. The legal protections in Portugal are strongest for married monogamous couples, which is worth knowing if legal recognition matters to you." },
  { label: 'Ethical non-monogamy', title: 'Open relationships', text: 'ENM covers a broad range from "open but together" to fully independent relationships with multiple people. Feeld and the community\'s own social events are the best entry points. The forum has an active ENM thread with local meetups.' },
  { label: 'Polyamory', title: 'Multiple loving relationships', text: 'A distinct culture from ENM — more focused on multiple committed relationships than open/casual structures. There\'s an active poly community in Lisbon with regular social events and forum support. Legally complex in Portugal — particularly for housing, healthcare, and family situations.' },
  { label: 'Relationship anarchy', title: 'No hierarchy, no rules', text: "Relationships defined entirely by the people in them, without reference to conventional categories. RA is quietly common in the Lisbon queer community — most people won't call it that, but the practice is widespread." },
  { label: 'Queerplatonic', title: 'Deep non-romantic partnership', text: 'A committed, close relationship without romantic or sexual components. QPRs can include cohabitation, shared finances, and the kind of partnership that marriage typically describes — just without the romantic framing. Increasingly visible in the community.' },
  { label: 'Solo polyamory', title: 'Your own anchor', text: 'Multiple connections without a primary partner or "escalator" trajectory. Common among people who moved to Lisbon independently and value their autonomy. Works well with the city\'s social rhythm — events and community without cohabitation pressure.' },
]

export const RECOGNITION: { title: string; text: string; status: string; partial?: boolean }[] = [
  { title: 'Same-sex marriage', text: 'Full legal recognition since 2010. All the same rights as opposite-sex marriage — inheritance, residency, healthcare decisions, joint adoption.', status: 'Full recognition since 2010' },
  { title: 'Civil partnership / União de facto', text: 'Recognised after 2 years cohabitation. Carries significant legal protections including inheritance, healthcare decisions, and residency rights. Simpler than marriage to enter and exit.', status: 'Full recognition' },
  { title: 'Non-monogamous relationships', text: 'No legal recognition for multiple-partner relationships. Practical solutions exist (wills, powers of attorney, cohabitation agreements) but require deliberate legal planning.', status: 'No automatic recognition — plan ahead', partial: true },
]

export const EVENTS: { name: string; detail: string; note: string }[] = [
  { name: 'Queer Singles Dinner', detail: 'Monthly · Mouraria · 12–16 people', note: 'Hosted dinners for single members. No agenda, no pressure — just a good meal and the chance to meet people properly.' },
  { name: 'ENM & Poly Social', detail: 'Bi-monthly · Arroios · Ongoing', note: 'Community gathering for non-monogamous members. Primarily social, secondarily a space to talk about navigating ENM in Lisbon.' },
  { name: 'New Members Social', detail: 'Every 6 weeks · Venue rotates', note: "Specifically for members who've joined in the last 3 months. The community shows up for this one." },
]
