import { EditorState } from "../state/EditorState";
import { EditorRoomForm } from "./EditorRoomForm";
import { Glass } from "./Glass";
import { Theme } from "./Theme";

// Log editor, Rooms tab: the facility map as a grid of squares, with corridors as lines between rooms.
// Click a room to select it, drag it to another square to move it (dropping on a room swaps the two),
// shift-click another room to add or remove a corridor to the selected room, double-click an empty square for a new room.
export class EditorRoomMap extends Phaser.GameObjects.Container {
    static readonly titleH = 40;
    static readonly hintH = 34;
    static readonly doubleClickMs = 350;

    editor: EditorState;
    w: number;
    h: number;
    g: Phaser.GameObjects.Graphics;
    labels: Phaser.GameObjects.Container;
    zone: Phaser.GameObjects.Zone;
    drag: { id: string; col: number; row: number } | null = null;
    hover: { col: number; row: number } | null = null;
    lastClick = { time: 0, col: -1, row: -1 };

    constructor(scene: Phaser.Scene, x: number, y: number, w: number, h: number, editor: EditorState) {
        super(scene, x, y);
        this.w = w;
        this.h = h;
        this.editor = editor;
        this.create();
    }

    // The grid always has a free column and row past the last room, so the map can grow.
    get cols(): number {
        return Math.max(4, ...this.editor.rooms.map((r) => r.col + 2));
    }

    get rows(): number {
        return Math.max(4, ...this.editor.rooms.map((r) => r.row + 2));
    }

    get strideX(): number {
        return (this.w - 20) / this.cols;
    }

    get strideY(): number {
        return (this.h - EditorRoomMap.titleH - EditorRoomMap.hintH) / this.rows;
    }

    // Top-left corner and size of a map square's room box.
    cellRect(col: number, row: number): { x: number; y: number; w: number; h: number } {
        const w = this.strideX * 0.78;
        const h = this.strideY * 0.7;
        return {
            x: 10 + col * this.strideX + (this.strideX - w) / 2,
            y: EditorRoomMap.titleH + row * this.strideY + (this.strideY - h) / 2,
            w,
            h
        };
    }

    create() {
        const bg = this.scene.add.graphics();
        Glass.panel(bg, 0, 0, this.w, this.h);
        this.g = this.scene.add.graphics();
        this.labels = this.scene.add.container(0, 0);
        const title = Theme.glowText(this.scene.add.text(16, 10, 'MAP', Theme.titleStyle(20)));
        const hint = this.scene.add.text(16, this.h - 26,
            'click: select · drag: move (drop on a room to swap) · shift-click: corridor to/from the selected room · double-click empty square: new room',
            Theme.style(14, Theme.textDim));
        this.zone = this.scene.add.zone(10, EditorRoomMap.titleH, this.w - 20, this.h - EditorRoomMap.titleH - EditorRoomMap.hintH)
            .setOrigin(0).setInteractive();
        this.add([bg, this.g, this.labels, title, hint, this.zone]);

        this.zone.on("pointerdown", (pointer: Phaser.Input.Pointer) => this.pointerDown(pointer));
        this.zone.on("pointermove", (pointer: Phaser.Input.Pointer) => {
            this.hover = this.cellAt(pointer);
            this.refresh();
        });
        this.zone.on("pointerout", () => {
            this.hover = null;
            this.refresh();
        });
        this.scene.input.on("pointerup", () => this.drop());
        this.editor.on("dataChanged", () => this.refresh());
        this.editor.on("selectionChanged", () => this.refresh());
        this.refresh();
        this.scene.add.existing(this);
    }

    cellAt(pointer: Phaser.Input.Pointer): { col: number; row: number } {
        return {
            col: Phaser.Math.Clamp(Math.floor((pointer.x - this.x - 10) / this.strideX), 0, this.cols - 1),
            row: Phaser.Math.Clamp(Math.floor((pointer.y - this.y - EditorRoomMap.titleH) / this.strideY), 0, this.rows - 1)
        };
    }

