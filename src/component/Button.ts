import { Theme } from "./Theme";

// A flat console button. "active" draws it filled (e.g. a set lock), "enabled" greys it out.
export class Button extends Phaser.GameObjects.Container {
    bg: Phaser.GameObjects.Graphics;
    label: Phaser.GameObjects.Text;
    zone: Phaser.GameObjects.Zone;
    w: number;
    h: number;
    enabled = true;
    toggled = false;
    hovered = false;
    onClick: (pointer: Phaser.Input.Pointer) => void;

    constructor(scene: Phaser.Scene, x: number, y: number, w: number, h: number, text: string,
        onClick: (pointer: Phaser.Input.Pointer) => void, fontSize = 18) {
        super(scene, x, y);
        this.w = w;
        this.h = h;
        this.onClick = onClick;
        this.create(text, fontSize);
    }

    create(text: string, fontSize: number) {
        this.bg = this.scene.add.graphics();
        this.label = this.scene.add.text(this.w / 2, this.h / 2, text, Theme.style(fontSize)).setOrigin(0.5);
        this.label.setAlign('center');
        this.zone = this.scene.add.zone(0, 0, this.w, this.h).setOrigin(0).setInteractive({ useHandCursor: true });
        this.zone.on("pointerover", () => {
            this.hovered = true;
            this.redraw();
        });
        this.zone.on("pointerout", () => {
            this.hovered = false;
            this.redraw();
        });
        this.zone.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
            if (this.enabled) {
                this.onClick(pointer);
            }
        });
        this.add([this.bg, this.label, this.zone]);
        this.redraw();
        this.scene.add.existing(this);
    }

    setText(text: string): this {
        this.label.setText(text);
        return this;
    }

    setEnabled(enabled: boolean): this {
        this.enabled = enabled;
        this.redraw();
        return this;
    }

    setToggled(toggled: boolean): this {
        this.toggled = toggled;
        this.redraw();
        return this;
    }

    redraw() {
        this.bg.clear();
        const fill = this.toggled ? Theme.border : (this.hovered && this.enabled ? 0x3a3a3a : Theme.panel);
        this.bg.fillStyle(fill, 1);
        this.bg.fillRect(0, 0, this.w, this.h);
        this.bg.lineStyle(2, this.enabled ? Theme.border : Theme.borderDim, 1);
        this.bg.strokeRect(0, 0, this.w, this.h);
        this.label.setColor(!this.enabled ? '#555555' : (this.toggled ? Theme.textDark : Theme.text));
    }
}
