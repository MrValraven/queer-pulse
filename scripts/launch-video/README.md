# QueerPulse launch film

Three cuts of the launch film and a film about vouching, built as code. The
films live in `public/marketing-videos/`, served with the site, and admins
preview and render them from **Admin › Marketing videos**
(`/admin/marketing-videos`): the page plays each film live and turns it into an
MP4 in the admin's own browser (Chrome or Edge on a computer). This folder holds
the headless renderer, the cast and the notes.

Each film is three files: `<id>.html` (styles and markup), `<id>.scene.js` (the
picture: `window.seek(t)`, `ready()`, `DURATION`, `CUES`) and `<id>.score.js`
(the music, `renderScore()`). Scripts stay out of the HTML because the site's
Content-Security-Policy allows no inline scripts. To add a film, add its three
files, an entry in `src/features/admin/marketingVideos/marketingVideos.data.ts`
and its id in `ALL_VIDEOS` in `render.mjs`, then run `pnpm film-scores`.

Each film also ships its score pre-rendered, `<id>.score.<hash>.m4a` (AAC,
192 kbps), so the dashboard's preview plays the music at once. `<hash>` is the
first 12 hex characters of SHA-256 over the bytes of `<id>.score.js` followed
by those of `<id>.scene.js`; the preview computes the same hash and plays the
file only when the names match. **Run `pnpm film-scores` after any edit to a
film's `score.js` or `scene.js`.** Otherwise the preview silently falls back
to synthesising the score in the browser, which takes a few seconds each
session (in `pnpm dev` it logs a warning naming the command). Rendering an MP4
on the dashboard always synthesises the score, because that is the lossless
master.

- **Cinematic** (`cinematic`): 65 seconds at 100 BPM, slow and
  warm. The rest of this README describes it unless it says otherwise.
- **Upbeat** (`upbeat`): 48 seconds at 120 BPM. Bold
  caps with one italic line, a colour field per feature, sticker pills,
  outlined marquee words and two confetti drops on the name. Same cast, cards
  and promises, so every cut says the same things.
- **Pro** (`pro`): 62 seconds at 120 BPM, filmed
  like a product launch. A dark stage with a hairline grid and grain, type
  that rises line by line out of a mask, one camera flying across a board of
  all six cards, a dot-matrix Lisbon, and deep house with interface sound.
- **Vouched** (`vouch`): 56 seconds at 120 BPM, on Pro’s dark stage. One
  product story: how a friend vouches someone into QueerPulse, from the invite
  and the walk in to arriving already knowing people, then bringing a friend
  of your own.

The cinematic cut is a 65-second 1080p launch film. The picture is an HTML
composition (`cinematic.html` + `cinematic.scene.js`), the music is synthesised
(`cinematic.score.js`), and both
are rendered frame-accurately by Chromium and encoded with ffmpeg. The product
appears as six designed moments recreated in the app's own design language,
with the demo's content, and every person in the film has an illustrated
avatar (`public/marketing-videos/avatars/`).

## Render it

```sh
node scripts/launch-video/render.mjs                  # → out/queerpulse-cinematic.mp4
node scripts/launch-video/render.mjs --video upbeat   # → out/queerpulse-upbeat.mp4
node scripts/launch-video/render.mjs --video pro      # → out/queerpulse-pro.mp4
node scripts/launch-video/render.mjs --video vouch    # → out/queerpulse-vouch.mp4
node scripts/launch-video/render.mjs --video pro --format portrait   # → out/queerpulse-pro-portrait.mp4
```

The pro film also comes as a 4:5 Instagram feed post (1080x1350):
`--format portrait` renders it, and the admin page offers it as "Render
Instagram post (4:5)". `--format landscape` (the default) is the 1920x1080
film. The portrait picture files get a `-portrait` suffix; the score is the
same in both shapes, so `out/score-<id>.wav` is shared. A film without a
portrait layout stops with an error before rendering.

Needs `ffmpeg` with libx264 on `PATH` (or `FFMPEG=/path/to/ffmpeg`). If
Playwright's own Chromium isn't installed, point `CHROMIUM_PATH` at one.

`render.mjs` options: `--fps 60` for a smoother master, `--from 19 --to 34` to
render a slice, `--workers 4` to use more cores, `--score-only` to write just
`out/score-<id>.wav` and the preview's `.m4a`. `--video all --score-only`
(`pnpm film-scores`) does that for every film in about a minute. A full 30 fps
render takes about 10 minutes on 4 cores.

Every score render writes `public/marketing-videos/<id>.score.<hash>.m4a` and
deletes that film's older `.m4a` files. It encodes with ffmpeg when it finds
one, and otherwise with macOS's `/usr/bin/afconvert`, so `pnpm film-scores`
runs on a Mac without ffmpeg. The afconvert file records its AAC priming, and
Chromium-based browsers and WebKit decode it in sync with the synthesised WAV,
sample for sample (measured October 2026).

A scene can also set two render hints. `window.CAPTURE = "jpeg"` captures
frames as JPEG, much faster for scenes full of grain or soft gradients.
`window.SHUTTER = 4` renders four sub-frames across half of each frame and
averages them: motion blur, so fast camera moves smear the way they do on
film. The pro cut uses both; its full render takes about 16 minutes.

## Work on it

Open a film through `pnpm dev` or any static server rooted at `public/` (it
loads its fonts from `public/marketing-videos/fonts/`):

- `/marketing-videos/cinematic.html?t=21.5` shows that exact frame
- `/marketing-videos/cinematic.html?play` plays it in real time, without sound
- `/marketing-videos/pro.html?format=portrait` lays the pro film out as the
  4:5 post; it combines with the others (`?format=portrait&t=13.3`)

