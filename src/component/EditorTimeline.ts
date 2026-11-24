import { SampleData } from "../data/SampleData";
import { Log } from "../data/Types";
import { Clock } from "../state/Clock";
import { EditorState } from "../state/EditorState";
import { Theme } from "./Theme";
import { TimelineDraw } from "./TimelineDraw";

interface Drag {
    id: string;
    grab: number;       // minutes between the pointer and the log's start
    moved: boolean;
}

// Log editor: one column per audio room across the whole shift. Overlaps are filled red.
// Left-click a block to open it in editor 1, right-click for editor 2. Drag it to change room and time.
// Double-click an empty slot for a new log (in the editor of the button used).
export class EditorTimeline extends Phaser.GameObjects.Container {
    static readonly labelW = 54;
    static readonly headerH = 56;
    static readonly batchColors = [0x4a7ae8, 0xd84848, 0x48c068, 0xc070e0, 0xe09040, 0x40c0c0];
    static readonly doubleClickMs = 350;

    editor: EditorState;
    w: number;
    h: number;
    g: Phaser.GameObjects.Graphics;
    labels: Phaser.GameObjects.Container;
    zone: Phaser.GameObjects.Zone;
    drag: Drag | null = null;
    lastClick = { time: 0, room: '', minute: -1 };

    constructor(scene: Phaser.Scene, x: number, y: number, w: number, h: number, editor: EditorState) {
        super(scene, x, y);
        this.w = w;
        this.h = h;
        this.editor = editor;
        this.create();
    }

    get rooms() {
        return EditorState.audioRooms();
    }

    get colW(): number {
        return (this.w - EditorTimeline.labelW) / this.rooms.length;
    }

    get ppm(): number {
        return (this.h - EditorTimeline.headerH) / SampleData.shiftLength;
    }

    create() {
        this.g = this.scene.add.graphics();
        this.labels = this.scene.add.container(0, 0);
        const left = EditorTimeline.labelW;
        const top = EditorTimeline.headerH;
        this.zone = this.scene.add.zone(left, top, this.w - left, this.h - top).setOrigin(0).setInteractive();
        this.add([this.g, this.labels, this.zone]);

        // Fixed labels: hours down the left, room IDs and writer names across the top.
        for (let m = 0; m <= SampleData.shiftLength; m += 60) {
            this.add(this.scene.add.text(left - 8, top + m * this.ppm, Clock.format(m), Theme.style(15, Theme.textDim)).setOrigin(1, 0.5));
        }
        this.rooms.forEach((room, i) => {
            const cx = left + (i + 0.5) * this.colW;
            this.add(this.scene.add.text(cx, 4, room.id, Theme.style(16)).setOrigin(0.5, 0));
            // Narrow columns: the first two words of the name, one per line, cut to fit.
            const fit = Math.max(3, Math.floor((this.colW - 2) / 6));
            const name = (room.note ?? '').split(' ').slice(0, 2).map((w) => w.slice(0, fit)).join('\n');
            this.add(this.scene.add.text(cx, 24, name, Theme.style(10, Theme.textDim)).setOrigin(0.5, 0).setAlign('center'));
        });

        this.zone.on("pointerdown", (pointer: Phaser.Input.Pointer) => this.pointerDown(pointer));
        this.scene.input.on("pointermove", (pointer: Phaser.Input.Pointer) => this.pointerMove(pointer));
        this.scene.input.on("pointerup", () => this.drag = null);
        this.editor.on("logsChanged", () => this.refresh());
        this.editor.on("selectionChanged", () => this.refresh());
        this.refresh();
        this.scene.add.existing(this);
    }

    // Room column and minute under a pointer (the minute is not snapped).
    at(pointer: Phaser.Input.Pointer): { col: number; minute: number } {
        const col = Math.floor((pointer.x - this.x - EditorTimeline.labelW) / this.colW);
        const minute = (pointer.y - this.y - EditorTimeline.headerH) / this.ppm;
        return { col: Phaser.Math.Clamp(col, 0, this.rooms.length - 1), minute };
    }

