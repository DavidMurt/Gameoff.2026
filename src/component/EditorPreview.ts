import { LogEntry } from "../data/Types";
import { Clock } from "../state/Clock";
import { EditorState } from "../state/EditorState";
import { Glass } from "./Glass";
import { Theme } from "./Theme";

// Log editor: the two open logs' entries side by side, lined up by clock time, so you can check
// that what happens in one log fits with what happens in the other. Scrolls with the mouse wheel.
export class EditorPreview extends Phaser.GameObjects.Container {
    static readonly gutter = 70;
    static readonly titleH = 30;

    editor: EditorState;
    w: number;
    h: number;
    content: Phaser.GameObjects.Container;
    scroll = 0;

    constructor(scene: Phaser.Scene, x: number, y: number, w: number, h: number, editor: EditorState) {
        super(scene, x, y);
        this.w = w;
        this.h = h;
        this.editor = editor;
        this.create();
    }

    create() {
        const bg = this.scene.add.graphics();
        Glass.panel(bg, 0, 0, this.w, this.h);
        this.content = this.scene.add.container(0, 0);
        this.add([bg, this.content]);

        this.scene.input.on("wheel", (pointer: Phaser.Input.Pointer, _over: unknown, _dx: number, dy: number) => {
            if (this.editor.tab === 'logs' && pointer.x >= this.x && pointer.x < this.x + this.w && pointer.y >= this.y && pointer.y < this.y + this.h) {
                this.scroll = Math.max(0, this.scroll + Math.sign(dy) * 2);
                this.refresh();
            }
        });
        this.editor.on("dataChanged", () => this.refresh());
        this.editor.on("selectionChanged", () => {
            this.scroll = 0;
            this.refresh();
        });
        this.refresh();
        this.scene.add.existing(this);
    }

    refresh() {
        this.content.removeAll(true);
        const gutter = EditorPreview.gutter;
        const colW = (this.w - gutter - 30) / 2;
        const colX = [gutter, gutter + colW + 20];
        const logs = [this.editor.selected(0), this.editor.selected(1)];

        // Column titles in the editor colours.
        this.content.add(this.scene.add.text(10, 8, 'TIME', Theme.style(15, Theme.textDim)));
        logs.forEach((log, i) => {
            const title = log
                ? 'LOG #' + log.id + '  ' + log.room + '  ' + Clock.format(log.timestamp) + '-' + Clock.format(log.timestamp + log.duration)
                : 'EDITOR ' + (i + 1) + ': no log open';
            const g = this.scene.add.graphics();
            g.fillStyle(Theme.viewerColors[i], 1);
            g.fillRect(colX[i], 10, 6, 16);
            this.content.add(g);
            this.content.add(this.scene.add.text(colX[i] + 14, 8, title, Theme.style(15)));
        });

        // One row per clock minute that has an entry in either log.
        const byMinute = new Map<number, LogEntry[][]>();
        logs.forEach((log, i) => {
            log?.entries.forEach((e) => {
                const minute = log.timestamp + e.offset;
                const row = byMinute.get(minute) ?? [[], []];
                row[i].push(e);
                byMinute.set(minute, row);
            });
        });
        const minutes = [...byMinute.keys()].sort((a, b) => a - b);
        this.scroll = Math.min(this.scroll, Math.max(0, minutes.length - 1));

        let y = EditorPreview.titleH + 6;
        const bottom = this.h - 8;
        for (let r = this.scroll; r < minutes.length; r++) {
            const minute = minutes[r];
            const row = byMinute.get(minute)!;
            const both = row[0].length > 0 && row[1].length > 0;
            const texts = row.map((entries, i) => entries.map((e) => {
                const who = e.badgeId ? this.editor.badgeName(e.badgeId) + ': ' : '';
                const color = e.blank ? Theme.textDim : (e.badgeId ? Theme.text : Theme.textSound);
                return this.scene.add.text(colX[i] + 14, 0, e.blank ? '(blank line)' : who + e.text, Theme.style(15, color))
                    .setWordWrapWidth(colW - 14);
            }));
            const heights = texts.map((list) => list.reduce((sum, t) => sum + t.height + 2, 0));
            const rowH = Math.max(...heights, 18);
            if (y + rowH > bottom) {
                texts.flat().forEach((t) => t.destroy());
                this.content.add(this.scene.add.text(10, y, '... ' + (minutes.length - r) + ' more minutes (scroll)', Theme.style(14, Theme.textDim)));
                break;
            }
            const line = this.scene.add.graphics();
            line.lineStyle(1, Theme.grid, 1);
            line.lineBetween(4, y - 3, this.w - 4, y - 3);
            this.content.add(line);
            // Amber time when both logs have something in the same minute.
            this.content.add(this.scene.add.text(10, y, Clock.format(minute), Theme.style(15, both ? Theme.textAmber : Theme.textDim)));
            texts.forEach((list, i) => {
                let ty = y;
                list.forEach((t) => {
                    t.setY(ty);
                    ty += t.height + 2;
                    this.content.add(t);
                });
                if (list.length > 0) {
                    const bar = this.scene.add.graphics();
                    bar.fillStyle(Theme.viewerColors[i], 0.8);
                    bar.fillRect(colX[i], y + 1, 4, heights[i] - 2);
                    this.content.add(bar);
                }
            });
            y += rowH + 6;
        }
        if (minutes.length === 0) {
            this.content.add(this.scene.add.text(10, y, 'No entries in the open logs.', Theme.style(15, Theme.textDim)));
        }
    }
}
