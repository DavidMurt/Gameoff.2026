import { SensorState } from "../data/Types";
import { EditorState } from "../state/EditorState";
import { Button } from "./Button";
import { Dropdown } from "./Dropdown";
import { TextField } from "./TextField";
import { Theme } from "./Theme";

// Log editor, Rooms tab: the selected room's ID, writer name, map square, sensors and corridors.
// Changing the ID renames the room in every log, move and corridor.
export class EditorRoomForm extends Phaser.GameObjects.Container {
    static readonly labelW = 110;
    static readonly rowH = 38;

    editor: EditorState;
    w: number;
    idField: TextField;
    nameField: TextField;
    colText: Phaser.GameObjects.Text;
    rowText: Phaser.GameObjects.Text;
    audioButton: Button;
    proximityButton: Button;
    usesText: Phaser.GameObjects.Text;
    connectDropdown: Dropdown;
    corridorRows: Phaser.GameObjects.Container;
    problemText: Phaser.GameObjects.Text;
    controls: Phaser.GameObjects.Container;
    emptyText: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, x: number, y: number, w: number, editor: EditorState) {
        super(scene, x, y);
        this.w = w;
        this.editor = editor;
        this.create();
    }

    static sensorColor(state: SensorState): string {
        switch (state) {
            case 'online': return Theme.textGreen;
            case 'corrupted': return Theme.textAmber;
            case 'broken': return Theme.textRed;
            default: return Theme.textDim;
        }
    }

    create() {
        const lx = EditorRoomForm.labelW;
        this.controls = this.scene.add.container(0, 0);
        const c = this.controls;
        const label = (y: number, text: string, x = 0) => c.add(this.scene.add.text(x, y, text, Theme.style(17, Theme.textDim)).setOrigin(0, 0.5));
        const button = (x: number, y: number, w: number, text: string, onClick: () => void) => {
            const b = new Button(this.scene, x, y - 17, w, 34, text, onClick, 16);
            c.add(b);
            return b;
        };
        const room = () => this.editor.currentRoom!;

        label(20, 'ROOM ID');
        this.idField = new TextField(this.scene, lx, 3, 120, 34, '', (value) => this.editor.setRoomId(value), 8);
        this.idField.text.setFontSize(22);
        c.add(this.idField);

        label(70, 'NAME');
        this.nameField = new TextField(this.scene, lx, 53, this.w - lx, 34, '', (value) => this.editor.setRoomNote(value), 32);
        c.add(this.nameField);

        label(120, 'MAP');
        label(120, 'COL', lx);
        button(lx + 45, 120, 34, '-', () => this.editor.setRoomCell(room().col - 1, room().row));
        this.colText = this.scene.add.text(lx + 100, 120, '', Theme.style(20)).setOrigin(0.5);
        c.add(this.colText);
        button(lx + 121, 120, 34, '+', () => this.editor.setRoomCell(room().col + 1, room().row));
        label(120, 'ROW', lx + 190);
        button(lx + 235, 120, 34, '-', () => this.editor.setRoomCell(room().col, room().row - 1));
        this.rowText = this.scene.add.text(lx + 290, 120, '', Theme.style(20)).setOrigin(0.5);
        c.add(this.rowText);
        button(lx + 311, 120, 34, '+', () => this.editor.setRoomCell(room().col, room().row + 1));

        label(170, 'AUDIO');
        this.audioButton = button(lx, 170, 160, '', () => this.editor.cycleSensor('audio'));
        label(220, 'PROXIMITY');
        this.proximityButton = button(lx, 220, 160, '', () => this.editor.cycleSensor('proximity'));
        c.add(this.scene.add.text(lx + 175, 195, 'click to change:\nnone / online /\ncorrupted / broken', Theme.style(13, Theme.textDim))
            .setOrigin(0, 0.5));

        label(270, 'USED BY');
        this.usesText = this.scene.add.text(lx, 270, '', Theme.style(17)).setOrigin(0, 0.5);
        c.add(this.usesText);

        label(320, 'CORRIDORS');
        const others = () => this.editor.rooms
            .filter((r) => r !== this.editor.currentRoom && !this.editor.connected(r.id, room().id))
            .map((r) => ({ value: r.id, label: this.editor.roomLabel(r.id) }));
        this.connectDropdown = new Dropdown(this.scene, lx, 303, this.w - lx, 34, others, (value) => this.editor.toggleCorridor(room().id, value));
        this.connectDropdown.setText('+ connect to...');
        c.add(this.connectDropdown);
        this.corridorRows = this.scene.add.container(lx, 345);
        c.add(this.corridorRows);

        this.problemText = this.scene.add.text(0, 0, '', Theme.style(15, Theme.textRed)).setLineSpacing(3).setWordWrapWidth(this.w);
        c.add(this.problemText);

        this.emptyText = this.scene.add.text(0, 10, 'No room selected. Pick one from the list or the map.', Theme.style(18, Theme.textDim));
        this.add([this.controls, this.emptyText]);

        this.editor.on("dataChanged", () => this.refresh());
        this.editor.on("selectionChanged", () => this.refresh());
        this.refresh();
        this.scene.add.existing(this);
    }

    refresh() {
        const room = this.editor.currentRoom;
        this.controls.setVisible(!!room);
        this.emptyText.setVisible(!room);
        if (!room) {
            return;
        }
        this.idField.value = room.id;
        this.idField.redraw();
        this.nameField.value = room.note ?? '';
        this.nameField.redraw();
        this.colText.setText(String(room.col));
        this.rowText.setText(String(room.row));
        this.audioButton.setText(room.audio.toUpperCase());
        this.audioButton.label.setColor(EditorRoomForm.sensorColor(room.audio));
        this.proximityButton.setText(room.proximity.toUpperCase());
        this.proximityButton.label.setColor(EditorRoomForm.sensorColor(room.proximity));
        const uses = this.editor.roomUses(room.id);
        this.usesText.setText(uses.logs + ' logs, ' + uses.moves + ' character moves');

        // One row per corridor, each with a button to remove it.
        this.corridorRows.removeAll(true);
        const linked = this.editor.rooms.filter((r) => this.editor.connected(r.id, room.id));
        linked.forEach((other, i) => {
            const y = i * EditorRoomForm.rowH;
            this.corridorRows.add(this.scene.add.text(0, y + 17, '↔ ' + this.editor.roomLabel(other.id), Theme.style(16)).setOrigin(0, 0.5));
            this.corridorRows.add(new Button(this.scene, this.w - EditorRoomForm.labelW - 90, y, 90, 34, 'REMOVE',
                () => this.editor.toggleCorridor(room.id, other.id), 14));
        });
        if (linked.length === 0) {
            this.corridorRows.add(this.scene.add.text(0, 17, 'none', Theme.style(16, Theme.textDim)).setOrigin(0, 0.5));
        }

        const problems = this.editor.roomProblems(room);
        this.problemText.setY(345 + Math.max(1, linked.length) * EditorRoomForm.rowH + 16);
        this.problemText.setText(problems.length ? problems.map((p) => '! ' + p).join('\n') : 'No problems');
        this.problemText.setColor(problems.length ? Theme.textRed : Theme.textGreen);
    }
}
