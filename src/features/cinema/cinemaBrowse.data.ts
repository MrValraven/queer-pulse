import { type Access } from './data'

export const ACCESS_FILTERS: { value: Access; label: string }[] = [
  { value: 'free', label: 'Free' },
  { value: 'member', label: 'Sustainer' },
  { value: 'rent', label: 'Rent · €3' },
]

export const FORMATS = ['Documentary', 'Feature', 'Short', 'Series', 'Experimental']

export const MADE_BY = ['Trans filmmakers', 'Lesbian filmmakers', 'Gay filmmakers', 'Non-binary filmmakers', 'QP members']

export const COUNTRIES = ['Portugal', 'Brazil', 'France', 'Japan', 'UK', 'Senegal', 'Egypt', '+14 more']

export const ACCESSIBILITY = ['PT subtitles', 'EN subtitles', 'Audio description', 'Sign language']

export const MOODS = ['Slow', 'Tender', 'Political', 'Funny', 'Healing', 'Joyful']
