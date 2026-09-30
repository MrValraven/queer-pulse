# QueerPulse launch film

A 67-second 1080p launch film, built as code. The picture is an HTML
composition (`scene.html`), the music is synthesised (`score.js`), and both
are rendered frame-accurately by Chromium and encoded with ffmpeg. Nothing
here is licensed stock: the screens are the real app in demo mode, the type is
the app's own Fraunces and DM Sans, and the score is generated from scratch.

## Render it

```sh
node scripts/launch-video/capture.mjs   # shoot the app screens → .cache/shots
node scripts/launch-video/render.mjs    # → out/queerpulse-launch.mp4
```

Needs `ffmpeg` with libx264 on `PATH` (or `FFMPEG=/path/to/ffmpeg`). If
Playwright's own Chromium isn't installed, point `CHROMIUM_PATH` at one.

`render.mjs` options: `--fps 60` for a smoother master, `--from 19 --to 34` to
render a slice, `--workers 4` to use more cores, `--score-only` to write just
`out/score.wav`. A full 30 fps render takes about 12 minutes on 4 cores.

## Work on it

Open `scene.html` through any static server rooted at the repo (it loads fonts
from `node_modules` and screens from `.cache/shots`):

- `scene.html?t=21.5` shows that exact frame
- `scene.html?play` plays it in real time, without sound

Every frame is a pure function of time (`window.seek(t)`), so what you scrub
is what renders. Scenes start on bar lines of the 100 BPM score (a bar is
2.4s); `window.CUES` exposes the moments the music plays to (network nodes
joining, trust cards landing, each feature change), so moving a cue in the
picture moves its note too.

## The cut

| Time | Scene         | Line                                                                                   |
| ---- | ------------- | -------------------------------------------------------------------------------------- |
| 0:00 | Pulse         | The coral dot beats like a heart; the mark draws itself. _Live in Lisboa._             |
| 0:05 | Scattered     | The homepage's "why we built this" voices; _scattered across group chats…_ blows apart |
| 0:14 | We built      | _We built the community we wanted to find._                                            |
| 0:19 | So we built   | Eight real screens, one every three beats; cinema and studio marked _Soon_             |
| 0:34 | Vouch network | _Everyone here arrived through someone._ The network grows node by node                |
| 0:43 | Trust         | _Invite-only. Vouched for. No ads, no algorithm._ The five assurances                  |
| 0:50 | Lisbon        | _A queer network, rooted in Lisbon_, over a row of phone screens                       |
| 0:58 | Belong        | _Walk in where you already belong._ The mark gathers, then the lockup                  |

Copy comes from `src/shared/i18n/catalogs/en/homepage.ts` wherever a line
exists there. Colours mirror `src/styles/tokens/colors.css` by hand, as the
OG-image generator does, because this renders outside the token pipeline.
