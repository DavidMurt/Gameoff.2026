import { EditorLogForm } from "../component/EditorLogForm";
import { EditorLogList } from "../component/EditorLogList";
import { EditorPreview } from "../component/EditorPreview";
import { EditorTimeline } from "../component/EditorTimeline";
import { Button } from "../component/Button";
import { TextField } from "../component/TextField";
import { Theme } from "../component/Theme";
import { SampleData } from "../data/SampleData";
import { EditorState } from "../state/EditorState";

// Dev-only authoring tool for the story logs. Open with localhost:5500/?editor.
// Two editors side by side (left-click a log for editor 1, right-click for editor 2), with a shared preview
// that lines both logs up by clock time. Keys act on the active editor's log (not while typing):
// up/down = -/+15 min (shift: 1 hour), left/right = previous/next room, Tab = switch editor,
// N = new log, Ctrl+Z = undo, Ctrl+S = save.
export class LogEditorScene extends Phaser.Scene {
    state: EditorState;
    statusText: Phaser.GameObjects.Text;
    saveButton: Button;
    filterButtons: Button[] = [];
    message = '';

    constructor() {
        super("LogEditorScene");
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        this.state = new EditorState();

        this.add.text(20, 18, 'LOG EDITOR', Theme.titleStyle(24, Theme.textAmber));
        this.statusText = this.add.text(260, 24, '', Theme.style(18));

        // Batch filter, undo and save across the top right.
        const filters: (number | null)[] = [null, ...SampleData.batches.map((b) => b.batch)];
        let fx = 1100;
        filters.forEach((batch) => {
            const b = new Button(this, fx, 14, 80, 40, batch === null ? 'ALL' : 'B' + batch, () => {
                this.state.setBatchFilter(batch);
                this.refreshTop();
            });
            this.filterButtons.push(b);
            fx += 88;
        });
        new Button(this, width - 290, 14, 120, 40, 'UNDO', () => this.state.undo());
        this.saveButton = new Button(this, width - 160, 14, 140, 40, 'SAVE', () => this.save());

        const formW = 520;
        new EditorLogList(this, 20, 80, 240, height - 150, this.state);
        new EditorLogForm(this, 280, 80, formW, this.state, 0);
        new EditorLogForm(this, 280 + formW + 20, 80, formW, this.state, 1);
        const previewY = 80 + EditorLogForm.height;
        new EditorPreview(this, 280, previewY, formW * 2 + 20, height - previewY - 20, this.state);
        new EditorTimeline(this, 1360, 80, width - 1380, height - 100, this.state);
        // Right-click opens a log in editor 2, so the browser menu is turned off.
        this.input.mouse!.disableContextMenu();

        this.state.on("logsChanged", () => this.refreshTop());
        this.state.on("dirtyChanged", () => this.refreshTop());

        // Clicking the canvas takes focus away from the HTML note/entries inputs.
        this.input.on("pointerdown", () => {
            const active = document.activeElement;
            if (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement) {
                active.blur();
            }
        });
        // A plain DOM listener rather than Phaser's keyboard plugin: Phaser handles keys later in the frame,
        // too late for preventDefault() to stop the browser's own Ctrl+S.
        const onKey = (event: KeyboardEvent) => this.keyDown(event);
        window.addEventListener('keydown', onKey);
        this.events.once("shutdown", () => window.removeEventListener('keydown', onKey));
        this.refreshTop();
    }

    keyDown(event: KeyboardEvent) {
        const ctrl = event.ctrlKey || event.metaKey;
        if (ctrl && event.key.toLowerCase() === 's') {
            event.preventDefault();
            (document.activeElement as HTMLElement | null)?.blur();
            this.save();
            return;
        }
        const tag = document.activeElement?.tagName;
        if (TextField.focused || tag === 'INPUT' || tag === 'TEXTAREA') {
            return;
        }
        const log = this.state.selected();
        if (ctrl && event.key.toLowerCase() === 'z') {
            event.preventDefault();
            this.state.undo();
        } else if (event.key === 'Tab') {
            event.preventDefault();
            this.state.setActive(1 - this.state.active);
        } else if (!ctrl && event.key.toLowerCase() === 'n') {
            this.state.newLog();
        } else if (log && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
            event.preventDefault();
            const step = (event.shiftKey ? 60 : 15) * (event.key === 'ArrowUp' ? -1 : 1);
            this.state.setTime(log.timestamp + step);
        } else if (log && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
            event.preventDefault();
            this.state.moveRoomBy(event.key === 'ArrowLeft' ? -1 : 1);
        }
    }

    async save() {
        this.message = 'Saving...';
        this.refreshTop();
        const error = await this.state.save();
        this.message = error ? 'SAVE FAILED: ' + error : 'Saved to src/data/logs.json';
        this.refreshTop();
    }

    refreshTop() {
        const bad = this.state.problemCount();
        const parts = [this.state.logs.length + ' logs'];
        parts.push(bad ? bad + ' with problems' : 'no problems');
        if (this.state.dirty) {
            parts.push('UNSAVED CHANGES');
        } else if (this.message) {
            parts.push(this.message);
        }
        this.statusText.setText(parts.join('   ·   '));
        this.statusText.setColor(this.message.startsWith('SAVE FAILED') ? Theme.textRed : (bad || this.state.dirty ? Theme.textAmber : Theme.textGreen));
        this.saveButton.setText(this.state.dirty ? 'SAVE *' : 'SAVE');
        const filters: (number | null)[] = [null, ...SampleData.batches.map((b) => b.batch)];
        this.filterButtons.forEach((b, i) => b.setToggled(filters[i] === this.state.batchFilter));
    }
}
