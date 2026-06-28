export interface Place {
  name: string
  detail: string
  flags: string[]
}

export interface PlaceGroup {
  id: string
  label: string
  intro: string
  places: Place[]
}

export const GROUPS: PlaceGroup[] = [
  {
    id: 'routes',
    label: 'Step-free running routes',
    intro: 'Loops the running group has checked on foot — flat, even surfaces, no stairs or kerbs you have to lift over.',
    places: [
      { name: 'Parque das Nações riverside', detail: '7 km, completely flat, wide tarmac the whole way. The easiest first loop and step-free from the east lift.', flags: ['7 km', 'Tarmac', 'Step-free'] },
      { name: 'Belém to Algés waterfront', detail: '5 km out-and-back along the river. Smooth, open, and you can turn back at any point.', flags: ['5 km', 'Flat', 'Turn back anywhere'] },
      { name: 'Alameda to Gulbenkian gardens', detail: '4 km through gardens and wide pavements. One gentle slope, otherwise level.', flags: ['4 km', 'Mostly level'] },
    ],
  },
  {
    id: 'venues',
    label: 'Social venues',
    intro: 'Cafés and restaurants members have been to themselves. Only places someone has actually checked make the list.',
    places: [
      { name: 'Arquivo, Príncipe Real', detail: 'Library-café, genuinely quiet, level entrance from the square. Good for low-noise meets.', flags: ['Step-free', 'Low noise', 'Seated'] },
      { name: 'Maria Caxuxa, Intendente', detail: 'Step-free entrance, hearing loop, accessible toilet, and staff who know what they are doing.', flags: ['Step-free', 'Hearing loop', 'Accessible WC'] },
      { name: 'Heim, Arroios', detail: 'Seated, low music, good coffee. One small step at the door — staff bring a ramp if you ask.', flags: ['Ramp on request', 'Low music'] },
      { name: 'Cervejaria Trindade, Chiado', detail: 'Accessible via the Chiado entrance; the quieter back room has excellent acoustics for a group.', flags: ['Step-free entrance', 'Quiet back room'] },
    ],
  },
  {
    id: 'family',
    label: 'Family-friendly spots',
    intro: 'Parks and venues that work with buggies, small kids, and the occasional meltdown — picked by the parents group.',
    places: [
      { name: 'Jardim da Estrela', detail: 'Fenced playground, step-free paths, café and toilets on site. The picnic patch near the fountain is reserved-able.', flags: ['Playground', 'Step-free', 'Toilets'] },
      { name: 'Parque Eduardo VII (lower lawns)', detail: 'Wide flat lawns at the bottom, easy buggy access from Marquês. Avoid the steep top in summer.', flags: ['Buggy-friendly', 'Open space'] },
      { name: 'Gulbenkian gardens', detail: 'Shade, ponds, ducks, and smooth paths throughout. Calm and rarely crowded on weekday mornings.', flags: ['Shaded', 'Smooth paths', 'Calm'] },
    ],
  },
]
