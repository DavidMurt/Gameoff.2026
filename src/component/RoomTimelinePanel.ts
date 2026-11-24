import { Log, Room } from "../data/Types";
import { Clock } from "../state/Clock";
import { GameState } from "../state/GameState";
import { Button } from "./Button";
import { Glass } from "./Glass";
import { Theme } from "./Theme";
import { TimelineDraw } from "./TimelineDraw";

interface DragInfo {
    log: Log;
    block: Phaser.GameObjects.Container;
    graphics: Phaser.GameObjects.Graphics;
    grabX: number;
    grabY: number;
    startX: number;
    startY: number;
    pointerX: number;
    pointerY: number;
    movable: boolean;
    right: boolean;
}

// "ALL ROOMS": the unplaced column plus one timeline column per audio room. Logs are dragged here.
export class RoomTimelinePanel extends Phaser.GameObjects.Container {
    static readonly colTop = 110;
    static readonly unplacedX = 66;
    static readonly unplacedW = 100;
    static readonly roomsX = 180;
    static readonly colW = 74;
    static readonly stride = 86;
    static readonly cardH = 64;

    gs: GameState;
    w: number;
    h: number;
    colH: number;
    visibleCount: number;
    scrollIndex = 0;
    dynamic: Phaser.GameObjects.GameObject[] = [];
    timeG: Phaser.GameObjects.Graphics;
    timeLabel: Phaser.GameObjects.Text;
    leftButton: Button;
    rightButton: Button;
    drag: DragInfo | null = null;
    pendingRebuild = false;

    constructor(scene: Phaser.Scene, x: number, y: number, w: number, h: number, state: GameState,
        onSwap: () => void) {
        super(scene, x, y);
        this.gs = state;
        this.w = w;
        this.h = h;
        this.colH = h - RoomTimelinePanel.colTop - 50;
        this.visibleCount = Math.floor((w - 12 - RoomTimelinePanel.roomsX) / RoomTimelinePanel.stride);
        this.create(onSwap);
    }

    create(onSwap: () => void) {
        const frame = this.scene.add.graphics();
        Glass.panel(frame, 0, 0, this.w, this.h);
        const title = Theme.glowText(this.scene.add.text(16, 12, 'ALL ROOMS', Theme.titleStyle(22)));
        this.leftButton = new Button(this.scene, this.w - 300, 12, 40, 40, '◀', () => this.scroll(-1), 18);
        this.rightButton = new Button(this.scene, this.w - 252, 12, 40, 40, '▶', () => this.scroll(1), 18);
        const swap = new Button(this.scene, this.w - 200, 12, 186, 40, '⇄ MAP', onSwap, 18);
        const hint = this.scene.add.text(16, this.h - 38,
            'grid = 15 min · solid = both locked · dashed = not fully locked · drag logs between rooms and times\n' +
            'left click: viewer 1 · right click: viewer 2 · click the hour labels to jump in time',
            Theme.style(13, Theme.textDim));
        this.add([frame, title, this.leftButton, this.rightButton, swap, hint]);
        this.scene.add.existing(this);

        this.timeG = this.scene.add.graphics().setDepth(400);
        this.timeLabel = this.scene.add.text(0, 0, '', Theme.style(14, Theme.textDark)).setOrigin(0, 0.5).setDepth(401);

        const rebuild = () => this.requestRebuild();
        this.gs.on("logsChanged", rebuild);
        this.gs.on("viewerChanged", rebuild);
        this.gs.on("namesChanged", rebuild);
        this.gs.on("batchChanged", rebuild);
        this.gs.on("panelChanged", rebuild);
        this.gs.on("timeChanged", () => this.drawTime());
        this.rebuild();
    }

    get shown(): boolean {
        return this.gs.leftPanel === 'rooms';
    }

    // Absolute screen coordinates of the column area.
    get colTopY(): number {
        return this.y + RoomTimelinePanel.colTop;
    }

    get ppm(): number {
        const r = this.gs.range();
        return this.colH / (r.end - r.start);
    }

    roomColumnX(index: number): number {
        return this.x + RoomTimelinePanel.roomsX + (index - this.scrollIndex) * RoomTimelinePanel.stride;
    }

    visibleRooms(): { room: Room; index: number }[] {
        return this.gs.audioRooms()
            .map((room, index) => ({ room, index }))
            .filter((r) => r.index >= this.scrollIndex && r.index < this.scrollIndex + this.visibleCount);
    }

    scroll(delta: number) {
        const max = Math.max(0, this.gs.audioRooms().length - this.visibleCount);
        this.scrollIndex = Phaser.Math.Clamp(this.scrollIndex + delta, 0, max);
        this.rebuild();
    }

    requestRebuild() {
        if (this.drag) {
            this.pendingRebuild = true;
        } else {
            this.rebuild();
        }
    }

