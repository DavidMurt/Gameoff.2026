import { EditorCharacterForm } from "../component/EditorCharacterForm";
import { EditorList } from "../component/EditorList";
import { EditorLogForm } from "../component/EditorLogForm";
import { EditorLogList } from "../component/EditorLogList";
import { EditorPreview } from "../component/EditorPreview";
import { EditorRoomForm } from "../component/EditorRoomForm";
import { EditorRoomMap } from "../component/EditorRoomMap";
import { EditorTimeline } from "../component/EditorTimeline";
import { EditorWhereabouts } from "../component/EditorWhereabouts";
import { Button } from "../component/Button";
import { TextField } from "../component/TextField";
import { Theme } from "../component/Theme";
import { EditorState, EditorTab } from "../state/EditorState";

// Dev-only authoring tool for the story data. Open with localhost:5500/?editor. Three tabs:
// LOGS: two editors side by side (left-click a log for editor 1, right-click for editor 2), with a shared preview
//   that lines both logs up by clock time, and a timeline of every log by room.
// ROOMS: the facility map: room IDs, names, map squares, sensors and corridors.
// CHARACTERS: badge IDs, names, whether the proximity sensors see them, and where they are over the shift (moves).
// Keys (not while typing): Ctrl+Z = undo, Ctrl+S = save. On LOGS, for the active editor's log:
// up/down = -/+15 min (shift: 1 hour), left/right = previous/next room, Tab = switch editor, N = new log.
// On CHARACTERS, for the selected move: up/down = -/+1 min (shift: 15 min).
export class LogEditorScene extends Phaser.Scene {
    static readonly tabNames: Record<EditorTab, string> = { logs: 'LOGS', rooms: 'ROOMS', characters: 'CHARACTERS' };

    state: EditorState;
    statusText: Phaser.GameObjects.Text;
    saveButton: Button;
    tabButtons: Button[] = [];
    filterButtons: Button[] = [];
    pages: Record<EditorTab, Phaser.GameObjects.Container>;
    message = '';
    warning = '';
    warningTimer: Phaser.Time.TimerEvent | null = null;

    constructor() {
        super("LogEditorScene");
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        this.state = new EditorState();

        this.add.text(20, 18, 'LOG EDITOR', Theme.titleStyle(24, Theme.textAmber));
        let tx = 230;
        EditorState.tabs.forEach((tab) => {
            const w = tab === 'characters' ? 150 : 100;
            this.tabButtons.push(new Button(this, tx, 14, w, 40, LogEditorScene.tabNames[tab], () => this.state.setTab(tab), 16));
            tx += w + 8;
        });
        this.statusText = this.add.text(640, 24, '', Theme.style(18));

        // Undo and save across the top right.
        new Button(this, width - 290, 14, 120, 40, 'UNDO', () => this.state.undo());
        this.saveButton = new Button(this, width - 160, 14, 140, 40, 'SAVE', () => this.save());

        this.pages = {
            logs: this.createLogsPage(width, height),
            rooms: this.createRoomsPage(width, height),
            characters: this.createCharactersPage(width, height)
        };
        // Right-click opens a log in editor 2, so the browser menu is turned off.
        this.input.mouse!.disableContextMenu();

        this.state.on("dataChanged", () => this.refreshTop());
        this.state.on("dirtyChanged", () => this.refreshTop());
        this.state.on("tabChanged", () => this.showTab());
        this.state.on("message", (text: string) => this.warn(text));

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
        this.showTab();
    }

    createLogsPage(width: number, height: number): Phaser.GameObjects.Container {
        const page = this.add.container(0, 0);
        // Batch filter buttons, only on this tab.
        const filters: (number | null)[] = [null, ...this.state.batchNumbers()];
        let fx = 1100;
        filters.forEach((batch) => {
            const b = new Button(this, fx, 14, 80, 40, batch === null ? 'ALL' : 'B' + batch, () => {
                this.state.setBatchFilter(batch);
                this.refreshTop();
            });
            this.filterButtons.push(b);
            page.add(b);
            fx += 88;
        });
        const formW = 520;
        const previewY = 80 + EditorLogForm.height;
        page.add([
            new EditorLogList(this, 20, 80, 240, height - 150, this.state),
            new EditorLogForm(this, 280, 80, formW, this.state, 0),
            new EditorLogForm(this, 280 + formW + 20, 80, formW, this.state, 1),
            new EditorPreview(this, 280, previewY, formW * 2 + 20, height - previewY - 20, this.state),
            new EditorTimeline(this, 1360, 80, width - 1380, height - 100, this.state)
        ]);
        return page;
    }

