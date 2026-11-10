// import { LoadThing } from '../component/LoadThing';
export class PreloadScene extends Phaser.Scene {
    loadingBar: Phaser.GameObjects.Graphics;
    loadingOutline: Phaser.GameObjects.Graphics;
    preload() {
                // var LoadThingComponent = new LoadThing(this);
        // LoadThingComponent.setPosition(this.cameras.main.width / 2, this.cameras.main.height / 2);
        var logo = this.add.image(0, 0, 'DG').setScale(2);
        logo.setPosition(this.cameras.main.width / 2, this.cameras.main.height / 2 - 50);

        //Load the assets here:
        var loadingText = this.add.bitmapText(this.cameras.main.width / 2, this.cameras.main.height / 2 , 'pixel', 'Loading').setScale(1);
        loadingText.setOrigin(0.5);
        // var loadingText = this.scene.add.text(0, 45, 'Loading').setAlign('center').setFontFamily('SF Intermosaic').setFontSize('30px').setColor('#ffffff').setScale(.25);
        // loadingText.setOrigin(0.5);
        let c = 0;
        this.time.addEvent({
            delay: 300,
            callback: () => {
                c++;
                loadingText.setText('.'.repeat(c % 4) + 'Loading' + '.'.repeat(c % 4));

            },
            repeat: -1
        });

        this.load.on("complete", () => {
            // this.loadingBar.destroy();
            // loadingText.destroy();
            console.log("Loading complete!");
            this.scene.start("MenuScene");
        });

        this.load.on("progress", (value: number) => {

			this.loadingBar.scaleX = value;
		});


        this.loadingOutline = this.add.graphics();
        this.loadingOutline.lineStyle(2, 0xffffff, 1);
        this.loadingOutline.strokeRect(this.cameras.main.width / 2 - 50, this.cameras.main.height / 2 + 10, 100, 10);
        

        this.loadingBar = this.add.graphics();

        this.loadingBar.lineStyle(2, 0xffffff, 1);
        this.loadingBar.fillStyle(0xffffff, 1);
        this.loadingBar.fillRect(this.cameras.main.width / 2 - 50, this.cameras.main.height / 2 + 10, 100, 10).setScale(0,1);


        // this.load.image('background', 'assets/background.png');
        this.load.font('munro', 'assets/fonts/munro.ttf');

        // this.scene.start("MenuScene");

    }


    create() {


    }

    update() {
    // Code to update the scene each frame
    }
}   