    pointerDown(pointer: Phaser.Input.Pointer) {
        const { col, row } = this.cellAt(pointer);
        const room = this.editor.rooms.find((r) => r.col === col && r.row === row);
        const selected = this.editor.selectedRoom;
        if (room && pointer.event.shiftKey && selected && selected !== room.id) {
            this.editor.toggleCorridor(selected, room.id);
            return;
        }
        if (room) {
            this.editor.selectRoom(room.id);
            this.drag = { id: room.id, col, row };
            return;
        }
        const now = pointer.downTime;
        if (now - this.lastClick.time < EditorRoomMap.doubleClickMs && this.lastClick.col === col && this.lastClick.row === row) {
            this.editor.newRoom(col, row);
            this.lastClick.time = 0;
            return;
        }
        this.lastClick = { time: now, col, row };
    }

    // Ends a drag: moves the dragged room to the square under the pointer.
    drop() {
        const drag = this.drag;
        this.drag = null;
        if (!drag || !this.hover || (this.hover.col === drag.col && this.hover.row === drag.row)) {
            return;
        }
        this.editor.selectRoom(drag.id);
        this.editor.setRoomCell(this.hover.col, this.hover.row);
    }

    refresh() {
        const g = this.g;
        g.clear();
        this.labels.removeAll(true);
        const rooms = this.editor.rooms;
        const selected = this.editor.selectedRoom;

        // Empty squares, faintly.
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const r = this.cellRect(col, row);
                g.lineStyle(1, Theme.grid, 0.8);
                g.strokeRect(r.x, r.y, r.w, r.h);
            }
        }

        // Corridors, centre to centre, under the rooms. The selected room's are brighter.
        this.editor.corridors.forEach(([a, b]) => {
            const ra = this.editor.room(a);
            const rb = this.editor.room(b);
            if (!ra || !rb) {
                return;
            }
            const ca = this.cellRect(ra.col, ra.row);
            const cb = this.cellRect(rb.col, rb.row);
            const mine = a === selected || b === selected;
            g.lineStyle(mine ? 6 : 4, mine ? Theme.systemTime : Theme.borderDim, mine ? 0.9 : 0.8);
            g.lineBetween(ca.x + ca.w / 2, ca.y + ca.h / 2, cb.x + cb.w / 2, cb.y + cb.h / 2);
        });

        rooms.forEach((room) => {
            const r = this.cellRect(room.col, room.row);
            const shared = rooms.some((o) => o !== room && o.col === room.col && o.row === room.row);
            g.fillStyle(Theme.panelLight, 0.9);
            g.fillRect(r.x, r.y, r.w, r.h);
            Glass.glowRect(g, r.x, r.y, r.w, r.h, shared ? Theme.incorrect : Theme.border, 1.5, 0.6);
            if (room.id === selected) {
                g.lineStyle(4, Theme.systemTime, 1);
                g.strokeRect(r.x - 3, r.y - 3, r.w + 6, r.h + 6);
            }
            const bad = this.editor.roomProblems(room).length > 0;
            this.labels.add(this.scene.add.text(r.x + 8, r.y + 6, room.id + (bad ? ' !' : ''), Theme.style(18, bad ? Theme.textRed : Theme.text)));
            this.labels.add(this.scene.add.text(r.x + 8, r.y + 30, room.note ?? '', Theme.style(14, Theme.textAmber)).setWordWrapWidth(r.w - 12));
            this.labels.add(this.scene.add.text(r.x + 8, r.y + r.h - 6, 'AUD', Theme.style(13, EditorRoomForm.sensorColor(room.audio)))
                .setOrigin(0, 1));
            this.labels.add(this.scene.add.text(r.x + 44, r.y + r.h - 6, 'PRX', Theme.style(13, EditorRoomForm.sensorColor(room.proximity)))
                .setOrigin(0, 1));
        });

        // Where a dragged room would land.
        if (this.drag && this.hover) {
            const r = this.cellRect(this.hover.col, this.hover.row);
            g.lineStyle(3, Theme.systemTime, 0.8);
            g.strokeRect(r.x - 6, r.y - 6, r.w + 12, r.h + 12);
        } else if (this.hover) {
            const r = this.cellRect(this.hover.col, this.hover.row);
            g.lineStyle(2, Theme.borderBright, 0.35);
            g.strokeRect(r.x - 2, r.y - 2, r.w + 4, r.h + 4);
        }
    }
}
