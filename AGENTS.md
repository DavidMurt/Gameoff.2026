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
  scenes/          # One Phaser.Scene subclass per file (e.g. MenuScene.ts)
  component/       # Reusable GameObjects / Containers (e.g. LoadThing.ts)
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
- Background colour is `#2f2f2f`; UI uses white (`0xffffff`).
- Scene flow: `Boot` → `PreloadScene` → `MenuScene`.
  - `Boot` (in `main.ts`) loads only what the preloader itself needs (`DG` logo, `pixel` bitmap font), then registers the other scenes with `this.scene.add(key, Class)` and starts `PreloadScene`.
  - `PreloadScene` shows the logo/loading bar, queues all game assets in `preload()`, and starts `MenuScene` from the loader's `complete` event.
  - When adding a scene, register it in `Boot.create()` the same way.
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
