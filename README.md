# Water Polo — Pool / Play

A browser water polo game against a CPU team, updated on 6 September 2026.

[Play the private online game](https://pool-play-water-polo.zhenwyap.chatgpt.site) (owner account sign-in required).

## Current game

- Surrounding stadium with tiered stands, spectators, team-coloured seats, and floodlights; tactical cameras cut away nearby stands to keep the pool visible.
- Full-viewport 3D pool with local swimmer wakes, buoyant ball movement, and water drag.
- Human-proportioned swimmers with facial features, water-polo caps, jointed elbows and knees, crawl strokes, and eggbeater kicks.
- Upright goalkeepers tread water, raise their hands, and lunge sideways or upward with visible recovery.
- Shot-power feedback and touch controls inspired by mobile sports games.
- Overhead, broadcast, end-line, and first-person cameras.
- Desktop first-person mouse-look with mouse capture and crosshair aiming.
- Easy (default), Normal, and Hard CPU difficulty: distinct swimming speed, goalkeeper reactions, shot accuracy, and steal timing. Choose before a match or press Escape/P to change it while paused; restarts keep your choice.
- Steals only succeed within the ball carrier’s forward 90-degree cone; side and rear tackles fail.
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
| Aim | Mouse position; move mouse to look in first-person | Slide on Shoot; drag the pool to look in first-person |

On a computer, choose **First person** in the camera menu, start the match, and move the mouse to look around. Starting, resuming, restarting, or switching into first-person automatically captures and hides the desktop mouse for continuous turning without screen edges. Click the pool to retry if the browser requires another click. Press **Escape** to pause and release the mouse; resume to capture it again. If mouse capture is unavailable, moving the mouse over the pool still turns the view. WASD/arrow keys swim, E passes, and holding/releasing Space shoots toward the crosshair. Touch devices retain the joystick, action buttons, and drag-to-look controls.

Choose the view in the camera menu. First-person follows the selected swimmer, and movement follows the direction the camera faces.

## Preserved previous version

The earlier `water_polo_project` is preserved in [`archive/pre-2026-09-06/`](archive/pre-2026-09-06/), including the original HTML game, browser sources, screenshots, README, and Swift/Xcode prototype.

The original root Git history remains intact. The iOS prototype's separate Git history is also preserved in `archive/pre-2026-09-06/ios-prototype-history.bundle`. Its original Git metadata remains locally under the root repository's `.git/local-archives/` directory. No earlier game source was discarded.

The current version retains attacking-formation and acceleration ideas from that earlier prototype. See the in-game “Rules & inspiration” panel for rule adaptations and the official source.
