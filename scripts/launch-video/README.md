# QueerPulse launch film

Three cuts of the launch film, built as code:

- **Cinematic** (`scene.html` + `score.js`): 65 seconds at 100 BPM, slow and
  warm. The rest of this README describes it unless it says otherwise.
- **Upbeat** (`scene-pop.html` + `score-pop.js`): 48 seconds at 120 BPM. Bold
  caps with one italic line, a colour field per feature, sticker pills,
  outlined marquee words and two confetti drops on the name. Same cast, cards
  and promises, so every cut says the same things.
- **Pro** (`scene-pro.html` + `score-pro.js`): 48 seconds at 120 BPM, filmed
  like a product launch. A dark stage with a hairline grid and grain, type
  that rises line by line out of a mask, one camera flying across a board of
  all six cards, a dot-matrix Lisbon, and deep house with interface sound.

The cinematic cut is a 65-second 1080p launch film. The picture is an HTML
composition (`scene.html`), the music is synthesised (`score.js`), and both
are rendered frame-accurately by Chromium and encoded with ffmpeg. The product
appears as six designed moments recreated in the app's own design language,
with the demo's content, and every person in the film has an illustrated
avatar (`avatars/`).

## Render it

```sh
node scripts/launch-video/render.mjs                 # → out/queerpulse-launch.mp4
node scripts/launch-video/render.mjs --variant pop   # → out/queerpulse-launch-pop.mp4
node scripts/launch-video/render.mjs --variant pro   # → out/queerpulse-launch-pro.mp4
```

Needs `ffmpeg` with libx264 on `PATH` (or `FFMPEG=/path/to/ffmpeg`). If
Playwright's own Chromium isn't installed, point `CHROMIUM_PATH` at one.

`render.mjs` options: `--fps 60` for a smoother master, `--from 19 --to 34` to
render a slice, `--workers 4` to use more cores, `--score-only` to write just
`out/score.wav` (`out/score-<variant>.wav` with `--variant`). A full 30 fps render takes about 10 minutes on 4 cores.

A scene can also set two render hints. `window.CAPTURE = "jpeg"` captures
frames as JPEG, much faster for scenes full of grain or soft gradients.
`window.SHUTTER = 4` renders four sub-frames across half of each frame and
averages them: motion blur, so fast camera moves smear like film instead of
strobing. The pro cut uses both; its full render takes about 16 minutes.

## Work on it

Open `scene.html` through any static server rooted at the repo (it loads its
fonts from `node_modules`):

- `scene.html?t=21.5` shows that exact frame
- `scene.html?play` plays it in real time, without sound

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
bar or two). `scene-pop.html?t=9` and `?play` work the same way.

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

`scene-pro.html?t=14` and `?play` work the same way.

| Time | Scene   | On screen                                                                          |
| ---- | ------- | ---------------------------------------------------------------------------------- |
| 0:00 | Open    | _Queer Lisbon is everywhere. Just never in one place._ Glass chips drift           |
| 0:06 | Gather  | _So we gathered it in one place._ The chips collapse into one point                |
| 0:08 | Name    | The point opens into a ring; the name tracks in with its slogan                    |
| 0:12 | Board   | All six cards on one tilted board, then the camera flies to each in turn           |
| 0:26 | All     | _All of it, in one place._ The camera pulls back to the whole board                |
| 0:28 | Network | _Everyone here is vouched for._ A vouch tree in orbit                              |
| 0:32 | Promise | _No ads._ rolls to _No algorithm._, then _Just your people._ and the five promises |
| 0:36 | Lisbon  | _Find your community all over the city._ A dot map with real positions             |
| 0:40 | Belong  | _Walk in where you already belong._                                                |
| 0:42 | Invite  | The name, the slogan, the invite and the illustration credit                       |

The map is stylised on purpose: the riverfront and the neighbourhood pins
use real coordinates, but there are no streets. A street map needs
OpenStreetMap data, which this environment couldn't reach.

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
