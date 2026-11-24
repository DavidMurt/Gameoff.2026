import { Theme } from "./Theme";

// A small in-canvas text input. Click to edit, Enter (or clicking elsewhere) to commit, Escape to cancel.
export class TextField extends Phaser.GameObjects.Container {
    static focused: TextField | null = null;

    bg: Phaser.GameObjects.Graphics;
    text: Phaser.GameObjects.Text;
    zone: Phaser.GameObjects.Zone;
    w: number;
    h: number;
    value: string;
    editValue = '';
    maxLength: number;
    onCommit: (value: string) => void;
    caretTimer: Phaser.Time.TimerEvent;
    caretOn = false;

    constructor(scene: Phaser.Scene, x: number, y: number, w: number, h: number, value: string,
        onCommit: (value: string) => void, maxLength = 24) {
        super(scene, x, y);
        this.w = w;
        this.h = h;
        this.value = value;
        this.onCommit = onCommit;
        this.maxLength = maxLength;
        this.create();
    }

    create() {
        this.bg = this.scene.add.graphics();
        this.text = this.scene.add.text(6, this.h / 2, '', Theme.style(16)).setOrigin(0, 0.5);
        this.zone = this.scene.add.zone(0, 0, this.w, this.h).setOrigin(0).setInteractive({ useHandCursor: true });
        this.zone.on("pointerdown", () => this.focus());
        this.add([this.bg, this.text, this.zone]);

        const keydown = (event: KeyboardEvent) => this.handleKey(event);
        const globalDown = (_pointer: Phaser.Input.Pointer, over: Phaser.GameObjects.GameObject[]) => {
            if (TextField.focused === this && !over.includes(this.zone)) {
                this.blur(true);
            }
        };
        this.scene.input.keyboard!.on("keydown", keydown);
        this.scene.input.on("pointerdown", globalDown);
        this.once("destroy", () => {
            this.scene.input.keyboard?.off("keydown", keydown);
            this.scene.input.off("pointerdown", globalDown);
            if (TextField.focused === this) {
                TextField.focused = null;
            }
        });
        this.redraw();
        this.scene.add.existing(this);
    }

    focus() {
        if (TextField.focused === this) {
            return;
        }
        TextField.focused?.blur(true);
        TextField.focused = this;
        this.editValue = this.value;
        this.caretOn = true;
        this.caretTimer = this.scene.time.addEvent({
            delay: 450,
            loop: true,
            callback: () => {
                this.caretOn = !this.caretOn;
                this.redraw();
            }
        });
        this.redraw();
    }

    blur(commit: boolean) {
        if (TextField.focused !== this) {
            return;
        }
        TextField.focused = null;
        this.caretTimer?.remove();
        if (commit && this.editValue !== this.value) {
            this.value = this.editValue;
            this.onCommit(this.value);
        }
        this.redraw();
    }

    handleKey(event: KeyboardEvent) {
        if (TextField.focused !== this) {
            return;
        }
        if (event.key === 'Enter') {
            this.blur(true);
        } else if (event.key === 'Escape') {
            this.blur(false);
        } else if (event.key === 'Backspace') {
            this.editValue = this.editValue.slice(0, -1);
        } else if (event.key.length === 1 && this.editValue.length < this.maxLength) {
            this.editValue += event.key;
        }
        this.caretOn = true;
        this.redraw();
    }

    redraw() {
        const editing = TextField.focused === this;
        this.bg.clear();
        if (editing) {
            this.bg.fillStyle(Theme.panelLight, 0.8);
            this.bg.fillRect(0, 0, this.w, this.h);
            this.bg.lineStyle(2, Theme.systemTime, 1);
            this.bg.strokeRect(0, 0, this.w, this.h);
        } else {
            this.bg.lineStyle(1, Theme.borderDim, 1);
            this.bg.lineBetween(0, this.h - 2, this.w, this.h - 2);
        }
        const shown = editing ? this.editValue + (this.caretOn ? '_' : ' ') : this.value;
        this.text.setText(shown);
    }
}
