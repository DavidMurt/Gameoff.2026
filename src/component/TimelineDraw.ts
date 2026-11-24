import { GameState } from "../state/GameState";
import { Glass } from "./Glass";
import { Theme } from "./Theme";

// Drawing helpers shared by the room/timeline panel and the timeline panel.
export class TimelineDraw {

    static drawColumn(g: Phaser.GameObjects.Graphics, x: number, top: number, w: number, h: number,
        start: number, end: number) {
        const ppm = h / (end - start);
        g.fillStyle(Theme.panelLight, 0.3);
        g.fillRect(x, top, w, h);
        for (let m = start; m <= end; m += 15) {
            const y = top + (m - start) * ppm;
            g.lineStyle(1, m % 60 === 0 ? Theme.gridHour : Theme.grid, 0.8);
            g.lineBetween(x, y, x + w, y);
        }
        g.lineStyle(1.5, Theme.border, 0.5);
        g.strokeRect(x, top, w, h);
    }

    static blockColor(state: GameState, logId: string): number {
        const ls = state.logState(logId);
        if (ls.complete) {
            return Theme.complete;
        }
        if (state.checking.has(logId)) {
            return Theme.checking;
        }
        if (ls.verified) {
            return Theme.incorrect;
        }
        return Theme.block;
    }

    // Solid when both locks are set, dashed otherwise.
    static drawBlock(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number,
        color: number, solid: boolean) {
        g.fillStyle(color, 0.25);
        g.fillRect(x, y, w, h);
        if (solid) {
            Glass.glowRect(g, x, y, w, h, color, 3, 1);
        } else {
            TimelineDraw.dashedRect(g, x, y, w, h, color);
        }
    }

    // A bright frame around the active log, just outside its block.
    static drawActive(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number) {
        Glass.glowRect(g, x - 3, y - 3, w + 6, h + 6, Theme.active, 2, 1);
    }

    static dashedRect(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, color: number) {
        g.lineStyle(2, color, 1);
        const dash = 7;
        const gap = 5;
        const line = (x1: number, y1: number, x2: number, y2: number) => {
            const len = Math.hypot(x2 - x1, y2 - y1);
            const dx = (x2 - x1) / len;
            const dy = (y2 - y1) / len;
            for (let d = 0; d < len; d += dash + gap) {
                const e = Math.min(d + dash, len);
                g.lineBetween(x1 + dx * d, y1 + dy * d, x1 + dx * e, y1 + dy * e);
            }
        };
        line(x, y, x + w, y);
        line(x + w, y, x + w, y + h);
        line(x + w, y + h, x, y + h);
        line(x, y + h, x, y);
    }

    static drawTimeLine(g: Phaser.GameObjects.Graphics, x1: number, x2: number, y: number) {
        g.lineStyle(8, Theme.systemTime, 0.12);
        g.lineBetween(x1, y, x2, y);
        g.lineStyle(2, Theme.systemTime, 1);
        g.lineBetween(x1, y, x2, y);
    }
}
