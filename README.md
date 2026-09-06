# Water Polo — Pool / Play

A browser water polo game against a CPU team, updated on 6 September 2026.

[Play the private online game](https://pool-play-water-polo.zhenwyap.chatgpt.site) (owner account sign-in required).

## Current game

- Full-viewport 3D pool, swimmers, goals, animated water, and ball flight.
- Overhead, broadcast, end-line, and first-person cameras.
- Mobile joystick and overlaid action buttons, plus keyboard controls.
- Seven players per team, four quick 90-second quarters, 28-second possession, and 18-second attacking rebounds.
- Goal-area checks, goalkeeper saves, and possession restarts. Contact, match timing, and other rules are simplified; this is not a full regulation simulator.

## Run locally

Requires Node.js 22.13 or newer and npm.

```sh
npm ci
npm run dev
```

Open the localhost address printed in the terminal. Press Control+C in that terminal to stop the server.

```sh
npm run build
node --test tests/*.test.mjs
npx tsc --noEmit
```

## Controls

| Action | Desktop | Touch |
| --- | --- | --- |
| Swim | WASD or arrow keys | Left joystick |
| Switch swimmer | Q | Switch |
| Pass | E | Pass |
| Shoot | Hold and release Space | Hold and release Shoot |
| Steal | F | Steal |
| Pause | P or Escape | Pause |
| Aim | Mouse position; drag to look in first-person | Slide on Shoot; drag the pool to look in first-person |

Choose the view in the camera menu. First-person follows the selected swimmer, and movement follows the direction the camera faces.

## Preserved previous version

The earlier `water_polo_project` is preserved in [`archive/pre-2026-09-06/`](archive/pre-2026-09-06/), including the original HTML game, browser sources, screenshots, README, and Swift/Xcode prototype.

The original root Git history remains intact. The iOS prototype's separate Git history is also preserved in `archive/pre-2026-09-06/ios-prototype-history.bundle`. Its original Git metadata remains locally under the root repository's `.git/local-archives/` directory. No earlier game source was discarded.

The current version retains attacking-formation and acceleration ideas from that earlier prototype. See the in-game “Rules & inspiration” panel for rule adaptations and the official source.
