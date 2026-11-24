import { Log } from "../data/Types";
import { Clock } from "../state/Clock";
import { EditorState } from "../state/EditorState";
import { Button } from "./Button";
import { Glass } from "./Glass";
import { Theme } from "./Theme";

// Log editor: every log grouped by batch, with New / Copy / Delete below. Scrolls with the mouse wheel.
// Clicking a batch header opens rows that move the batch's start and end hours.
// Left-click opens a log in editor 1 (to edit), right-click in editor 2 (read-only). Coloured bars show which editor has it open.
export class EditorLogList extends Phaser.GameObjects.Container {
    static readonly rowH = 32;
    static readonly buttonH = 40;

    editor: EditorState;
    w: number;
    h: number;
    bg: Phaser.GameObjects.Graphics;
    rows: Phaser.GameObjects.Container;
    deleteButton: Button;
    deleteTimer: Phaser.Time.TimerEvent | null = null;
    scroll = 0;
    openBatch: number | null = null;

    constructor(scene: Phaser.Scene, x: number, y: number, w: number, h: number, editor: EditorState) {
        super(scene, x, y);
        this.w = w;
        this.h = h;
        this.editor = editor;
        this.create();
    }

    create() {
        this.bg = this.scene.add.graphics();
        Glass.panel(this.bg, 0, 0, this.w, this.h);
        this.rows = this.scene.add.container(0, 0);
        this.add([this.bg, this.rows]);

        const by = this.h + 10;
        const bw = (this.w - 20) / 3;
        this.add(new Button(this.scene, 0, by, bw, EditorLogList.buttonH, 'NEW', () => this.editor.newLog(), 16));
        this.add(new Button(this.scene, bw + 10, by, bw, EditorLogList.buttonH, 'COPY', () => this.editor.duplicate(), 16));
        this.deleteButton = new Button(this.scene, (bw + 10) * 2, by, bw, EditorLogList.buttonH, 'DELETE', () => this.clickDelete(), 16);
        this.add(this.deleteButton);

        this.scene.input.on("wheel", (pointer: Phaser.Input.Pointer, _over: unknown, _dx: number, dy: number) => {
            if (this.editor.tab === 'logs' && pointer.x >= this.x && pointer.x < this.x + this.w && pointer.y >= this.y && pointer.y < this.y + this.h) {
                this.scroll = Math.max(0, this.scroll + Math.sign(dy) * 3);
                this.refresh();
            }
        });
        this.editor.on("dataChanged", () => this.refresh());
        this.editor.on("selectionChanged", () => this.refresh());
        this.refresh();
        this.scene.add.existing(this);
    }

    // "BATCH 1  06:00-07:00": click to show or hide the rows that change its hours.
    addHeader(batch: number, y: number) {
        const range = this.editor.batchRange(batch);
        const hours = range ? '  ' + Clock.format(range.start) + '-' + Clock.format(range.end) : '  no hours';
        const open = this.openBatch === batch;
        const header = new Button(this.scene, 5, y, this.w - 10, EditorLogList.rowH - 2, (open ? '▾ ' : '▸ ') + 'BATCH ' + batch + hours, () => {
            this.openBatch = open ? null : batch;
            this.refresh();
        }, 16);
        header.label.setOrigin(0, 0.5).setX(8).setColor(Theme.textAmber);
        this.rows.add(header);
    }

    // "START  [-] 06:00 [+]": moves the batch's start or end by an hour.
    addTimeRow(batch: number, which: 'start' | 'end', y: number) {
        const range = this.editor.batchRange(batch)!;
        const mid = y + EditorLogList.rowH / 2;
        this.rows.add(this.scene.add.text(24, mid, which.toUpperCase(), Theme.style(15, Theme.textDim)).setOrigin(0, 0.5));
        const bw = 34;
        const right = this.w - 10;
        this.rows.add(new Button(this.scene, right - bw * 2 - 80, y + 1, bw, EditorLogList.rowH - 4, '−',
            () => this.editor.setBatchTime(batch, which, -1), 18));
        this.rows.add(this.scene.add.text(right - bw - 40, mid, Clock.format(which === 'start' ? range.start : range.end),
            Theme.style(16)).setOrigin(0.5));
        this.rows.add(new Button(this.scene, right - bw, y + 1, bw, EditorLogList.rowH - 4, '+',
            () => this.editor.setBatchTime(batch, which, 1), 18));
    }

    // Delete needs a second click within two seconds.
    clickDelete() {
        if (this.deleteTimer) {
            this.deleteTimer.remove();
            this.deleteTimer = null;
            this.deleteButton.setText('DELETE');
            this.editor.remove();
            return;
        }
        this.deleteButton.setText('CONFIRM?');
        this.deleteTimer = this.scene.time.delayedCall(2000, () => {
            this.deleteTimer = null;
            this.deleteButton.setText('DELETE');
        });
    }

    refresh() {
        this.rows.removeAll(true);
        const items: ({ header: number } | { batch: number; which: 'start' | 'end' } | { log: Log })[] = [];
        const logs = this.editor.visibleLogs();
        const filter = this.editor.batchFilter;
        const batches = this.editor.batchNumbers().filter((b) => filter === null || b === filter);
        batches.forEach((batch) => {
            items.push({ header: batch });
            if (this.openBatch === batch && this.editor.batchRange(batch)) {
                items.push({ batch, which: 'start' }, { batch, which: 'end' });
            }
            logs.filter((l) => l.batch === batch)
                .sort((a, b) => a.timestamp - b.timestamp || a.room.localeCompare(b.room))
                .forEach((log) => items.push({ log }));
        });

        const fit = Math.floor((this.h - 10) / EditorLogList.rowH);
        this.scroll = Math.min(this.scroll, Math.max(0, items.length - fit));
        items.slice(this.scroll, this.scroll + fit).forEach((item, i) => {
            const y = 5 + i * EditorLogList.rowH;
            if ('header' in item) {
                this.addHeader(item.header, y);
                return;
            }
            if ('which' in item) {
                this.addTimeRow(item.batch, item.which, y);
                return;
            }
            const log = item.log;
            const text = '#' + log.id.padEnd(4) + log.room + ' ' + Clock.format(log.timestamp) + ' ' + String(log.duration).padStart(3) + 'm';
            const row = new Button(this.scene, 5, y, this.w - 10, EditorLogList.rowH - 2, text,
                (pointer) => this.editor.select(log.id, pointer.rightButtonDown() ? 1 : 0), 15);
            row.label.setOrigin(0, 0.5).setX(18);
            row.setToggled(log.id === this.editor.selectedId);
            this.rows.add(row);
            // A bar per editor that has this log open.
            this.editor.selectedIds.forEach((id, slot) => {
                if (id === log.id) {
                    const bar = this.scene.add.graphics();
                    bar.fillStyle(Theme.viewerColors[slot], 1);
                    bar.fillRect(7 + slot * 6, y + 3, 5, EditorLogList.rowH - 8);
                    this.rows.add(bar);
                }
            });
            if (this.editor.problems(log).length > 0) {
                this.rows.add(this.scene.add.text(this.w - 22, y + EditorLogList.rowH / 2 - 1, '!', Theme.style(20, Theme.textRed))
                    .setOrigin(0.5).setFontStyle('bold'));
            }
        });
    }
}
