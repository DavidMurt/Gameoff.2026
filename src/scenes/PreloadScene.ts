export class PreloadScene extends Phaser.Scene {
    loadingBar: Phaser.GameObjects.Graphics;
    loadingOutline: Phaser.GameObjects.Graphics;

    constructor() {
        super("PreloadScene");
    }

    preload() {
        const cx = this.cameras.main.width / 2;
        const cy = this.cameras.main.height / 2;
        this.add.image(cx, cy - 100, 'DG').setScale(4);

        const loadingText = this.add.bitmapText(cx, cy, 'pixel', 'Loading').setScale(3).setOrigin(0.5);
        let c = 0;
        this.time.addEvent({
            delay: 300,
            callback: () => {
                c++;
                loadingText.setText('.'.repeat(c % 4) + 'Loading' + '.'.repeat(c % 4));
            },
            repeat: -1
        });

        this.loadingOutline = this.add.graphics();
        this.loadingOutline.lineStyle(2, 0xffffff, 1);
        this.loadingOutline.strokeRect(cx - 150, cy + 40, 300, 20);

        this.loadingBar = this.add.graphics({ x: cx - 150, y: cy + 40 });
        this.loadingBar.fillStyle(0xffffff, 1);
        this.loadingBar.fillRect(0, 0, 300, 20);
        this.loadingBar.scaleX = 0;

        this.load.on("progress", (value: number) => {
            this.loadingBar.scaleX = value;
        });
        this.load.on("complete", () => {
            this.scene.start("MenuScene");
        });

        // Load the game assets here.
        this.load.font('munro', 'assets/fonts/munro.ttf');
    }
}
