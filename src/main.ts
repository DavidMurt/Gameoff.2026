import "./PhaserGlobal";
import Phaser from "phaser";
import { EndScene } from "./scenes/EndScene";
import { GameScene } from "./scenes/GameScene";
import { LogEditorScene } from "./scenes/LogEditorScene";
import { MenuScene } from "./scenes/MenuScene";
import { PreloadScene } from "./scenes/PreloadScene";
import { DataChecker } from "./data/DataChecker";
import { SampleData } from "./data/SampleData";

class Boot extends Phaser.Scene {

    constructor() {
        super("Boot");
    }

    preload() {
        this.load.image('DG', 'assets/DG.png');
        this.load.bitmapFont('pixel', 'assets/fonts/pixel_0.png', 'assets/fonts/pixel.xml');
    }

    create() {
        DataChecker.checkOverlaps(SampleData.logs);
        this.scene.add("PreloadScene", PreloadScene);
        this.scene.add("MenuScene", MenuScene);
        this.scene.add("GameScene", GameScene);
        this.scene.add("EndScene", EndScene);
        this.scene.add("LogEditorScene", LogEditorScene);
        this.scene.start("PreloadScene");
    }
}

window.addEventListener('load', function () {

    const game = new Phaser.Game({
        width: 1920,
        height: 1080,
        backgroundColor: "#2f2f2f",
        parent: "game-container",
        dom: { createContainer: true },
        scale: {
            mode: Phaser.Scale.ScaleModes.FIT,
            autoCenter: Phaser.Scale.Center.CENTER_BOTH
        },
        scene: [Boot]
    });

    game.scene.start("Boot");
});
