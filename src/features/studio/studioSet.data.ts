export const coverImage = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop'

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
  image?: string
}

export const ROWS: SetRow[] = [
  { n: '1', pre: 'Abertura', who: 'Sara Marques', tm: '4:02', image: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?q=80&w=400&auto=format&fit=crop' },
  { n: '2', pre: 'Carta para a ', em: 'santa', who: 'Mariana Sol', tm: '4:18', image: 'https://images.unsplash.com/photo-1623099405608-83508f309cc2?q=80&w=800&auto=format&fit=crop' },
  { n: '3', pre: 'Anjos ', em: 'tape', who: 'D. Okoye', tm: '3:44', now: true, image: 'https://images.unsplash.com/photo-1642178225043-f299072af862?q=80&w=800&auto=format&fit=crop' },
  { n: '4', pre: 'Madrugada', who: 'Inês T.', tm: '5:11', image: 'https://images.unsplash.com/photo-1642433706033-82b795d91fe3?q=80&w=800&auto=format&fit=crop' },
  { n: '5', pre: 'Última ', em: 'dança', who: 'Helena P.', tm: '4:50', image: 'https://images.unsplash.com/photo-1642784353725-5a79aaaaecab?q=80&w=800&auto=format&fit=crop' },
  { n: '6', pre: 'Encerramento', who: 'Sara Marques', tm: '6:02', image: 'https://images.unsplash.com/photo-1648090322527-138e464a299e?q=80&w=800&auto=format&fit=crop' },
]
