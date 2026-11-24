import { EditorState } from "../state/EditorState";
import { Button } from "./Button";
import { Dropdown } from "./Dropdown";
import { Glass } from "./Glass";
import { TextField } from "./TextField";
import { Theme } from "./Theme";

// Log editor, Characters tab: the selected character's badge ID, writer name, whether the proximity sensors see them
// by default, and their moves: "at 03:15 go to room X". Each move can override the default visibility until the next
// move (e.g. a lost badge, or a visitor badge handed out). The move list scrolls with the mouse wheel.
export class EditorCharacterForm extends Phaser.GameObjects.Container {
    static readonly labelW = 110;
    static readonly movesTop = 300;
    static readonly rowH = 40;

    editor: EditorState;
    w: number;
    h: number;
    idField: TextField;
    nameField: TextField;
    visibleButton: Button;
    usesText: Phaser.GameObjects.Text;
    problemText: Phaser.GameObjects.Text;
    rows: Phaser.GameObjects.Container;
    controls: Phaser.GameObjects.Container;
    emptyText: Phaser.GameObjects.Text;
    scroll = 0;

    constructor(scene: Phaser.Scene, x: number, y: number, w: number, h: number, editor: EditorState) {
        super(scene, x, y);
        this.w = w;
        this.h = h;
        this.editor = editor;
        this.create();
    }

    get fit(): number {
        return Math.floor((this.h - EditorCharacterForm.movesTop - 10) / EditorCharacterForm.rowH);
    }

    create() {
        const lx = EditorCharacterForm.labelW;
        this.controls = this.scene.add.container(0, 0);
        const c = this.controls;
        const label = (y: number, text: string, x = 0) => c.add(this.scene.add.text(x, y, text, Theme.style(17, Theme.textDim)).setOrigin(0, 0.5));
        const def = () => this.editor.currentBadge!;

        label(20, 'BADGE ID');
        this.idField = new TextField(this.scene, lx, 3, 120, 34, '', (value) => this.editor.setBadgeId(value), 8);
        this.idField.text.setFontSize(22);
        c.add(this.idField);
        label(20, 'NAME', 260);
        this.nameField = new TextField(this.scene, 320, 3, this.w - 320, 34, '', (value) => this.editor.setBadgeNote(value), 24);
        c.add(this.nameField);

        label(70, 'PROXIMITY');
        this.visibleButton = new Button(this.scene, lx, 53, 300, 34, '', () => this.editor.setBadgeInvisible(!def().invisible), 16);
        c.add(this.visibleButton);
        c.add(this.scene.add.text(lx, 100, 'default for every move; a move can override it', Theme.style(14, Theme.textDim)).setOrigin(0, 0.5));
        label(135, 'SPEAKS IN');
        this.usesText = this.scene.add.text(lx, 135, '', Theme.style(17)).setOrigin(0, 0.5);
        c.add(this.usesText);

        this.problemText = this.scene.add.text(0, 160, '', Theme.style(15, Theme.textRed)).setLineSpacing(3).setWordWrapWidth(this.w);
        c.add(this.problemText);

        const my = EditorCharacterForm.movesTop;
        c.add(this.scene.add.text(0, my - 40, 'MOVES', Theme.style(17, Theme.textDim)).setOrigin(0, 0.5));
        c.add(this.scene.add.text(lx, my - 40, 'time            room                  sensors', Theme.style(14, Theme.textDim)).setOrigin(0, 0.5));
        c.add(new Button(this.scene, this.w - 140, my - 57, 140, 34, '+ ADD MOVE', () => this.editor.addMove(), 15));
        this.rows = this.scene.add.container(0, my);
        c.add(this.rows);

        this.emptyText = this.scene.add.text(0, 10, 'No character selected. Pick one from the list or the chart.', Theme.style(18, Theme.textDim));
        this.add([this.controls, this.emptyText]);

        this.scene.input.on("wheel", (pointer: Phaser.Input.Pointer, _over: unknown, _dx: number, dy: number) => {
            const top = this.y + EditorCharacterForm.movesTop;
            if (this.parentContainer?.visible && pointer.x >= this.x && pointer.x < this.x + this.w && pointer.y >= top && pointer.y < this.y + this.h) {
                this.scroll = Math.max(0, this.scroll + Math.sign(dy) * 3);
                this.refresh();
            }
        });
        this.editor.on("dataChanged", () => this.refresh());
        this.editor.on("selectionChanged", () => {
            // Keep the selected move in view.
            const i = this.editor.selectedMove;
            if (i !== null && (i < this.scroll || i >= this.scroll + this.fit)) {
                this.scroll = Math.max(0, i - Math.floor(this.fit / 2));
            }
            this.refresh();
        });
        this.refresh();
        this.scene.add.existing(this);
    }

