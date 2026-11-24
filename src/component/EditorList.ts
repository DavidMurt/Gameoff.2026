import { EditorState } from "../state/EditorState";
import { Button } from "./Button";
import { Glass } from "./Glass";
import { Theme } from "./Theme";

export interface EditorListItem {
    id: string;
    label: string;
    bad: boolean;       // has problems: drawn with a red "!"
}

// Log editor: a scrolling list of rooms or characters with NEW and DELETE below. Click a row to select it.
// Delete needs a second click within two seconds.
export class EditorList extends Phaser.GameObjects.Container {
    static readonly rowH = 32;
    static readonly buttonH = 40;

    editor: EditorState;
    w: number;
    h: number;
    getItems: () => EditorListItem[];
    getSelected: () => string | null;
    onSelect: (id: string) => void;
    rows: Phaser.GameObjects.Container;
    deleteButton: Button;
    deleteTimer: Phaser.Time.TimerEvent | null = null;
    scroll = 0;

    constructor(scene: Phaser.Scene, x: number, y: number, w: number, h: number, editor: EditorState,
        getItems: () => EditorListItem[], getSelected: () => string | null, onSelect: (id: string) => void,
        onNew: () => void, onDelete: () => void) {
        super(scene, x, y);
        this.w = w;
        this.h = h;
        this.editor = editor;
        this.getItems = getItems;
        this.getSelected = getSelected;
        this.onSelect = onSelect;
        this.create(onNew, onDelete);
    }

    create(onNew: () => void, onDelete: () => void) {
        const bg = this.scene.add.graphics();
        Glass.panel(bg, 0, 0, this.w, this.h);
        this.rows = this.scene.add.container(0, 0);
        this.add([bg, this.rows]);

        const by = this.h + 10;
        const bw = (this.w - 10) / 2;
        this.add(new Button(this.scene, 0, by, bw, EditorList.buttonH, 'NEW', onNew, 16));
        this.deleteButton = new Button(this.scene, bw + 10, by, bw, EditorList.buttonH, 'DELETE', () => {
            if (this.deleteTimer) {
                this.deleteTimer.remove();
                this.deleteTimer = null;
                this.deleteButton.setText('DELETE');
                onDelete();
                return;
            }
            this.deleteButton.setText('CONFIRM?');
            this.deleteTimer = this.scene.time.delayedCall(2000, () => {
                this.deleteTimer = null;
                this.deleteButton.setText('DELETE');
            });
        }, 16);
        this.add(this.deleteButton);

        this.scene.input.on("wheel", (pointer: Phaser.Input.Pointer, _over: unknown, _dx: number, dy: number) => {
            if (this.shown() && pointer.x >= this.x && pointer.x < this.x + this.w && pointer.y >= this.y && pointer.y < this.y + this.h) {
                this.scroll = Math.max(0, this.scroll + Math.sign(dy) * 3);
                this.refresh();
            }
        });
        this.editor.on("dataChanged", () => this.refresh());
        this.editor.on("selectionChanged", () => this.refresh());
        this.refresh();
        this.scene.add.existing(this);
    }

    // False while this list's tab is hidden.
    shown(): boolean {
        return this.parentContainer?.visible ?? this.visible;
    }

    refresh() {
        this.rows.removeAll(true);
        const items = this.getItems();
        const fit = Math.floor((this.h - 10) / EditorList.rowH);
        this.scroll = Math.min(this.scroll, Math.max(0, items.length - fit));
        const selected = this.getSelected();
        items.slice(this.scroll, this.scroll + fit).forEach((item, i) => {
            const y = 5 + i * EditorList.rowH;
            const row = new Button(this.scene, 5, y, this.w - 10, EditorList.rowH - 2, item.label, () => this.onSelect(item.id), 15);
            row.label.setOrigin(0, 0.5).setX(10);
            row.setToggled(item.id === selected);
            this.rows.add(row);
            if (item.bad) {
                this.rows.add(this.scene.add.text(this.w - 22, y + EditorList.rowH / 2 - 1, '!', Theme.style(20, Theme.textRed))
                    .setOrigin(0.5).setFontStyle('bold'));
            }
        });
    }
}
