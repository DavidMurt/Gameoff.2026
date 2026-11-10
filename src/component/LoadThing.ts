export class LoadThing extends Phaser.GameObjects.Container {
    loadingBar: Phaser.GameObjects.Graphics;
    
    constructor(scene: Phaser.Scene) {
        super(scene);
        this.scene = scene;
        this.create();
    }

    create() {
        var logo = this.scene.add.image(0, -20, 'DG').setScale(2);
        //Set the logo to 25% of the screen height while maintaining aspect ratio
        //This will ensure the logo is not too big for the screen   

        // logo.setDisplaySize(this.cameras.main.width * 0.25, this.cameras.main.height * 0.25);
        //Move it to the center
        //Add a loading bar under the logo
        this.loadingBar = this.scene.add.graphics();
        this.loadingBar.lineStyle(2, 0xffffff, 1);
        this.loadingBar.fillStyle(0xffffff, 1);
        this.loadingBar.fillRect(-30, 20, 60, 20).setScale(0,1);
        //Add a text to the loading bar
        var loadingText = this.scene.add.bitmapText(-15,10, 'pixel', 'Loading').setScale(1);
        // var loadingText = this.scene.add.text(0, 45, 'Loading').setAlign('center').setFontFamily('SF Intermosaic').setFontSize('30px').setColor('#ffffff').setScale(.25);
        // loadingText.setOrigin(0.5);
        let c = 0;
        this.scene.time.addEvent({
            delay: 300,
            callback: () => {
                c++;
                loadingText.setText('Loading' + '.'.repeat(c % 4));

            },
            repeat: -1
        });
        this.scene.load.on("progress", (value: number) => {

			this.loadingBar.scaleX = value;
		});

        this.scene.load.on("complete", () => {
            this.loadingBar.destroy();
            loadingText.destroy();
            console.log("Loading complete!");
            // this.scene.start("MenuScene");
        });
        this.scene.add.existing(this);

        this.add(logo);
        this.add(this.loadingBar);
        this.add(loadingText);
        // this.scene.cameras.main.setBackgroundColor(0x2f2f2f);
    }

}