    refresh() {
        const def = this.editor.currentBadge;
        this.controls.setVisible(!!def);
        this.emptyText.setVisible(!def);
        this.rows.removeAll(true);
        if (!def) {
            return;
        }
        this.idField.value = def.id;
        this.idField.redraw();
        this.nameField.value = def.note;
        this.nameField.redraw();
        this.visibleButton.setText(def.invisible ? 'INVISIBLE (NO BADGE)' : 'SEEN BY SENSORS');
        this.visibleButton.label.setColor(def.invisible ? Theme.textAmber : Theme.textGreen);
        this.usesText.setText(this.editor.badgeUses(def.id) + ' log entries');

        const problems = this.editor.badgeProblems(def);
        const shown = problems.slice(0, 4).map((p) => '! ' + p);
        if (problems.length > 4) {
            shown[3] = '! ... ' + (problems.length - 3) + ' more problems';
        }
        this.problemText.setText(problems.length ? shown.join('\n') : 'No problems');
        this.problemText.setColor(problems.length ? Theme.textRed : Theme.textGreen);

        const moves = def.moves ?? [];
        this.scroll = Math.min(this.scroll, Math.max(0, moves.length - this.fit));
        moves.slice(this.scroll, this.scroll + this.fit).forEach((move, n) => {
            const i = this.scroll + n;
            const y = n * EditorCharacterForm.rowH;
            const t = this.editor.minutes(move.at);
            // Selecting first means the action (and the arrow keys afterwards) apply to this move.
            const act = (fn: () => void) => () => {
                this.editor.selectBadge(def.id, i);
                fn();
            };
            const selected = this.editor.selectedMove === i;
            const bg = this.scene.add.graphics();
            if (selected) {
                bg.fillStyle(Theme.highlight, 0.8);
                bg.fillRect(-4, y - 2, this.w + 8, EditorCharacterForm.rowH - 2);
                Glass.glowRect(bg, -4, y - 2, this.w + 8, EditorCharacterForm.rowH - 2, Theme.systemTime, 1.5, 0.8);
            }
            const zone = this.scene.add.zone(-4, y - 2, this.w + 8, EditorCharacterForm.rowH - 2).setOrigin(0).setInteractive();
            zone.on("pointerdown", act(() => undefined));
            this.rows.add([bg, zone]);

            const b = (x: number, w: number, text: string, fn: () => void) =>
                this.rows.add(new Button(this.scene, x, y, w, 34, text, act(fn), 14));
            b(0, 42, '-15', () => this.editor.setMoveTime(i, t - 15));
            b(46, 32, '-1', () => this.editor.setMoveTime(i, t - 1));
            this.rows.add(this.scene.add.text(112, y + 17, move.at, Theme.style(20, Theme.textAmber)).setOrigin(0.5));
            b(146, 32, '+1', () => this.editor.setMoveTime(i, t + 1));
            b(182, 42, '+15', () => this.editor.setMoveTime(i, t + 15));

            const items = () => [{ value: '', label: '(outside the building)' },
                ...this.editor.rooms.map((r) => ({ value: r.id, label: this.editor.roomLabel(r.id) }))];
            const room = new Dropdown(this.scene, 234, y, 250, 34, items, (value) => {
                this.editor.selectBadge(def.id, i);
                this.editor.setMoveRoom(i, value);
            });
            room.setText(this.editor.roomLabel(move.room).slice(0, 22));
            this.rows.add(room);

            // Sensors: what the proximity sensors see for this stretch. * = differs from the default.
            const invisible = move.invisible ?? !!def.invisible;
            const vis = new Button(this.scene, 492, y, 88, 34, (invisible ? 'HIDDEN' : 'SEEN') + (move.invisible !== undefined ? '*' : ''),
                act(() => this.editor.toggleMoveInvisible(i)), 14);
            vis.label.setColor(invisible ? Theme.textAmber : Theme.textGreen);
            this.rows.add(vis);
            b(this.w - 34, 34, 'X', () => this.editor.removeMove(i));
            if (n === 0 && this.scroll > 0) {
                this.rows.add(this.scene.add.text(this.w / 2, y - 12, '▲ ' + this.scroll + ' more', Theme.style(12, Theme.textDim)).setOrigin(0.5));
            }
        });
        if (moves.length === 0) {
            this.rows.add(this.scene.add.text(0, 10, 'No moves yet: they are never in the building. Add a move,\nor double-click their column in the chart.',
                Theme.style(16, Theme.textDim)));
        } else if (this.scroll + this.fit < moves.length) {
            this.rows.add(this.scene.add.text(this.w / 2, this.fit * EditorCharacterForm.rowH,
                '▼ ' + (moves.length - this.scroll - this.fit) + ' more (scroll)', Theme.style(13, Theme.textDim)).setOrigin(0.5, 0));
        }
    }
}
