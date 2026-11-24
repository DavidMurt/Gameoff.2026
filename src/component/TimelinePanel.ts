import { Clock } from "../state/Clock";
import { GameState } from "../state/GameState";
import { Theme } from "./Theme";
import { TimelineDraw } from "./TimelineDraw";

// The narrow timeline on the right: one column for each viewer's room. Click it to jump in time.
export class TimelinePanel extends Phaser.GameObjects.Container {
    static readonly colTop = 110;
    static readonly colW = 46;

    gs: GameState;
    w: number;
    h: number;
    colH: number;
    graphics: Phaser.GameObjects.Graphics;
    timeG: Phaser.GameObjects.Graphics;
    labels: Phaser.GameObjects.Text[] = [];

    constructor(scene: Phaser.Scene, x: number, y: number, w: number, h: number, state: GameState) {
        super(scene, x, y);
        this.gs = state;
        this.w = w;
        this.h = h;
        this.colH = h - TimelinePanel.colTop - 40;
        this.create();
    }

    columnX(i: number): number {
        return 48 + i * (TimelinePanel.colW + 8);
    }

    create() {
        const frame = this.scene.add.graphics();
        frame.fillStyle(Theme.panel, 1);
        frame.fillRect(0, 0, this.w, this.h);
        frame.lineStyle(3, Theme.border, 1);
        frame.strokeRect(0, 0, this.w, this.h);
        const title = this.scene.add.text(12, 18, 'TIMELINE', Theme.style(18));
        const footer = this.scene.add.text(10, this.h - 28, 'VIEWER 1 / 2', Theme.style(13, Theme.textDim));
        this.graphics = this.scene.add.graphics();
        this.timeG = this.scene.add.graphics();
        const zone = this.scene.add.zone(0, TimelinePanel.colTop, this.w, this.colH).setOrigin(0)
            .setInteractive({ useHandCursor: true });
        zone.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
            const r = this.gs.range();
            const localY = pointer.y - this.y - TimelinePanel.colTop;
            this.gs.setSystemTime(r.start + localY / this.colH * (r.end - r.start));
        });
        this.add([frame, title, footer, this.graphics, this.timeG, zone]);
        this.scene.add.existing(this);

        const rebuild = () => this.rebuild();
        this.gs.on("logsChanged", rebuild);
        this.gs.on("viewerChanged", rebuild);
        this.gs.on("batchChanged", rebuild);
        this.gs.on("timeChanged", () => this.drawTime());
        this.rebuild();
    }

    rebuild() {
        this.labels.forEach((l) => l.destroy());
        this.labels = [];
        const g = this.graphics;
        g.clear();
        const r = this.gs.range();
        const ppm = this.colH / (r.end - r.start);
        const top = TimelinePanel.colTop;

        for (let m = r.start; m <= r.end; m += 60) {
            this.addLabel(6, top + (m - r.start) * ppm, Clock.hourLabel(m), 12, Theme.textDim).setOrigin(0, 0.5);
        }
        [0, 1].forEach((i) => {
            const x = this.columnX(i);
            TimelineDraw.drawColumn(g, x, top, TimelinePanel.colW, this.colH, r.start, r.end);
            g.fillStyle(Theme.viewerColors[i], 1);
            g.fillRect(x, 64, TimelinePanel.colW, 6);
            const roomId = this.gs.viewerRoom(i);
            if (!roomId) {
                return;
            }
            this.addLabel(x + 2, 78, roomId, 15, Theme.text);
            this.gs.placedLogsInRoom(roomId).forEach((log) => {
                const ls = this.gs.logState(log.id);
                const y = top + (ls.time! - r.start) * ppm;
                const color = TimelineDraw.blockColor(this.gs, log.id);
                TimelineDraw.drawBlock(g, x + 3, y, TimelinePanel.colW - 6, log.duration * ppm, color,
                    ls.roomLocked && ls.timeLocked);
                this.addLabel(x + 6, y + 3, log.id, 12, Theme.text);
            });
        });
        this.drawTime();
    }

    addLabel(x: number, y: number, text: string, size: number, color: string): Phaser.GameObjects.Text {
        const label = this.scene.add.text(x, y, text, Theme.style(size, color));
        this.add(label);
        this.labels.push(label);
        return label;
    }

    drawTime() {
        const r = this.gs.range();
        const y = TimelinePanel.colTop + (this.gs.systemTime - r.start) * this.colH / (r.end - r.start);
        this.timeG.clear();
        TimelineDraw.drawTimeLine(this.timeG, 4, this.w - 4, y);
        this.timeG.fillStyle(Theme.systemTime, 1);
        this.timeG.fillTriangle(4, y - 6, 4, y + 6, 12, y);
    }
}
