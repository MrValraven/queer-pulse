export const SET = {
  title: 'Vespertina ',
  em: 'vol. iv',
  by: 'Sara Marques',
  recorded: 'Recorded live · Casa do Comum · 12 Apr 2026',
  length: '11 tracks · 58 min',
  blurb: 'The hour between sunset and the second bottle. Sara\'s fourth Vespertina set, recorded in one take to a room of forty, and now paying every artist in it on each listen.',
}

export interface SetRow {
  n: string
  pre: string
  em?: string
  post?: string
  who: string
  tm: string
  now?: boolean
}

export const ROWS: SetRow[] = [
  { n: '1', pre: 'Abertura', who: 'Sara Marques', tm: '4:02' },
  { n: '2', pre: 'Carta para a ', em: 'santa', who: 'Mariana Sol', tm: '4:18' },
  { n: '3', pre: 'Anjos ', em: 'tape', who: 'D. Okoye', tm: '3:44', now: true },
  { n: '4', pre: 'Madrugada', who: 'Inês T.', tm: '5:11' },
  { n: '5', pre: 'Última ', em: 'dança', who: 'Helena P.', tm: '4:50' },
  { n: '6', pre: 'Encerramento', who: 'Sara Marques', tm: '6:02' },
]
