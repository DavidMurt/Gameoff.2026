import { SampleData } from "../data/SampleData";
import { Clock } from "../state/Clock";
import { EditorState } from "../state/EditorState";
import { Glass } from "./Glass";
import { Theme } from "./Theme";
import { TimelineDraw } from "./TimelineDraw";

interface Drag {
    move: number;
    moved: boolean;
}

// Log editor, Characters tab: where everyone is over the whole shift. One column per character, top to bottom in time,
// coloured by room (hidden from the proximity sensors = faint with a dashed edge, outside the building = empty).
// Ticks on the right of a column mark the minutes the character speaks in a log: red when that log is in a different
// room from where the chart puts them (fine for a radio or phone call, otherwise a mistake).
// Click a column to select the character and the move under the pointer, drag a move's top edge to change its time,
// double-click to add a move there.
export class EditorWhereabouts extends Phaser.GameObjects.Container {
    static readonly labelW = 54;
    static readonly headerH = 50;
    static readonly footerH = 34;
    static readonly grabPx = 6;
    static readonly doubleClickMs = 350;

    editor: EditorState;
    w: number;
    h: number;
    g: Phaser.GameObjects.Graphics;
    labels: Phaser.GameObjects.Container;
    hoverText: Phaser.GameObjects.Text;
    zone: Phaser.GameObjects.Zone;
    drag: Drag | null = null;
    hover: { col: number; minute: number } | null = null;
    lastClick = { time: 0, col: -1 };

    constructor(scene: Phaser.Scene, x: number, y: number, w: number, h: number, editor: EditorState) {
        super(scene, x, y);
        this.w = w;
        this.h = h;
        this.editor = editor;
        this.create();
    }

    get colW(): number {
        return (this.w - EditorWhereabouts.labelW - 8) / Math.max(1, this.editor.badges.length);
    }

    get ppm(): number {
        return (this.h - EditorWhereabouts.headerH - EditorWhereabouts.footerH) / SampleData.shiftLength;
    }

    // A room's colour on the chart, spread round the colour wheel by its place in the room list.
    roomColor(id: string): number {
        const i = this.editor.rooms.findIndex((r) => r.id === id);
        if (i < 0) {
            return Theme.incorrect;
        }
        const c = Phaser.Display.Color.HSVToRGB((i * 0.618034) % 1, 0.5, 0.85) as Phaser.Types.Display.ColorObject;
        return c.color;
    }

    create() {
        const bg = this.scene.add.graphics();
        Glass.panel(bg, 0, 0, this.w, this.h, 0.4);
        this.g = this.scene.add.graphics();
        this.labels = this.scene.add.container(0, 0);
        const left = EditorWhereabouts.labelW;
        const top = EditorWhereabouts.headerH;
        this.add([bg, this.g, this.labels]);
        for (let m = 0; m <= SampleData.shiftLength; m += 60) {
            this.add(this.scene.add.text(left - 8, top + m * this.ppm, Clock.format(m), Theme.style(15, Theme.textDim)).setOrigin(1, 0.5));
        }
        this.hoverText = this.scene.add.text(12, this.h - EditorWhereabouts.footerH / 2, '', Theme.style(15)).setOrigin(0, 0.5);
        this.zone = this.scene.add.zone(left, top, this.w - left - 8, this.h - top - EditorWhereabouts.footerH).setOrigin(0).setInteractive();
        this.add([this.hoverText, this.zone]);

        this.zone.on("pointerdown", (pointer: Phaser.Input.Pointer) => this.pointerDown(pointer));
        this.zone.on("pointermove", (pointer: Phaser.Input.Pointer) => {
            this.hover = this.at(pointer);
            this.refresh();
        });
        this.zone.on("pointerout", () => {
            this.hover = null;
            this.refresh();
        });
        this.scene.input.on("pointermove", (pointer: Phaser.Input.Pointer) => this.dragTo(pointer));
        this.scene.input.on("pointerup", () => this.drag = null);
        this.editor.on("dataChanged", () => this.refresh());
        this.editor.on("selectionChanged", () => this.refresh());
        this.refresh();
        this.scene.add.existing(this);
    }

    // Character column and minute under a pointer.
    at(pointer: Phaser.Input.Pointer): { col: number; minute: number } {
        const col = Math.floor((pointer.x - this.x - EditorWhereabouts.labelW) / this.colW);
        const minute = (pointer.y - this.y - EditorWhereabouts.headerH) / this.ppm;
        return {
            col: Phaser.Math.Clamp(col, 0, this.editor.badges.length - 1),
            minute: Phaser.Math.Clamp(minute, 0, SampleData.shiftLength - 1)
        };
    }

