# AGENTS.md

Guidance for AI coding agents working in this repository (GitHub Game Off 2026 entry).

## Project overview

- **Engine:** Phaser 4 (stable, **4.2.1** installed) written in TypeScript (`typescript@^7` as a dev dependency).
- **Build tool:** Vite 6. Dev server runs on port **5500** and opens the browser automatically.
- **Package manager:** Yarn (`yarn.lock` is committed — don't add a `package-lock.json`).
- **Entry point:** `index.html` loads `src/main.ts`, which mounts the game into `#game-container`.

## Commands

```bash
yarn install     # install dependencies
yarn dev         # start Vite dev server at http://localhost:5500
yarn build       # production build to dist/ (with sourcemaps)
yarn preview     # serve the production build
npx tsc --noEmit # type-check (no lint/test scripts exist yet)
```

VS Code launch configs in `.vscode/launch.json` attach Edge to `localhost:5500`.

## Directory layout

```
src/
  main.ts          # Game config + Boot scene; registers other scenes
  PhaserGlobal.ts  # Exposes the global `Phaser` (the ESM build doesn't); imported first by main.ts
  scenes/          # One Phaser.Scene subclass per file (Menu, Game, End, Preload)
  component/       # Reusable GameObjects / Containers (panels, Button, TextField, Theme...)
  data/            # Story data types and content (SampleData.ts is placeholder; logs.json and
                   # badges.json hold the logs and writer badge names, edited with the log editor)
  state/           # GameState (time, placements, locks, batches, save), Clock helpers and EditorState
assets/            # Images and fonts, loaded by relative path 'assets/...'
  fonts/           # .ttf fonts and bitmap fonts (.png + .xml pairs)
docs/              # Design references (not loaded by the game)
  gui-mockup.webp  # Main game screen GUI mockup
```

New scenes go in `src/scenes/`, new reusable game objects in `src/component/`.

## GUI mockup

`docs/gui-mockup.webp` is the layout reference for the main game screen (1920×1080):

- **Left column:** map panel on top ("Map Goes Here"); below it a tabbed panel with **Users**, **Rooms** and **Symbols** tabs.
- **Two log panels** side by side in the middle. Each has a header with the log ID (e.g. "Log ID #1"), a room dropdown (e.g. "Room ID 435 (Entryway)"), and **lock room** / **lock time** toggle buttons; the log content fills the area below.
- **Right side:** vertical timeline columns, one per room, each headed by its room ID (e.g. "Room 1111", "Room 5555") and running top to bottom from about 12AM to 7AM. Coloured blocks show when each log was recorded in that room (e.g. Log 1 and Log 3 in red, Log 2 in blue). The mockup shows two variants side by side, separated by a narrow blank column: a compact one with only the rooms that have logs (1111, 5555), and a full one with every room (1111, 2222, 3333, 4444, 5555), where rooms with no logs are empty.

## Game setup

- Native resolution is **1920×1080** (HD), scaled with `Scale.FIT` and centered. `pixelArt` is off, so text and lines render smoothly. Design all layout at that resolution and position things relative to `this.cameras.main.width / height`, not hard-coded screen pixels.
- Graphics are deliberately simple: flat panels, lines, boxes and text (mostly `Phaser.GameObjects.Graphics`, rectangles and text objects). Keep text large enough to stay readable when the game is scaled down to smaller windows.
- The look is a futuristic "glass HUD": translucent dark-blue panels with cut corners and glowing cyan edges over a desktop wallpaper (night sky, planet, grid floor). All colours and text styles live in `component/Theme.ts`; take colours from there rather than hard-coding them.
  - Draw panel frames with `Glass.panel(g, x, y, w, h)` and glowing outlines with `Glass.glowRect(...)` (`component/Glass.ts`). Use `Theme.panelAlpha`-style alpha fills, not opaque ones, so the wallpaper shows through.
  - Full-screen scenes add `new Wallpaper(this)` first in `create()` (`component/Wallpaper.ts`). The game background colour is `#040814`.
  - Titles get a neon glow with `Theme.glowText(text)`.
- Scene flow: `Boot` → `PreloadScene` → `MenuScene` → `GameScene` (investigation) → `EndScene`. Shared progress lives in a `GameState` stored in `this.registry` under `'state'`.
  - `Boot` (in `main.ts`) loads only what the preloader itself needs (`DG` logo, `pixel` bitmap font), then registers the other scenes with `this.scene.add(key, Class)` and starts `PreloadScene`.
  - `PreloadScene` shows the logo/loading bar, queues all game assets in `preload()`, and starts `MenuScene` from the loader's `complete` event.
  - When adding a scene, register it in `Boot.create()` the same way.
- **Log editor (dev only):** `yarn dev` then open `localhost:5500/?editor`. `PreloadScene` starts `LogEditorScene` instead of `MenuScene` when `import.meta.env.DEV` and the `editor` URL flag are set. It edits `src/data/logs.json` and saves it through a dev-only Vite middleware (`POST /__editor/save` in `vite.config.ts`). Edit logs there rather than by hand, so overlaps and other problems are checked.
- Text is drawn with the `pixel` bitmap font (`this.add.bitmapText(x, y, 'pixel', text)`); `munro` is also loaded as a web font.

## Coding conventions

Follow the style already in the codebase:

- **Language:** TypeScript with `strict` on (but `strictPropertyInitialization` off). `noUnusedLocals` / `noUnusedParameters` are enabled — remove unused variables and imports rather than leaving them.
- **Classes:** one exported class per file, file named after the class in **PascalCase** (`MenuScene.ts` → `export class MenuScene`). Use named exports, not default exports.
- **Scenes:** extend `Phaser.Scene`; scene keys match the class name (`"MenuScene"`). Implement the lifecycle methods `preload()`, `create()`, `update()` as needed.
- **Components:** extend a Phaser GameObject (typically `Phaser.GameObjects.Container`), take `scene: Phaser.Scene` in the constructor, build children in a `create()` method, and call `this.scene.add.existing(this)`.
- **Fields:** declare GameObject references as typed class fields without initializers, e.g. `loadingBar: Phaser.GameObjects.Graphics;`.
- **Naming:** `camelCase` for variables, methods and fields; `PascalCase` for classes; asset keys are short strings (`'DG'`, `'pixel'`, `'munro'`).
- **Phaser global:** only `main.ts` does `import Phaser from "phaser"`; scene and component files reference the global `Phaser` namespace without importing it. Keep that pattern.
- **Imports:** relative paths without extensions (`./scenes/MenuScene`). The `@` alias maps to `/src` in Vite but isn't used yet.
- **Quotes:** double quotes for imports, scene keys and event names (`"complete"`, `"progress"`); single quotes for asset keys, asset paths and display strings.
- **Formatting:** 4-space indentation, semicolons, `{` on the same line. Files use CRLF line endings (Windows). Arrow functions for event/timer callbacks so `this` stays bound to the scene.
- **Colours:** hex numbers for Phaser graphics (`0xffffff`), CSS strings for config/text (`"#2f2f2f"`).
- Prefer `const`/`let` over `var` in new code.

## Assets

- Load via relative paths: `this.load.image('key', 'assets/foo.png')`.
- Bitmap fonts are an image + XML (BMFont) pair: `this.load.bitmapFont('pixel', 'assets/fonts/pixel_0.png', 'assets/fonts/pixel.xml')`.
- The `pixel` bitmap font and `DG` logo were made for the old 400×300 setup. Scale them up with `setScale()` in integer steps, or replace them with HD versions.

## Working rules for agents

- Run `npx tsc --noEmit` (and `yarn build` for larger changes) before reporting work as done.
- Don't commit `node_modules/`, `dist/`, `.vite/` or `.vscode/` (see `.gitignore`).
- Don't upgrade Phaser or Vite unless asked. This project uses Phaser 4, whose APIs differ from Phaser 3 — check the Phaser 4 docs/typings (`node_modules/phaser/types`) rather than relying on Phaser 3 examples.
- Keep changes small and in the style above; there's no linter or formatter configured, so match surrounding code by hand.

## Git workflow

Each agent works on its own branch and finishes with a pull request. Never commit directly to `main`.

1. **Branch:** start from an up-to-date `main` and create a new branch for the task:
   ```bash
   git switch main
   git pull
   git switch -c <short-kebab-case-name>   # e.g. data-overlap-checker
   ```
   One branch per task. Don't reuse another agent's branch or work on top of someone else's uncommitted changes. If the working tree is dirty when you start, stop and ask instead of stashing, discarding or committing those changes.
2. **Work:** make the changes on that branch only. Before committing, run `npx tsc --noEmit`, plus `yarn build` for larger changes.
3. **Commit:** stage only the files you changed (`git add <paths>`, not `git add -A`). Write a short, imperative, sentence-case commit message, e.g. `Add data checker for overlapping logs per room`. Split unrelated changes into separate commits.
4. **Push and open a PR:** the remote is `origin` (`DavidMurt/Gameoff.2026`) and PRs target `main`:
   ```bash
   git push -u origin <branch-name>
   gh pr create --base main --title "<summary>" --body "<what changed and how it was tested>"
   ```
   The PR description should say what changed, why, and how it was verified (type-check, build, manual run in `yarn dev`).
5. **Don't merge:** leave review and merging to a human. Don't force-push to `main` or delete other branches.
6. **Keep `AGENTS.md` current:** if your change adds folders, scenes or conventions, update this file in the same PR.
