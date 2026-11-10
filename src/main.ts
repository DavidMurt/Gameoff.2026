import Phaser from "phaser";
import { MenuScene } from "./scenes/MenuScene";
import { PreloadScene } from "./scenes/PreloadScene";

class Boot extends Phaser.Scene {

    constructor() {
        super("Boot");
    }

    preload() {
		this.load.image('DG', 'assets/DG.png');
		this.load.bitmapFont('pixel', 'assets/fonts/pixel_0.png', 'assets/fonts/pixel.xml');

    }

    create() {
		this.add.text(100, 100, 'Boot Scene', { fontSize: '32px' });
		this.scene.add("MenuScene", MenuScene);
		this.scene.add("PreloadScene", PreloadScene);
		this.scene.start("PreloadScene");
    }
}

window.addEventListener('load', function () {
	
	const game = new Phaser.Game({
		width: 1920,
		height: 1080,
		backgroundColor: "#2f2f2f",
		parent: "game-container",
		scale: {
			mode: Phaser.Scale.ScaleModes.FIT,
			autoCenter: Phaser.Scale.Center.CENTER_BOTH
		},
		scene: [Boot]
	});

	game.scene.start("Boot");
});