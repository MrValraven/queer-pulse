import type { IconType } from 'react-icons'
import { FiBook, FiCoffee, FiFeather, FiFilm } from 'react-icons/fi'

export const HERO_TYPES = ['Supper club', 'Studio visit', 'Skills workshop', 'Film screening', 'Morning walk', 'Book club', 'Open studio']

export const TYPE_CARDS: { icon: IconType; title: string; body: string }[] = [
  { icon: FiCoffee, title: 'Supper club', body: 'Intimate, hosted in your home or borrowed kitchen. 8–14 people. The model Tomás uses — and it works because it\'s personal.' },
  { icon: FiFeather, title: 'Studio visit', body: 'Open your workspace to people who\'d genuinely want to see it. Low logistics, high value. Works especially well for makers.' },
  { icon: FiBook, title: 'Skills session', body: 'Teach something you know. An hour of practical knowledge shared is worth more than most workshops that cost money.' },
  { icon: FiFilm, title: 'Screening or talk', body: 'A film, a documentary, a conversation with someone interesting. A projector and a living room is enough.' },
]

export const SPACES = [
  { hood: 'Mouraria', name: 'Casa da Mariquinhas', note: 'Kitchen + dining room · up to 20' },
  { hood: 'Príncipe Real', name: 'Atelier Pulso', note: 'Studio · up to 15 · member-run' },
  { hood: 'Marvila', name: 'Fábrica Nuno Gama', note: 'Warehouse · up to 50 · events only' },
]
