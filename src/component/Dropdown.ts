import { Button } from "./Button";
import { Glass } from "./Glass";
import { Theme } from "./Theme";

export interface DropdownItem {
    value: string;
    label: string;
}

// A button that opens a list of choices below it. The list is built fresh each time it opens.
export class Dropdown extends Phaser.GameObjects.Container {
    button: Button;
    menu: Phaser.GameObjects.Container | null = null;
    w: number;
    h: number;
    getItems: () => DropdownItem[];
    onSelect: (value: string) => void;

    constructor(scene: Phaser.Scene, x: number, y: number, w: number, h: number,
        getItems: () => DropdownItem[], onSelect: (value: string) => void) {
        super(scene, x, y);
        this.w = w;
        this.h = h;
        this.getItems = getItems;
        this.onSelect = onSelect;
        this.create();
    }

    create() {
        this.button = new Button(this.scene, 0, 0, this.w, this.h, '', () => this.toggle(), 16);
        this.button.label.setOrigin(0, 0.5).setX(10).setAlign('left');
        const arrow = this.scene.add.text(this.w - 22, this.h / 2, '▼', Theme.style(16)).setOrigin(0.5);
        this.add([this.button, arrow]);
        this.scene.add.existing(this);
    }

    setText(text: string) {
        this.button.setText(text);
    }

    toggle() {
        if (this.menu) {
            this.close();
            return;
        }
        const items = this.getItems();
        const rowH = 34;
        const bounds = this.getBounds();
        this.menu = this.scene.add.container(bounds.x, bounds.y + this.h).setDepth(1000);
        // A full-screen blocker closes the list when the player clicks anywhere else.
        const blocker = this.scene.add.zone(-bounds.x, -bounds.y - this.h, this.scene.scale.width, this.scene.scale.height)
            .setOrigin(0).setInteractive();
        blocker.on("pointerdown", () => this.close());
        this.menu.add(blocker);
        const bg = this.scene.add.graphics();
        bg.fillStyle(Theme.background, 0.92);
        bg.fillRect(0, 0, this.w, rowH * items.length);
        Glass.glowRect(bg, 0, 0, this.w, rowH * items.length, Theme.border);
        this.menu.add(bg);
        items.forEach((item, i) => {
            const row = new Button(this.scene, 0, i * rowH, this.w, rowH, item.label, () => {
                this.close();
                this.onSelect(item.value);
            }, 16);
            row.label.setOrigin(0, 0.5).setX(10);
            this.menu!.add(row);
        });
    }

    close() {
        if (this.menu) {
            this.menu.destroy();
            this.menu = null;
        }
    }
}
