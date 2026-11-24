import { Theme } from "./Theme";

// Drawing helpers for the see-through "glass" panels: a translucent fill, cut corners and a glowing edge.
export class Glass {
    static readonly cut = 16;

    // Outline with the top-right and bottom-left corners cut off.
    static shape(x: number, y: number, w: number, h: number, cut: number): Phaser.Math.Vector2[] {
        return [
            new Phaser.Math.Vector2(x, y),
            new Phaser.Math.Vector2(x + w - cut, y),
            new Phaser.Math.Vector2(x + w, y + cut),
            new Phaser.Math.Vector2(x + w, y + h),
            new Phaser.Math.Vector2(x + cut, y + h),
            new Phaser.Math.Vector2(x, y + h - cut)
        ];
    }

    static panel(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number,
        alpha: number = Theme.panelAlpha, cut: number = Glass.cut) {
        const points = Glass.shape(x, y, w, h, cut);
        g.fillStyle(Theme.panel, alpha);
        g.fillPoints(points, true);
        Glass.edge(g, points, Theme.border);
        // Bright accents on the two square corners.
        g.lineStyle(3, Theme.borderBright, 1);
        g.lineBetween(x, y + 1, x + 44, y + 1);
        g.lineBetween(x + w - 1, y + h, x + w - 1, y + h - 44);
    }

    // A glowing outline: two faint wide strokes under a thin bright one.
    static edge(g: Phaser.GameObjects.Graphics, points: Phaser.Math.Vector2[], color: number) {
        g.lineStyle(8, color, 0.05);
        g.strokePoints(points, true, true);
        g.lineStyle(4, color, 0.12);
        g.strokePoints(points, true, true);
        g.lineStyle(1.5, color, 0.75);
        g.strokePoints(points, true, true);
    }

    // A glowing rectangle (buttons, map rooms, highlighted blocks).
    static glowRect(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, color: number,
        width = 1.5, alpha = 0.75) {
        g.lineStyle(width + 6, color, 0.06);
        g.strokeRect(x, y, w, h);
        g.lineStyle(width + 2, color, 0.14);
        g.strokeRect(x, y, w, h);
        g.lineStyle(width, color, alpha);
        g.strokeRect(x, y, w, h);
    }
}
