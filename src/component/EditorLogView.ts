import { Clock } from "../state/Clock";
import { EditorState } from "../state/EditorState";
import { EditorEntryGrid } from "./EditorEntryGrid";
import { EditorLogForm } from "./EditorLogForm";
import { Theme } from "./Theme";

// Log editor: editor 2, a read-only reference log beside the one being edited (right-click a log to show it here).
// A short summary, then the entries as a scrolling read-only table, which ends level with editor 1's.
export class EditorLogView extends Phaser.GameObjects.Container {
    static readonly entriesTop = 200;

    editor: EditorState;
    w: number;
    headerText: Phaser.GameObjects.Text;
    summary: Phaser.GameObjects.Text;
    problemText: Phaser.GameObjects.Text;
    entries: EditorEntryGrid;
    emptyText: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, x: number, y: number, w: number, editor: EditorState) {
        super(scene, x, y);
        this.w = w;
        this.editor = editor;
        this.create();
    }

    create() {
        const header = this.scene.add.graphics();
        header.fillStyle(Theme.viewerColors[1], 0.6);
        header.fillRect(0, 0, this.w, EditorLogForm.headerH);
        this.headerText = this.scene.add.text(10, EditorLogForm.headerH / 2, '', Theme.style(17)).setOrigin(0, 0.5);
        this.summary = this.scene.add.text(0, EditorLogForm.headerH + 12, '', Theme.style(17)).setLineSpacing(6)
            .setWordWrapWidth(this.w);
        this.problemText = this.scene.add.text(0, EditorLogView.entriesTop - 26, '', Theme.style(15));
        this.emptyText = this.scene.add.text(0, EditorLogForm.headerH + 22, 'No reference log.\nRight-click a log to show it here (read-only).',
            Theme.style(18, Theme.textDim));
        this.add([header, this.headerText, this.summary, this.problemText, this.emptyText]);

        const h = EditorLogForm.entriesTop + EditorLogForm.entriesH - EditorLogView.entriesTop;
        this.entries = new EditorEntryGrid(this.scene, this.x, this.y + EditorLogView.entriesTop, this.w, h, this.editor, 1, true);

        this.editor.on("selectionChanged", () => this.refresh());
        this.editor.on("tabChanged", () => this.refresh());
        this.editor.on("dataChanged", () => this.refresh());
        this.refresh();
        this.scene.add.existing(this);
    }

    refresh() {
        const log = this.editor.selected(1);
        this.headerText.setText('EDITOR 2  ·  ' + (log ? 'LOG #' + log.id + '  ·  ' : '') + 'READ ONLY');
        this.emptyText.setVisible(!log);
        this.summary.setVisible(!!log);
        this.problemText.setVisible(!!log);
        // The table is HTML above the canvas, so it is hidden by hand on the other tabs.
        this.entries.setVisible(!!log && this.editor.tab === 'logs');
        if (!log) {
            return;
        }
        const note = log.note ? (log.note.length > 120 ? log.note.slice(0, 117) + '...' : log.note) : '(no note)';
        this.summary.setText([
            'LOG #' + log.id + '   BATCH ' + log.batch,
            'ROOM   ' + this.editor.roomLabel(log.room),
            'TIME   ' + Clock.format(log.timestamp) + '-' + Clock.format(log.timestamp + log.duration) + '  (' + log.duration + 'm)',
            'NOTE   ' + note
        ].join('\n'));
        const problems = this.editor.problems(log).length;
        this.problemText.setText(problems ? problems + ' problems (open it in editor 1 to see them)' : 'No problems');
        this.problemText.setColor(problems ? Theme.textRed : Theme.textGreen);
    }
}
