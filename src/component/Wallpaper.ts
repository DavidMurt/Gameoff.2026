import { Theme } from "./Theme";

// The "desktop" behind the glass panels: night sky glows, stars, a planet, a horizon and a perspective grid floor.
export class Wallpaper extends Phaser.GameObjects.Container {
    w: number;
    h: number;

    constructor(scene: Phaser.Scene) {
        super(scene, 0, 0);
        this.w = scene.cameras.main.width;
        this.h = scene.cameras.main.height;
        this.create();
    }

    create() {
        const g = this.scene.add.graphics();
        const w = this.w;
        const h = this.h;
        const horizon = Math.round(h * 0.56);

        g.fillStyle(Theme.background, 1);
        g.fillRect(0, 0, w, h);
        this.glow(g, w * 0.78, h * 0.18, 760, 0x3878ff, 0.45);
        this.glow(g, w * 0.08, h * 0.95, 640, 0xff40a0, 0.3);

        const rnd = new Phaser.Math.RandomDataGenerator(['nightshift']);
        for (let i = 0; i < 180; i++) {
            g.fillStyle(0xcfefff, rnd.realInRange(0.15, 0.7));
            g.fillCircle(rnd.between(0, w), rnd.between(0, horizon), rnd.realInRange(0.6, 1.6));
        }

        this.planet(g, w * 0.9, h * 0.12, 560);

        // Horizon glow.
        g.lineStyle(60, 0x50c8ff, 0.04);
        g.lineBetween(0, horizon, w, horizon);
        g.lineStyle(18, 0x50c8ff, 0.08);
        g.lineBetween(0, horizon, w, horizon);
        g.lineStyle(2, 0xa0f0ff, 0.6);
        g.lineBetween(0, horizon, w, horizon);

        // Grid floor: rows get further apart towards the viewer, columns meet at the horizon.
        for (let y = horizon + 14, step = 14; y < h; step *= 1.35, y += step) {
            g.lineStyle(1, Theme.border, Math.min(0.4, 0.06 + (y - horizon) / (h - horizon) * 0.34));
            g.lineBetween(0, y, w, y);
        }
        const vx = w / 2;
        for (let bx = -w * 3; bx <= w * 4; bx += 160) {
            g.lineStyle(1, Theme.border, 0.22);
            g.lineBetween(vx + (bx - vx) * 0.04, horizon + (h - horizon) * 0.04, bx, h);
        }

        this.add(g);
        this.scene.add.existing(this);
    }

    // Graphics has no radial gradient, so stack faint circles: the centre gets the most layers.
    glow(g: Phaser.GameObjects.Graphics, x: number, y: number, radius: number, color: number, alpha: number) {
        const steps = 28;
        for (let i = 0; i < steps; i++) {
            g.fillStyle(color, alpha / steps);
            g.fillCircle(x, y, radius * (1 - i / steps));
        }
    }

    planet(g: Phaser.GameObjects.Graphics, x: number, y: number, r: number) {
        this.glow(g, x, y, r * 1.3, 0x5090ff, 0.35);
        const dark = Phaser.Display.Color.ValueToColor(0x070d22);
        const light = Phaser.Display.Color.ValueToColor(0x3b6bd6);
        const steps = 32;
        for (let i = 0; i < steps; i++) {
            const t = i / steps;
            const c = Phaser.Display.Color.Interpolate.ColorWithColor(dark, light, steps, i);
            // Each layer is smaller and shifted towards the lit (lower left) side, but stays inside the planet.
            g.fillStyle(Phaser.Display.Color.GetColor(c.r, c.g, c.b), 1);
            g.fillCircle(x - r * 0.35 * t, y + r * 0.35 * t, r * (1 - 0.85 * t));
        }
        g.lineStyle(3, 0x8cdcff, 0.4);
        g.strokeCircle(x, y, r);
        g.lineStyle(2, 0x8cdcff, 0.18);
        g.strokeCircle(x, y, r + 70);
    }
}