Every frame is a pure function of time (`window.seek(t)`), so what you scrub
is what renders. Scenes start on bar lines of the 100 BPM score (a bar is
2.4s); `window.CUES` exposes the moments the music plays to (each card, each
avatar popping in, each person joining the network or the map), so moving a
cue in the picture moves its note too.

## The cut

| Time | Scene   | On screen                                                                                      |
| ---- | ------- | ---------------------------------------------------------------------------------------------- |
| 0:00 | Pulse   | The coral dot beats like a heart; the mark draws itself                                        |
| 0:05 | Night   | _Queer Lisbon is everywhere. Just never in one place._ Group-chat fragments scatter            |
| 0:14 | Turn    | _So we gathered it in one place._ Then the name, with its slogan                               |
| 0:19 | Moments | Vouches, gatherings, messages, safe spaces, forum, housing: one card per bar                   |
| 0:34 | Network | _Every member is vouched for. So there’s always someone in common._                            |
| 0:41 | Promise | _No ads. No algorithm. Just your people._ The five promises                                    |
| 0:48 | Lisbon  | _Find your community all over the city._ Real neighbourhoods, people crossing the city to meet |
| 0:55 | Invite  | _Walk in where you already belong._ The heartbeat returns and lands on the lockup              |

## The upbeat cut

Scenes start on bar lines of the 120 BPM score (a bar is 2s, a cut every
bar or two). `upbeat.html?t=9` and `?play` work the same way.

| Time | Scene   | On screen                                                               |
| ---- | ------- | ----------------------------------------------------------------------- |
| 0:00 | Hook    | _Queer Lisbon is everywhere._ Plum flips to coral, the cast pops in     |
| 0:04 | Gap     | _Just never in one place._ Stickers fly in, then _So we gathered it…_   |
| 0:08 | Drop    | Ring burst and confetti, the name with its slogan                       |
| 0:12 | Moments | Six cards, one colour each, a giant outlined word behind every card     |
| 0:24 | Network | _Everyone here is vouched for._ The network pops in on the beat         |
| 0:28 | Promise | _No ads. No algorithm. Just your people._ Marquee bands, the five pills |
| 0:32 | Lisbon  | _Find your community all over the city._ Neighbourhood stickers         |
| 0:36 | Belong  | _Walk in where you already belong._                                     |
| 0:40 | Invite  | The second drop: name, slogan, invite and the illustration credit       |

## The pro cut

`pro.html?t=14` and `?play` work the same way.

| Time | Scene   | On screen                                                                                                        |
| ---- | ------- | ---------------------------------------------------------------------------------------------------------------- |
| 0:00 | Open    | _There’s so much queer life all over Lisbon. Ever wish you knew more of it?_ Glass chips drift                   |
| 0:06 | Gather  | _Now you can._ The chips collapse into one point                                                                 |
| 0:08 | Name    | _Introducing_, then the point opens into a ring and the name tracks in with its slogan                           |
| 0:12 | Board   | All six cards on one tilted board; the camera visits each for four seconds, its headline typing in as it arrives |
| 0:38 | All     | _All of it, in one place._ The camera pulls back to the whole board                                              |
| 0:40 | Network | _Everyone here is vouched for. So there’s always someone in common._ A vouch tree grows; one branch lights up    |
| 0:46 | Lisbon  | _And they’re all over the city._ The people from the tree fly to their neighbourhoods on a dot map               |
| 0:50 | Promise | _No ads._ rolls to _No algorithm._, then _Just your people._ and the five promises                               |
| 0:54 | Belong  | _Walk in where you already belong._                                                                              |
| 0:56 | Invite  | The name, the slogan, the invite and the illustration credit                                                     |

The map is stylised on purpose: the riverfront and the neighbourhood pins
use real coordinates, but there are no streets. A street map needs
OpenStreetMap data, which this environment couldn't reach.

## The vouched cut

`vouch.html?t=15` and `?play` work the same way.

| Time | Scene   | On screen                                                                                                                           |
| ---- | ------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 0:00 | Open    | _Everyone here came in through a friend._ Faces pop in around the line                                                              |
| 0:06 | Invite  | _A friend invites you._ Bilal’s invite to Inês, his vouch note typing in, then sent                                                 |
| 0:12 | Portal  | _And walks you in._ The two friends walk hand in hand into a QueerPulse portal                                                      |
| 0:18 | Welcome | _A quick hello from the team._ A short check-in and the Code of Conduct, ticked off                                                 |
| 0:22 | Profile | _You arrive already knowing people._ The portal opens into Inês’s profile: vouched in by Bilal, and the three people they both know |
| 0:30 | Weight  | _A vouch means someone stands behind you._ The camera pushes in on Bilal’s vouch                                                    |
| 0:34 | Forward | _Then you bring a friend._ Inês invites Sam; a small tree draws Bilal, Inês, Sam                                                    |
| 0:42 | Network | _Everyone here is vouched for. So there’s always someone in common._ The small tree pulls back into the big one                     |
| 0:48 | Invite  | The name, the slogan, _Know someone here? Ask them to invite you._ and the illustration credit                                      |

## The cast

`avatars/cast.json` sets every person's look explicitly (skin tone, hair,
glasses, facial hair, pronouns) so the cast stays broad on purpose, and
`avatars/generate.mjs` redraws the SVGs from it. The art is DiceBear's
"Micah" style, based on Avatar Illustration System by Micah Lanier, licensed
CC BY 4.0: **credit it wherever the film is published.** Café Norte is a
made-up venue on purpose; showing a real venue as "visited in person" needs
its agreement.

Colours mirror `src/styles/tokens/colors.css` by hand, as the OG-image
generator does, because this renders outside the token pipeline.
