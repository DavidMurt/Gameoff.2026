import { Clock } from "../state/Clock";
import { GameState } from "../state/GameState";
import { Settings } from "../state/Settings";
import { Button } from "./Button";
import { Glass } from "./Glass";
import { Theme } from "./Theme";
import { TimelineDraw } from "./TimelineDraw";

// The narrow timeline on the right: one column for each viewer's room. Click, or click and drag, to move system time.
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
    scrubbing = false;

    constructor(scene: Phaser.Scene, x: number, y: number, w: number, h: number, state: GameState) {
        super(scene, x, y);
        this.gs = state;
        this.w = w;
        this.h = h;
        this.colH = h - TimelinePanel.colTop - 84;
        this.create();
    }

    columnX(i: number): number {
        return 48 + i * (TimelinePanel.colW + 8);
    }

    create() {
        const frame = this.scene.add.graphics();
        Glass.panel(frame, 0, 0, this.w, this.h);
        const title = Theme.glowText(this.scene.add.text(12, 18, 'TIMELINE', Theme.titleStyle(16)));
        const footer = this.scene.add.text(10, this.h - 74, 'VIEWER 1 / 2', Theme.style(13, Theme.textDim));
        const wheel = new Button(this.scene, 8, this.h - 50, this.w - 16, 38, this.wheelText(), () => {
            Settings.cycleWheelMinutes();
            wheel.setText(this.wheelText());
        }, 14);
        this.graphics = this.scene.add.graphics();
        this.timeG = this.scene.add.graphics();
        const zone = this.scene.add.zone(0, TimelinePanel.colTop, this.w, this.colH).setOrigin(0)
            .setInteractive({ useHandCursor: true });
        zone.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
            // Clicking in a viewer's column makes its room active, so the log under the pointer becomes active.
            const column = [0, 1].find((i) => {
                const x = this.x + this.columnX(i);
                return pointer.x >= x && pointer.x < x + TimelinePanel.colW;
            });
            const roomId = column === undefined ? null : this.gs.viewerRoom(column);
            if (roomId) {
                this.gs.setActiveRoom(roomId);
            }
            this.scrubbing = true;
            this.scrubTo(pointer);
        });
        // Holding the button down keeps system time under the pointer, even outside the panel.
        this.scene.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
            if (this.scrubbing && pointer.isDown) {
                this.scrubTo(pointer);
            }
        });
        this.scene.input.on("pointerup", () => {
            this.scrubbing = false;
        });
        this.add([frame, title, footer, wheel, this.graphics, this.timeG, zone]);
        this.scene.add.existing(this);

        const rebuild = () => this.rebuild();
        this.gs.on("logsChanged", rebuild);
        this.gs.on("viewerChanged", rebuild);
        this.gs.on("batchChanged", rebuild);
        this.gs.on("activeChanged", rebuild);
        this.gs.on("timeChanged", () => this.drawTime());
        this.rebuild();
    }

    wheelText(): string {
        return 'WHEEL ' + Settings.wheelMinutes + ' MIN';
    }

    scrubTo(pointer: Phaser.Input.Pointer) {
        const r = this.gs.range();
        const localY = pointer.y - this.y - TimelinePanel.colTop;
        this.gs.setSystemTime(r.start + localY / this.colH * (r.end - r.start));
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
            if (roomId === this.gs.activeRoom) {
                Glass.glowRect(g, x, 76, TimelinePanel.colW, 22, Theme.active, 1.5, 0.6);
            }
            this.addLabel(x + 2, 78, roomId, 15, Theme.text);
            this.gs.placedLogsInRoom(roomId).forEach((log) => {
                const ls = this.gs.logState(log.id);
                const y = top + (ls.time! - r.start) * ppm;
                const color = TimelineDraw.blockColor(this.gs, log.id);
                TimelineDraw.drawBlock(g, x + 3, y, TimelinePanel.colW - 6, log.duration * ppm, color,
                    ls.roomLocked && ls.timeLocked);
                if (log.id === this.gs.activeLog) {
                    TimelineDraw.drawActive(g, x + 3, y, TimelinePanel.colW - 6, log.duration * ppm);
                }
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
