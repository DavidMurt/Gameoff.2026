import { Clock } from "../state/Clock";
import { EditorState } from "../state/EditorState";
import { Button } from "./Button";
import { Dropdown } from "./Dropdown";
import { EditorEntryGrid } from "./EditorEntryGrid";
import { TextField } from "./TextField";
import { Theme } from "./Theme";

// Log editor: one editor slot showing a log's ID, batch, room, time, length, note and entries.
// Two of these sit side by side. Clicking anything in one makes its slot the active one.
// The note and the entries table are HTML (for typing, paste and selection); everything else is in-canvas.
export class EditorLogForm extends Phaser.GameObjects.Container {
    static readonly labelW = 90;
    static readonly headerH = 30;
    static readonly entriesTop = 400;
    static readonly entriesH = 250;

    editor: EditorState;
    slot: number;
    w: number;
    header: Phaser.GameObjects.Graphics;
    headerText: Phaser.GameObjects.Text;
    idField: TextField;
    batchText: Phaser.GameObjects.Text;
    roomDropdown: Dropdown;
    timeText: Phaser.GameObjects.Text;
    durationText: Phaser.GameObjects.Text;
    endText: Phaser.GameObjects.Text;
    problemText: Phaser.GameObjects.Text;
    noteInput: HTMLInputElement;
    noteDom: Phaser.GameObjects.DOMElement;
    entries: EditorEntryGrid;
    controls: Phaser.GameObjects.GameObject[] = [];
    emptyText: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, x: number, y: number, w: number, editor: EditorState, slot: number) {
        super(scene, x, y);
        this.w = w;
        this.editor = editor;
        this.slot = slot;
        this.create();
    }

    get color(): number {
        return Theme.viewerColors[this.slot];
    }

    create() {
        const lx = EditorLogForm.labelW;
        const top = EditorLogForm.headerH + 12;
        const label = (y: number, text: string, x = 0) => {
            const t = this.scene.add.text(x, top + y, text, Theme.style(17, Theme.textDim)).setOrigin(0, 0.5);
            this.add(t);
            return t;
        };
        // Every action first makes this slot active, so the state applies it to this slot's log.
        const act = (fn: () => void) => () => {
            this.editor.setActive(this.slot);
            fn();
        };
        const button = (x: number, y: number, w: number, text: string, onClick: () => void) => {
            const b = new Button(this.scene, x, top + y - 17, w, 34, text, act(onClick), 16);
            this.add(b);
            return b;
        };
        const log = () => this.editor.selected(this.slot)!;

        // Coloured header; clicking it makes this slot active.
        this.header = this.scene.add.graphics();
        this.headerText = this.scene.add.text(10, EditorLogForm.headerH / 2, '', Theme.style(17)).setOrigin(0, 0.5);
        const headerZone = this.scene.add.zone(0, 0, this.w, EditorLogForm.headerH).setOrigin(0).setInteractive({ useHandCursor: true });
        headerZone.on("pointerdown", () => this.editor.setActive(this.slot));
        this.add([this.header, this.headerText, headerZone]);

        // ID and batch
        label(17, 'LOG #');
        this.idField = new TextField(this.scene, lx, top, 100, 34, '', (value) => {
            this.editor.setActive(this.slot);
            this.editor.setId(value);
        }, 8);
        this.idField.text.setFontSize(22);
        this.idField.zone.on("pointerdown", () => this.editor.setActive(this.slot));
        this.add(this.idField);
        label(17, 'BATCH', 230);
        button(310, 17, 36, '-', () => this.editor.setBatch(log().batch - 1));
        this.batchText = this.scene.add.text(368, top + 17, '', Theme.style(22)).setOrigin(0.5);
        this.add(this.batchText);
        button(390, 17, 36, '+', () => this.editor.setBatch(log().batch + 1));

        // Room
        label(66, 'ROOM');
        const roomItems = () => this.editor.audioRooms().map((r) => ({ value: r.id, label: this.editor.roomLabel(r.id) }));
        this.roomDropdown = new Dropdown(this.scene, lx, top + 49, this.w - lx, 34, roomItems, (value) => {
            this.editor.setActive(this.slot);
            this.editor.setRoom(value);
        });
        this.roomDropdown.button.zone.on("pointerdown", () => this.editor.setActive(this.slot));
        this.add(this.roomDropdown);

        // Start time
        label(118, 'START');
        this.timeText = this.scene.add.text(lx, top + 118, '', Theme.style(36, Theme.textAmber)).setOrigin(0, 0.5);
        this.add(this.timeText);
        [['-1H', -60], ['-15', -15], ['+15', 15], ['+1H', 60]].forEach(([text, step], i) => {
            button(lx + 125 + i * 62, 118, 56, text as string, () => this.editor.setTime(log().timestamp + (step as number)));
        });

        // Length
        label(168, 'LENGTH');
        button(lx, 168, 52, '-15', () => this.editor.setDuration(log().duration - 15));
        this.durationText = this.scene.add.text(lx + 100, top + 168, '', Theme.style(20)).setOrigin(0.5);
        this.add(this.durationText);
        button(lx + 148, 168, 52, '+15', () => this.editor.setDuration(log().duration + 15));
        this.endText = this.scene.add.text(lx + 215, top + 168, '', Theme.style(17, Theme.textDim)).setOrigin(0, 0.5);
        this.add(this.endText);

        // Writer note (HTML input)
        label(218, 'NOTE');
        this.noteInput = document.createElement('input');
        this.noteInput.type = 'text';
        this.noteInput.placeholder = 'Writer-only note';
        this.noteInput.style.cssText = EditorLogForm.inputCss(this.w - lx, 34);
        this.noteInput.addEventListener('focus', () => this.editor.setActive(this.slot));
        this.noteInput.addEventListener('change', () => {
            this.editor.setActive(this.slot);
            this.editor.setNote(this.noteInput.value);
        });
        this.noteDom = this.scene.add.dom(this.x + lx, this.y + top + 201, this.noteInput).setOrigin(0);

        // Problems with this log
        this.problemText = this.scene.add.text(0, top + 248, '', Theme.style(15, Theme.textRed)).setLineSpacing(3).setWordWrapWidth(this.w);
        this.add(this.problemText);

        // Entries (HTML table)
        const ey = EditorLogForm.entriesTop;
        this.add(this.scene.add.text(0, ey - 26, 'ENTRIES', Theme.style(17, Theme.textDim)));
        this.add(this.scene.add.text(lx, ey - 24, 'Enter = new line · Sound / Blank line are speakers',
            Theme.style(13, Theme.textDim)));
        this.entries = new EditorEntryGrid(this.scene, this.x, this.y + ey, this.w, EditorLogForm.entriesH, this.editor, this.slot);

        this.emptyText = this.scene.add.text(0, top + 10, 'No log open. Left-click a log for editor 1,\nright-click for editor 2.',
            Theme.style(18, Theme.textDim));
        this.add(this.emptyText);
        this.controls = this.list.filter((o) => o !== this.emptyText && o !== this.header && o !== this.headerText && o !== headerZone);

        this.editor.on("selectionChanged", () => this.refresh(true));
        this.editor.on("tabChanged", () => this.refresh(false));
        this.editor.on("dataChanged", () => this.refresh(false));
        this.refresh(true);
        this.scene.add.existing(this);
    }

    // Height of everything above the shared preview.
    static get height(): number {
        return EditorLogForm.entriesTop + EditorLogForm.entriesH + 20;
    }

    static inputCss(w: number, h: number): string {
        return 'box-sizing:border-box;width:' + w + 'px;height:' + h + 'px;padding:4px 8px;'
            + 'background:#1a1a1a;color:#e8e8e8;border:2px solid #555555;outline:none;'
            + 'font-family:Consolas,"Courier New",monospace;font-size:16px;';
    }

    // fromData: also reload the note input (on a change of log). The entries table keeps itself up to date.
    refresh(fromData: boolean) {
        const log = this.editor.selected(this.slot);
        const active = this.editor.active === this.slot;
        this.header.clear();
        this.header.fillStyle(this.color, active ? 1 : 0.35);
        this.header.fillRect(0, 0, this.w, EditorLogForm.headerH);
        this.headerText.setText('EDITOR ' + (this.slot + 1) + (log ? '  ·  LOG #' + log.id : '') + (active ? '  ·  ACTIVE' : ''));

        this.controls.forEach((o) => (o as unknown as Phaser.GameObjects.Components.Visible).setVisible(!!log));
        this.emptyText.setVisible(!log);
        // The HTML inputs sit above the canvas, outside this container, so they are hidden by hand on the other tabs.
        // (Phaser resets style.display every frame, so it's the DOM game objects that are hidden.)
        const inputsShown = !!log && this.editor.tab === 'logs';
        this.noteDom.setVisible(inputsShown);
        this.entries.setVisible(inputsShown);
        if (!log) {
            return;
        }
        this.idField.value = log.id;
        this.idField.redraw();
        this.batchText.setText(String(log.batch));
        this.roomDropdown.setText(this.editor.roomLabel(log.room));
        this.timeText.setText(Clock.format(log.timestamp));
        this.durationText.setText(log.duration + 'm');
        this.endText.setText('ends ' + Clock.format(log.timestamp + log.duration));
        const problems = this.editor.problems(log);
        const shown = problems.slice(0, 5).map((p) => '! ' + p);
        if (problems.length > 5) {
            shown[4] = '! ... ' + (problems.length - 4) + ' more problems';
        }
        this.problemText.setText(problems.length ? shown.join('\n') : 'No problems');
        this.problemText.setColor(problems.length ? Theme.textRed : Theme.textGreen);
        if (fromData) {
            this.noteInput.value = log.note ?? '';
        }
    }
}