    rebuild() {
        this.pendingRebuild = false;
        this.dynamic.forEach((o) => o.destroy());
        this.dynamic = [];
        this.setVisible(this.shown);
        if (!this.shown) {
            this.drawTime();
            return;
        }
        const max = Math.max(0, this.gs.audioRooms().length - this.visibleCount);
        this.leftButton.setEnabled(this.scrollIndex > 0);
        this.rightButton.setEnabled(this.scrollIndex < max);

        const r = this.gs.range();
        const ppm = this.ppm;
        const top = this.colTopY;
        const g = this.scene.add.graphics();
        this.dynamic.push(g);

        // Hour labels, which also work as a time picker.
        for (let m = r.start; m <= r.end; m += 60) {
            const label = this.scene.add.text(this.x + 8, top + (m - r.start) * ppm, Clock.hourLabel(m),
                Theme.style(14, Theme.textDim)).setOrigin(0, 0.5);
            this.dynamic.push(label);
        }
        const hourZone = this.scene.add.zone(this.x + 4, top, 58, this.colH).setOrigin(0)
            .setInteractive({ useHandCursor: true });
        hourZone.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
            this.gs.setSystemTime(r.start + (pointer.y - top) / ppm);
        });
        this.dynamic.push(hourZone);

        // Unplaced column.
        const ux = this.x + RoomTimelinePanel.unplacedX;
        g.fillStyle(Theme.panelLight, 0.4);
        g.fillRect(ux, top, RoomTimelinePanel.unplacedW, this.colH);
        g.lineStyle(1.5, Theme.border, 0.6);
        g.strokeRect(ux, top, RoomTimelinePanel.unplacedW, this.colH);
        this.dynamic.push(this.scene.add.text(ux, top - 30, 'UNPLACED', Theme.style(16)));
        this.dynamic.push(this.scene.add.text(ux + 6, top + this.colH - 22, 'batch ' + this.gs.currentBatch,
            Theme.style(13, Theme.textDim)));

        // Room columns.
        this.visibleRooms().forEach(({ room, index }) => {
            const cx = this.roomColumnX(index);
            TimelineDraw.drawColumn(g, cx, top, RoomTimelinePanel.colW, this.colH, r.start, r.end);
            [0, 1].forEach((i) => {
                if (this.gs.viewerRoom(i) === room.id) {
                    g.fillStyle(Theme.viewerColors[i], 1);
                    g.fillRect(cx + i * RoomTimelinePanel.colW / 2, top - 50, RoomTimelinePanel.colW / 2, 6);
                }
            });
            this.dynamic.push(this.scene.add.text(cx + 2, top - 40, room.id, Theme.style(16)));
            const note = this.gs.roomNotes[room.id] ?? '';
            this.dynamic.push(this.scene.add.text(cx + 2, top - 20, note.slice(0, 8), Theme.style(12, Theme.textDim)));
            const zone = this.scene.add.zone(cx, top - 50, RoomTimelinePanel.colW, this.colH + 50).setOrigin(0)
                .setInteractive({ useHandCursor: true });
            zone.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
                this.gs.setViewer(pointer.rightButtonDown() ? 1 : 0, { kind: 'room', id: room.id });
            });
            this.dynamic.push(zone);

            this.gs.placedLogsInRoom(room.id).forEach((log) => {
                const t = this.gs.logState(log.id).time!;
                this.createBlock(log, cx, top + (t - r.start) * ppm, RoomTimelinePanel.colW, log.duration * ppm);
            });
        });

        this.gs.unplacedLogs().forEach((log, i) => {
            this.createBlock(log, ux + 8, top + 8 + i * (RoomTimelinePanel.cardH + 8),
                RoomTimelinePanel.unplacedW - 16, RoomTimelinePanel.cardH);
        });

        this.drawTime();
    }

    drawBlockGraphics(g: Phaser.GameObjects.Graphics, log: Log, w: number, h: number, valid = true) {
        const ls = this.gs.logState(log.id);
        g.clear();
        const color = valid ? TimelineDraw.blockColor(this.gs, log.id) : Theme.incorrect;
        TimelineDraw.drawBlock(g, 0, 0, w, h, color, ls.roomLocked && ls.timeLocked);
    }

    createBlock(log: Log, x: number, y: number, w: number, h: number) {
        const ls = this.gs.logState(log.id);
        const block = this.scene.add.container(x, y);
        const g = this.scene.add.graphics();
        this.drawBlockGraphics(g, log, w, h);
        const placed = ls.room !== undefined;
        const label = placed ? 'Log ' + log.id : 'Log ' + log.id + '\n' + log.duration + ' min';
        const text = this.scene.add.text(6, 4, label, Theme.style(14));
        const locks = (ls.roomLocked ? 'R' : '') + (ls.timeLocked ? 'T' : '');
        const lockText = this.scene.add.text(w - 4, 4, ls.complete ? '✓' : locks, Theme.style(13, Theme.textDim))
            .setOrigin(1, 0);
        const zone = this.scene.add.zone(0, 0, w, h).setOrigin(0).setInteractive({ useHandCursor: true });
        block.add([g, text, lockText, zone]);
        this.dynamic.push(block);

        this.scene.input.setDraggable(zone);
        zone.on("dragstart", (pointer: Phaser.Input.Pointer) => {
            const movable = !ls.complete && !this.gs.checking.has(log.id) && !pointer.rightButtonDown();
            this.drag = {
                log, block, graphics: g, grabX: pointer.x - block.x, grabY: pointer.y - block.y,
                startX: block.x, startY: block.y, pointerX: pointer.x, pointerY: pointer.y,
                movable, right: pointer.rightButtonDown()
            };
            if (movable) {
                block.setDepth(500);
                if (!placed) {
                    // Show the log at its real size while it is dragged out of the unplaced column.
                    const fullH = log.duration * this.ppm;
                    this.drawBlockGraphics(g, log, RoomTimelinePanel.colW, fullH);
                    zone.setSize(RoomTimelinePanel.colW, fullH);
                    text.setText('Log ' + log.id);
                    lockText.setX(RoomTimelinePanel.colW - 4);
                    this.drag.grabX = RoomTimelinePanel.colW / 2;
                    this.drag.grabY = 12;
                }
            }
        });
        // Plain clicks (and right clicks, which never start a drag) open the log in a viewer.
        zone.on("pointerup", (pointer: Phaser.Input.Pointer) => {
            if (!this.drag && pointer.getDistance() < 6) {
                this.openInViewer(log, pointer.button === 2 ? 1 : 0);
            }
        });
        zone.on("drag", (pointer: Phaser.Input.Pointer) => this.onDrag(pointer));
        zone.on("dragend", (pointer: Phaser.Input.Pointer) => this.onDragEnd(pointer));
    }

    // Where a dragged block would land: the column under the pointer and the snapped time.
    dropTarget(d: DragInfo, pointer: Phaser.Input.Pointer): { kind: 'unplaced' } | { kind: 'room'; room: string; x: number; time: number } | null {
        const ls = this.gs.logState(d.log.id);
        const r = this.gs.range();
        const px = ls.roomLocked ? d.startX + RoomTimelinePanel.colW / 2 : pointer.x;
        const ux = this.x + RoomTimelinePanel.unplacedX;
        if (px >= ux && px < ux + RoomTimelinePanel.unplacedW) {
            return { kind: 'unplaced' };
        }
        const target = this.visibleRooms().find(({ index }) => {
            const cx = this.roomColumnX(index);
            return px >= cx - 6 && px < cx + RoomTimelinePanel.stride - 6;
        });
        if (!target) {
            return null;
        }
        let time: number;
        if (ls.timeLocked && ls.time !== undefined) {
            time = ls.time;
        } else {
            const raw = r.start + (pointer.y - d.grabY - this.colTopY) / this.ppm;
            time = Phaser.Math.Clamp(Math.round(raw / 15) * 15, r.start, r.end - d.log.duration);
        }
        return { kind: 'room', room: target.room.id, x: this.roomColumnX(target.index), time };
    }

    onDrag(pointer: Phaser.Input.Pointer) {
        const d = this.drag;
        if (!d || !d.movable) {
            return;
        }
        const target = this.dropTarget(d, pointer);
        if (target && target.kind === 'room') {
            const valid = this.gs.canPlace(d.log.id, target.room, target.time);
            d.block.setPosition(target.x, this.colTopY + (target.time - this.gs.range().start) * this.ppm);
            this.drawBlockGraphics(d.graphics, d.log, RoomTimelinePanel.colW, d.log.duration * this.ppm, valid);
        } else {
            d.block.setPosition(pointer.x - d.grabX, pointer.y - d.grabY);
        }
    }

    onDragEnd(pointer: Phaser.Input.Pointer) {
        const d = this.drag;
        this.drag = null;
        if (!d) {
            return;
        }
        const ls = this.gs.logState(d.log.id);
        const moved = Math.hypot(pointer.x - d.pointerX, pointer.y - d.pointerY) >= 6;
        if (!moved) {
            this.openInViewer(d.log, d.right ? 1 : 0);
        } else if (d.movable) {
            const target = this.dropTarget(d, pointer);
            if (target && target.kind === 'unplaced') {
                if (ls.room !== undefined) {
                    this.gs.unplace(d.log.id);
                }
            } else if (target && target.kind === 'room') {
                this.gs.moveLog(d.log.id, target.room, target.time);
            }
        }
        this.rebuild();
    }

    openInViewer(log: Log, viewer: number) {
        const ls = this.gs.logState(log.id);
        if (ls.room === undefined) {
            this.gs.setViewer(viewer, { kind: 'log', id: log.id });
        } else {
            this.gs.setViewer(viewer, { kind: 'room', id: ls.room });
            this.gs.setSystemTime(ls.time!);
        }
    }

    drawTime() {
        this.timeG.clear();
        this.timeLabel.setVisible(this.shown);
        if (!this.shown) {
            return;
        }
        const r = this.gs.range();
        const y = this.colTopY + (this.gs.systemTime - r.start) * this.ppm;
        TimelineDraw.drawTimeLine(this.timeG, this.x + 4, this.x + this.w - 4, y);
        this.timeG.fillStyle(Theme.systemTime, 1);
        this.timeG.fillRect(this.x + 4, y - 10, 56, 20);
        this.timeLabel.setPosition(this.x + 8, y).setText(Clock.format(this.gs.systemTime));
    }
}
