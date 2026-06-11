export const UPLOAD_STEPS = [
  { num: 1, nm: 'Files', sub: '· WAV / FLAC · cover art · lyrics', on: true },
  { num: 2, nm: 'Metadata & credits', sub: '· title · year · per-track splits' },
  { num: 3, nm: 'Licence & release', sub: '· CC / ARR · pricing · publish date' },
]

export const UPLOAD_FILES = [
  { name: '01_abertura.wav', meta: '24 bit / 48 kHz · 2:14 · −14.2 LUFS · 18.4 MB', ok: true },
  { name: '02_o_regresso.wav', meta: '24 bit / 48 kHz · 3:42 · −14.0 LUFS · 30.4 MB', ok: true },
  { name: '03_mae_tres_vezes.wav', meta: '24 bit / 48 kHz · 4:08 · −14.1 LUFS · 33.8 MB', ok: true },
  { name: '04_a_vizinha.wav', meta: '24 bit / 48 kHz · 5:31 · −7.8 LUFS · 45.2 MB', ok: false },
  { name: '05_intervalo.wav', meta: '24 bit / 48 kHz · 1:48 · −14.3 LUFS · 14.7 MB', ok: true },
]

export const UPLOAD_SPLITS = [
  { av: 'MS', tone: 'coral', nm: 'Mariana Sol', sub: 'you · songwriter, voice, piano · all tracks', role: 'writer + performer · 1 – 11', pct: '85' },
  { av: 'JA', tone: 'jade', nm: 'João Anjos', sub: 'cellist · IBAN pending invite', role: 'cello · 2, 7, 11', pct: '10' },
  { av: 'IT', tone: 'coral', nm: 'Inês T.', sub: 'mix & master · QP member', role: 'production · all tracks', pct: '5' },
  { av: 'CO', tone: 'jade', nm: 'Coro de Outubro', sub: 'choir · 15 voices, treated as one', role: 'choir · 4 only', pct: '20', onTrack: 'on track 4' },
]

export const UPLOAD_SIDE_INFO = [
  {
    eyebrow: 'What we do with your files',
    title: 'Yours, <em>still</em>.',
    body: 'You drop the masters; we transcode and stream. Your original WAV / FLAC stays your property — we hold a copy <em>only</em> for delivery. Takedown removes the listening copy in 14 days. Non-exclusive, always.',
    list: [
      { label: 'Source kept', value: 'your file, untouched', em: true },
      { label: 'Listener delivery', value: 'FLAC + AAC 256', em: false },
      { label: 'Loudness target', value: '−14 LUFS', em: false },
      { label: 'ISRC assignment', value: 'automatic', em: true },
    ],
  },
  {
    eyebrow: 'Lyrics & translations',
    title: 'Lyrics <em>required</em>, translations paid.',
    body: 'Upload lyrics in any language. For a line-by-line translation, the solidarity fund pays a community translator <em>€40 per song</em>. They keep their byline; you approve before publish.',
    list: [
      { label: 'Auto-transcribe', value: 'free · ~94%', em: true },
      { label: 'Community translation', value: '€40 → translator', em: false },
      { label: 'Your approval', value: 'before publish', em: false },
    ],
  },
]
