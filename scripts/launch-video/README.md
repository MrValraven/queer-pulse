# QueerPulse launch film

A 65-second 1080p launch film, built as code. The picture is an HTML
composition (`scene.html`), the music is synthesised (`score.js`), and both
are rendered frame-accurately by Chromium and encoded with ffmpeg. The product
appears as six designed moments recreated in the app's own design language,
with the demo's content, and every person in the film has an illustrated
avatar (`avatars/`).

## Render it

```sh
node scripts/launch-video/render.mjs    # → out/queerpulse-launch.mp4
```

Needs `ffmpeg` with libx264 on `PATH` (or `FFMPEG=/path/to/ffmpeg`). If
Playwright's own Chromium isn't installed, point `CHROMIUM_PATH` at one.

`render.mjs` options: `--fps 60` for a smoother master, `--from 19 --to 34` to
render a slice, `--workers 4` to use more cores, `--score-only` to write just
`out/score.wav`. A full 30 fps render takes about 10 minutes on 4 cores.

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
