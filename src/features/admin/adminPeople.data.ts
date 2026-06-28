// Consistent mock portraits for named admin people, so the same member shows
// the same face across Moderation, Members, Communities and the audit log.
// Anonymous, system and flagged accounts intentionally have NO entry here —
// they fall back to tinted initials (an avatar with no photo is a signal).

const U = (id: string) =>
  `https://images.unsplash.com/photo-${id}?q=80&w=400&auto=format&fit=crop`

export const PORTRAITS: Record<string, string> = {
  'Inês Martins': U('1506863530036-1efeddceb993'),
  'Devon Okoro': U('1531123897727-8f129e1688ce'),
  'Théo Mendes': U('1500648767791-00dcc994a43e'),
  'Sofia Almeida': U('1573497019940-1c28c88b4f3e'),
  'Kai Sousa': U('1547646034-d37a03ebaba3'),
  'Marco Vieira': U('1487412720507-e7ab37603c6f'),
  'Rui Antunes': U('1534528741775-53994a69daeb'),
  'Nadia Lopes': U('1544005313-94ddf0286df2'),
  'Júlia Saraiva': U('1582896911227-c966f6e7fb93'),
  'Mara L.': U('1521252659862-eec69941b071'),
  'Tomás R.': U('1506794778202-cad84cf45f1d'),
  'Sofia D.': U('1499887142886-791eca5918cd'),
  'Ana L.': U('1502823403499-6ccfcf4fb453'),
  '@reblanco': U('1463453091185-61582044d556'),
  // Short-form aliases used in thread/meta copy → same person.
  'Théo M.': U('1500648767791-00dcc994a43e'),
}

/** Portrait URL for a named person, or undefined (→ initials fallback). */
export function portrait(name?: string): string | undefined {
  return name ? PORTRAITS[name] : undefined
}
