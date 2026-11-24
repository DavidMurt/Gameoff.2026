import { Log } from "../data/Types";
import { Clock } from "../state/Clock";
import { EditorState } from "../state/EditorState";
import { Button } from "./Button";
import { Theme } from "./Theme";

// Log editor: every log grouped by batch, with New / Copy / Delete below. Scrolls with the mouse wheel.
// Left-click opens a log in editor 1, right-click in editor 2. Coloured bars show which editor has it open.
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

    constructor(scene: Phaser.Scene, x: number, y: number, w: number, h: number, editor: EditorState) {
        super(scene, x, y);
        this.w = w;
        this.h = h;
        this.editor = editor;
        this.create();
    }

    create() {
        this.bg = this.scene.add.graphics();
        this.bg.fillStyle(Theme.panel, 1);
        this.bg.fillRect(0, 0, this.w, this.h);
        this.bg.lineStyle(2, Theme.border, 1);
        this.bg.strokeRect(0, 0, this.w, this.h);
        this.rows = this.scene.add.container(0, 0);
        this.add([this.bg, this.rows]);

        const by = this.h + 10;
        const bw = (this.w - 20) / 3;
        this.add(new Button(this.scene, 0, by, bw, EditorLogList.buttonH, 'NEW', () => this.editor.newLog(), 16));
        this.add(new Button(this.scene, bw + 10, by, bw, EditorLogList.buttonH, 'COPY', () => this.editor.duplicate(), 16));
        this.deleteButton = new Button(this.scene, (bw + 10) * 2, by, bw, EditorLogList.buttonH, 'DELETE', () => this.clickDelete(), 16);
        this.add(this.deleteButton);

        this.scene.input.on("wheel", (pointer: Phaser.Input.Pointer, _over: unknown, _dx: number, dy: number) => {
            if (pointer.x >= this.x && pointer.x < this.x + this.w && pointer.y >= this.y && pointer.y < this.y + this.h) {
                this.scroll = Math.max(0, this.scroll + Math.sign(dy) * 3);
                this.refresh();
            }
        });
        this.editor.on("logsChanged", () => this.refresh());
        this.editor.on("selectionChanged", () => this.refresh());
        this.refresh();
        this.scene.add.existing(this);
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
        const items: ({ header: string } | { log: Log })[] = [];
        const logs = this.editor.visibleLogs();
        const batches = [...new Set(logs.map((l) => l.batch))].sort((a, b) => a - b);
        batches.forEach((batch) => {
            const range = EditorState.batchRange(batch);
            const hours = range ? '  ' + Clock.format(range.start) + '-' + Clock.format(range.end) : '';
            items.push({ header: 'BATCH ' + batch + hours });
            logs.filter((l) => l.batch === batch)
                .sort((a, b) => a.timestamp - b.timestamp || a.room.localeCompare(b.room))
                .forEach((log) => items.push({ log }));
        });

        const fit = Math.floor((this.h - 10) / EditorLogList.rowH);
        this.scroll = Math.min(this.scroll, Math.max(0, items.length - fit));
        items.slice(this.scroll, this.scroll + fit).forEach((item, i) => {
            const y = 5 + i * EditorLogList.rowH;
            if ('header' in item) {
                this.rows.add(this.scene.add.text(12, y + EditorLogList.rowH / 2, item.header, Theme.style(16, Theme.textAmber)).setOrigin(0, 0.5));
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