    pointerDown(pointer: Phaser.Input.Pointer) {
        const { col, minute } = this.at(pointer);
        const room = this.rooms[col].id;
        const slot = pointer.rightButtonDown() ? 1 : 0;
        const hits = this.editor.visibleLogs().filter((l) => l.room === room && minute >= l.timestamp && minute < l.timestamp + l.duration);
        // Prefer the selected log when blocks are stacked on top of each other.
        const hit = hits.find((l) => l.id === this.editor.selectedIds[slot]) ?? hits[hits.length - 1];
        if (hit) {
            this.editor.select(hit.id, slot);
            this.drag = { id: hit.id, grab: minute - hit.timestamp, moved: false };
            return;
        }
        const slotMinute = Math.floor(minute / 15) * 15;
        const now = pointer.downTime;
        if (now - this.lastClick.time < EditorTimeline.doubleClickMs && this.lastClick.room === room && this.lastClick.minute === slotMinute) {
            this.editor.setActive(slot);
            this.editor.newLog(room, slotMinute);
            this.lastClick.time = 0;
            return;
        }
        this.lastClick = { time: now, room, minute: slotMinute };
    }

    pointerMove(pointer: Phaser.Input.Pointer) {
        if (!this.drag || !pointer.isDown) {
            return;
        }
        const log = this.editor.selected();
        if (!log || log.id !== this.drag.id) {
            return;
        }
        const { col, minute } = this.at(pointer);
        const room = this.rooms[col].id;
        const time = Phaser.Math.Clamp(Math.round((minute - this.drag.grab) / 15) * 15, 0, SampleData.shiftLength - log.duration);
        if (room === log.room && time === log.timestamp) {
            return;
        }
        if (!this.drag.moved) {
            this.editor.checkpoint();
            this.drag.moved = true;
        }
        this.editor.edit((l) => {
            l.room = room;
            l.timestamp = time;
        }, false);
    }

    batchColor(batch: number): number {
        return EditorTimeline.batchColors[(batch - 1) % EditorTimeline.batchColors.length];
    }

    refresh() {
        const g = this.g;
        g.clear();
        this.labels.removeAll(true);
        const left = EditorTimeline.labelW;
        const top = EditorTimeline.headerH;
        const colW = this.colW;
        const ppm = this.ppm;
        const bodyH = this.h - top;
        const selected = this.editor.selected();

        this.rooms.forEach((_room, i) => {
            TimelineDraw.drawColumn(g, left + i * colW + 2, top, colW - 4, bodyH, 0, SampleData.shiftLength);
        });

        // Hours outside the active editor's log batch are greyed out.
        const range = selected ? EditorState.batchRange(selected.batch) : null;
        if (range) {
            g.fillStyle(Theme.background, 0.6);
            g.fillRect(left, top, this.w - left, range.start * ppm);
            g.fillRect(left, top + range.end * ppm, this.w - left, (SampleData.shiftLength - range.end) * ppm);
            g.lineStyle(2, Theme.systemTime, 0.6);
            g.lineBetween(left, top + range.start * ppm, this.w, top + range.start * ppm);
            g.lineBetween(left, top + range.end * ppm, this.w, top + range.end * ppm);
        }

        const logs = this.editor.visibleLogs();
        const blockRect = (log: Log) => {
            const col = this.rooms.findIndex((r) => r.id === log.room);
            return col < 0 ? null : { x: left + col * colW + 6, y: top + log.timestamp * ppm, w: colW - 12, h: log.duration * ppm };
        };
        logs.forEach((log) => {
            const r = blockRect(log);
            if (!r) {
                return;
            }
            TimelineDraw.drawBlock(g, r.x, r.y, r.w, r.h, this.batchColor(log.batch), true);
            const bad = this.editor.problems(log).length > 0;
            this.labels.add(this.scene.add.text(r.x + 4, r.y + 3, '#' + log.id + (bad ? '!' : ''),
                Theme.style(14, bad ? Theme.textRed : Theme.text)));
        });

        // Overlapping time is filled red, across all logs (not just the batch shown).
        this.editor.logs.forEach((log) => {
            this.editor.overlapsWith(log).forEach((other) => {
                const r = blockRect(log);
                if (!r) {
                    return;
                }
                const from = Math.max(log.timestamp, other.timestamp);
                const to = Math.min(log.timestamp + log.duration, other.timestamp + other.duration);
                g.fillStyle(Theme.incorrect, 0.45);
                g.fillRect(r.x, top + from * ppm, r.w, (to - from) * ppm);
            });
        });

        // Each open log gets an outline in its editor's colour; the active editor's is thicker.
        this.editor.selectedIds.forEach((_id, slot) => {
            const log = this.editor.selected(slot);
            const r = log ? blockRect(log) : null;
            if (r) {
                const pad = slot === 1 && log!.id === this.editor.selectedIds[0] ? 7 : 3;
                g.lineStyle(slot === this.editor.active ? 4 : 2, Theme.viewerColors[slot], 1);
                g.strokeRect(r.x - pad, r.y - pad, r.w + pad * 2, r.h + pad * 2);
            }
        });
    }
}
