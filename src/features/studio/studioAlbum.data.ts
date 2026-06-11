export const TRACKS = [
  { n: 1, pre: 'Abertura — ', em: 'a luz', who: 'instrumental · piano', tm: '2:10' },
  { n: 2, pre: 'Cidade dos ', em: 'santos', who: 'solo voice + piano', tm: '3:54' },
  { n: 3, pre: 'Mãe, três ', em: 'vezes', who: 'solo voice + piano', tm: '4:08' },
  { n: 4, pre: 'A ', em: 'vizinha', post: ' que reza', who: 'duet with Coro de Outubro', tm: '5:31' },
  { n: 5, pre: 'Intervalo', who: 'instrumental · piano', tm: '1:48' },
  { n: 6, pre: 'Carta para a ', em: 'santa', who: 'now playing · in the Wednesday set', tm: '4:18', now: true },
  { n: 7, pre: 'Festa ', em: 'pequena', who: 'João Anjos · cello, Inês T. · percussion', tm: '3:24' },
  { n: 8, pre: 'O ', em: 'nome', who: 'solo voice + piano', tm: '4:55' },
  { n: 9, pre: 'Casa da ', em: 'avó', who: 'field recording + voice', tm: '3:12' },
  { n: 10, pre: 'Pedido', who: 'solo voice + piano', tm: '4:38' },
  { n: 11, pre: 'Fecho — ', em: 'a luz que entra', who: 'instrumental · piano + cello', tm: '3:32' },
]

export const TABS = ['Tracklist', 'Liner notes', 'Credits'] as const

export const MORE: {
  pre: string
  em?: string
  meta: string
  tag: 'mem' | 'free'
  tagLabel: string
  tint: 'plum' | 'coral' | 'jade'
}[] = [
  { pre: 'A ', em: 'Beja', meta: 'EP · 5 tracks · 2024', tag: 'mem', tagLabel: 'Sustainer', tint: 'plum' },
  { pre: 'Devoção', meta: 'Album · 9 tracks · 2023', tag: 'mem', tagLabel: 'Sustainer', tint: 'coral' },
  { pre: 'Mãe, ', em: 'vento', meta: 'Single · 2025', tag: 'free', tagLabel: 'Free', tint: 'jade' },
  { pre: 'Bairro ', em: 'quente', meta: 'Single · 2024', tag: 'free', tagLabel: 'Free', tint: 'plum' },
]