    createRoomsPage(width: number, height: number): Phaser.GameObjects.Container {
        const page = this.add.container(0, 0);
        const items = () => [...this.state.rooms]
            .sort((a, b) => a.row - b.row || a.col - b.col)
            .map((r) => ({ id: r.id, label: r.id + ' ' + (r.note ?? ''), bad: this.state.roomProblems(r).length > 0 }));
        page.add([
            new EditorList(this, 20, 80, 240, height - 150, this.state, items, () => this.state.selectedRoom,
                (id) => this.state.selectRoom(id), () => this.state.newRoom(), () => this.state.removeRoom()),
            new EditorRoomForm(this, 280, 80, 500, this.state),
            new EditorRoomMap(this, 800, 80, width - 820, height - 100, this.state)
        ]);
        return page;
    }

    createCharactersPage(width: number, height: number): Phaser.GameObjects.Container {
        const page = this.add.container(0, 0);
        const items = () => this.state.badges.map((b) => ({
            id: b.id,
            label: b.id + ' ' + b.note + (b.invisible ? ' (inv)' : ''),
            bad: this.state.badgeProblems(b).length > 0
        }));
        page.add([
            new EditorList(this, 20, 80, 240, height - 150, this.state, items, () => this.state.selectedBadge,
                (id) => this.state.selectBadge(id), () => this.state.newBadge(), () => this.state.removeBadge()),
            new EditorCharacterForm(this, 280, 80, 620, height - 100, this.state),
            new EditorWhereabouts(this, 920, 80, width - 940, height - 100, this.state)
        ]);
        return page;
    }

    showTab() {
        TextField.focused?.blur(true);
        EditorState.tabs.forEach((tab, i) => {
            this.pages[tab].setVisible(tab === this.state.tab);
            this.tabButtons[i].setToggled(tab === this.state.tab);
        });
        this.refreshTop();
    }

    keyDown(event: KeyboardEvent) {
        const ctrl = event.ctrlKey || event.metaKey;
        if (ctrl && event.key.toLowerCase() === 's') {
            event.preventDefault();
            (document.activeElement as HTMLElement | null)?.blur();
            TextField.focused?.blur(true);
            this.save();
            return;
        }
        const tag = document.activeElement?.tagName;
        if (TextField.focused || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
            return;
        }
        if (ctrl && event.key.toLowerCase() === 'z') {
            event.preventDefault();
            this.state.undo();
        } else if (this.state.tab === 'logs') {
            this.logsKey(event, ctrl);
        } else if (this.state.tab === 'characters') {
            this.charactersKey(event);
        }
    }

    logsKey(event: KeyboardEvent, ctrl: boolean) {
        const log = this.state.selected();
        if (event.key === 'Tab') {
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

    charactersKey(event: KeyboardEvent) {
        const i = this.state.selectedMove;
        const move = i === null ? undefined : this.state.currentBadge?.moves?.[i];
        if (move && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
            event.preventDefault();
            const step = (event.shiftKey ? 15 : 1) * (event.key === 'ArrowUp' ? -1 : 1);
            this.state.setMoveTime(i!, this.state.minutes(move.at) + step);
        }
    }

    async save() {
        this.message = 'Saving...';
        this.refreshTop();
        const error = await this.state.save();
        this.message = error ? 'SAVE FAILED: ' + error : 'Saved';
        this.refreshTop();
    }

    // A refused action: shown in red in the status line for a few seconds.
    warn(text: string) {
        this.warning = text;
        this.warningTimer?.remove();
        this.warningTimer = this.time.delayedCall(4000, () => {
            this.warning = '';
            this.refreshTop();
        });
        this.refreshTop();
    }

    refreshTop() {
        const s = this.state;
        let parts: string[];
        let bad: number;
        if (s.tab === 'rooms') {
            bad = s.roomProblemCount();
            parts = [s.rooms.length + ' rooms', s.corridors.length + ' corridors'];
        } else if (s.tab === 'characters') {
            bad = s.badgeProblemCount();
            parts = [s.badges.length + ' characters'];
        } else {
            bad = s.problemCount();
            parts = [s.logs.length + ' logs'];
        }
        parts.push(bad ? bad + ' with problems' : 'no problems');
        if (this.warning) {
            parts = [this.warning];
        } else if (s.dirty) {
            parts.push('UNSAVED');
        } else if (this.message) {
            parts.push(this.message);
        }
        this.statusText.setText(parts.join('  ·  '));
        const red = this.warning !== '' || this.message.startsWith('SAVE FAILED');
        this.statusText.setColor(red ? Theme.textRed : (bad || s.dirty ? Theme.textAmber : Theme.textGreen));
        this.saveButton.setText(s.dirty ? 'SAVE *' : 'SAVE');
        const filters: (number | null)[] = [null, ...s.batchNumbers()];
        this.filterButtons.forEach((b, i) => b.setToggled(filters[i] === s.batchFilter));
    }
}