    pointerDown(pointer: Phaser.Input.Pointer) {
        const { col, minute } = this.at(pointer);
        const def = this.editor.badges[col];
        if (!def) {
            return;
        }
        const now = pointer.downTime;
        if (now - this.lastClick.time < EditorWhereabouts.doubleClickMs && this.lastClick.col === col) {
            this.editor.selectBadge(def.id);
            this.editor.addMove(minute);
            this.lastClick.time = 0;
            return;
        }
        this.lastClick = { time: now, col };
        // Grabbing a move's top edge starts a drag; otherwise select the move whose stretch was clicked.
        const moves = def.moves ?? [];
        const grab = moves.findIndex((m) => Math.abs(this.editor.minutes(m.at) - minute) * this.ppm <= EditorWhereabouts.grabPx);
        if (grab >= 0) {
            this.editor.selectBadge(def.id, grab);
            this.drag = { move: grab, moved: false };
            return;
        }
        let under: number | null = null;
        moves.forEach((m, i) => {
            if (this.editor.minutes(m.at) <= minute) {
                under = i;
            }
        });
        this.editor.selectBadge(def.id, under);
    }

    dragTo(pointer: Phaser.Input.Pointer) {
        if (!this.drag || !pointer.isDown) {
            return;
        }
        const minute = Math.round((pointer.y - this.y - EditorWhereabouts.headerH) / this.ppm);
        if (!this.drag.moved) {
            this.editor.checkpoint();
            this.drag.moved = true;
        }
        this.editor.setMoveTime(this.drag.move, minute, false);
    }

    refresh() {
        const g = this.g;
        g.clear();
        this.labels.removeAll(true);
        const left = EditorWhereabouts.labelW;
        const top = EditorWhereabouts.headerH;
        const colW = this.colW;
        const ppm = this.ppm;
        const bodyH = SampleData.shiftLength * ppm;

        this.editor.badges.forEach((def, col) => {
            const x = left + col * colW;
            const selected = def.id === this.editor.selectedBadge;
            TimelineDraw.drawColumn(g, x + 1, top, colW - 2, bodyH, 0, SampleData.shiftLength);
            const bad = this.editor.badgeProblems(def).length > 0;
            this.labels.add(this.scene.add.text(x + colW / 2, 4, def.id, Theme.style(14, bad ? Theme.textRed : Theme.text)).setOrigin(0.5, 0));
            const name = def.note.slice(0, Math.max(3, Math.floor((colW - 2) / 7)));
            this.labels.add(this.scene.add.text(x + colW / 2, 22, name + (def.invisible ? '*' : ''),
                Theme.style(12, def.invisible ? Theme.textAmber : Theme.textDim)).setOrigin(0.5, 0));

            // Stays, coloured by room.
            this.editor.stays(def).forEach((stay) => {
                const y = top + stay.from * ppm;
                const h = (stay.to - stay.from) * ppm;
                const color = this.roomColor(stay.room);
                g.fillStyle(color, stay.invisible ? 0.2 : 0.8);
                g.fillRect(x + 4, y, colW - 8, h);
                if (stay.invisible) {
                    TimelineDraw.dashedRect(g, x + 4, y, colW - 8, h, color);
                }
                g.lineStyle(1, Theme.background, 1);
                g.lineBetween(x + 4, y, x + colW - 4, y);
                if (h >= 14 && colW >= 30) {
                    this.labels.add(this.scene.add.text(x + 7, y + 1, stay.room, Theme.style(11, stay.invisible ? Theme.text : Theme.textDark)));
                }
            });

            // Ticks where they speak in a log; red when the log's room isn't where they are.
            const stays = this.editor.stays(def);
            this.editor.logs.forEach((log) => log.entries.forEach((e) => {
                if (e.badgeId !== def.id) {
                    return;
                }
                const minute = log.timestamp + e.offset;
                const here = stays.find((s) => minute >= s.from && minute < s.to)?.room;
                g.fillStyle(here === log.room ? Theme.white : Theme.incorrect, 1);
                g.fillRect(x + colW - 9, top + minute * ppm - 1, 6, 3);
            }));

            if (selected) {
                g.lineStyle(3, Theme.systemTime, 1);
                g.strokeRect(x + 1, top - 2, colW - 2, bodyH + 4);
                const move = this.editor.selectedMove === null ? undefined : def.moves?.[this.editor.selectedMove];
                if (move) {
                    const y = top + this.editor.minutes(move.at) * ppm;
                    g.lineStyle(4, Theme.systemTime, 1);
                    g.lineBetween(x - 2, y, x + colW + 2, y);
                }
            }
        });

        // Hover: a time line and who is where under the pointer.
        if (this.hover) {
            const def = this.editor.badges[this.hover.col];
            const minute = Math.floor(this.hover.minute);
            g.lineStyle(1, Theme.borderBright, 0.6);
            g.lineBetween(left, top + minute * ppm, this.w - 8, top + minute * ppm);
            const stay = def ? this.editor.stays(def).find((s) => minute >= s.from && minute < s.to) : undefined;
            const where = stay ? this.editor.roomLabel(stay.room) + (stay.invisible ? ' (hidden from sensors)' : '') : 'outside the building';
            this.hoverText.setText(Clock.format(minute) + '  ·  ' + (def ? def.note + ' (' + def.id + '): ' + where : ''));
        } else {
            this.hoverText.setText('click: select · drag a move\'s top edge: change its time · double-click: add a move · * = invisible by default');
            this.hoverText.setColor(Theme.textDim);
            return;
        }
        this.hoverText.setColor(Theme.text);
    }
}
