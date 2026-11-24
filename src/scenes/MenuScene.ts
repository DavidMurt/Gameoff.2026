import { Button } from "../component/Button";
import { Glass } from "../component/Glass";
import { Theme } from "../component/Theme";
import { Wallpaper } from "../component/Wallpaper";
import { GameState } from "../state/GameState";

// Main menu: new investigation, continue, settings. A new game shows the shift handover briefing first.
export class MenuScene extends Phaser.Scene {
    overlay: Phaser.GameObjects.Container | null = null;
    continueButton: Button;

    constructor() {
        super("MenuScene");
    }

    create() {
        this.overlay = null;
        const cx = this.cameras.main.width / 2;
        const cy = this.cameras.main.height / 2;

        new Wallpaper(this);
        const g = this.add.graphics();
        Glass.panel(g, cx - 420, cy - 330, 840, 660, 0.65, 28);
        Theme.glowText(this.add.text(cx, cy - 250, 'NIGHT SHIFT', Theme.titleStyle(72)).setOrigin(0.5), Theme.glow, 24);
        this.add.text(cx, cy - 175, 'BASTION Recovery Mode · emergency console', Theme.style(22, Theme.textDim)).setOrigin(0.5);
        this.add.text(cx, cy - 135, 'MAIN SECURITY SUITE OFFLINE · VIDEO ARCHIVE OFFLINE', Theme.style(18, Theme.textRed)).setOrigin(0.5);

        new Button(this, cx - 200, cy - 60, 400, 64, 'NEW INVESTIGATION', () => this.newGame(), 24);
        this.continueButton = new Button(this, cx - 200, cy + 20, 400, 64, 'CONTINUE', () => this.continueGame(), 24);
        this.continueButton.setEnabled(GameState.hasSave());
        new Button(this, cx - 200, cy + 100, 400, 64, 'SETTINGS', () => this.showSettings(), 24);

        this.add.text(cx, cy + 290, 'Game Off 2026 · theme: Shift · placeholder logs', Theme.style(16, Theme.textDim)).setOrigin(0.5);
    }

    newGame() {
        GameState.clearSave();
        this.registry.set('state', GameState.newGame());
        this.showBriefing();
    }

    continueGame() {
        const state = GameState.load();
        if (!state) {
            this.continueButton.setEnabled(false);
            return;
        }
        this.registry.set('state', state);
        this.scene.start(state.finished ? "EndScene" : "GameScene");
    }

    openOverlay(w: number, h: number): Phaser.GameObjects.Container {
        this.overlay?.destroy();
        const cx = this.cameras.main.width / 2;
        const cy = this.cameras.main.height / 2;
        const overlay = this.add.container(0, 0).setDepth(100);
        const blocker = this.add.zone(0, 0, this.cameras.main.width, this.cameras.main.height).setOrigin(0).setInteractive();
        const g = this.add.graphics();
        g.fillStyle(Theme.background, 0.7);
        g.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
        Glass.panel(g, cx - w / 2, cy - h / 2, w, h, 0.85, 28);
        overlay.add([blocker, g]);
        this.overlay = overlay;
        return overlay;
    }

    closeOverlay() {
        this.overlay?.destroy();
        this.overlay = null;
    }

    showBriefing() {
        const cx = this.cameras.main.width / 2;
        const cy = this.cameras.main.height / 2;
        const overlay = this.openOverlay(1100, 760);
        const text = [
            'SHIFT HANDOVER · 07:00',
            '',
            'Something happened on the night shift. The main security suite is down, the',
            'video archive is gone, and the staff records linking badges to names were wiped.',
            'All you have is the BASTION emergency console and what is left of the AI',
            'transcription logs. Every log has lost its room and its timestamp.',
            '',
            'Your job: put every log back in the right ROOM at the right TIME.',
            '',
            '· Mouse wheel moves system time. Every panel follows it.',
            '· Left click a room for viewer 1, right click for viewer 2.',
            '· ⇄ ALL ROOMS: drag logs out of UNPLACED into a room, on the 15-minute grid.',
            '· Lock the room and the time in a viewer. Both locked = the log is verified.',
            '· Fill in names, roles and room descriptions as you work them out.',
            '· When every log in the batch is correct, submit it. Its hash decrypts the next batch.'
        ].join('\n');
        overlay.add(this.add.text(cx - 510, cy - 340, text, Theme.style(22)).setLineSpacing(8));
        overlay.add(new Button(this, cx - 160, cy + 280, 320, 60, 'BEGIN SHIFT', () => this.scene.start("GameScene"), 24));
    }

    showSettings() {
        const cx = this.cameras.main.width / 2;
        const cy = this.cameras.main.height / 2;
        const overlay = this.openOverlay(600, 420);
        overlay.add(this.add.text(cx, cy - 160, 'SETTINGS', Theme.titleStyle(30)).setOrigin(0.5));
        overlay.add(new Button(this, cx - 200, cy - 90, 400, 56, 'TOGGLE FULLSCREEN', () => this.scale.toggleFullscreen(), 22));
        const erase = new Button(this, cx - 200, cy - 14, 400, 56, 'ERASE SAVED GAME', () => {
            GameState.clearSave();
            this.continueButton.setEnabled(false);
            erase.setText('SAVE ERASED').setEnabled(false);
        }, 22);
        erase.setEnabled(GameState.hasSave());
        overlay.add(erase);
        overlay.add(this.add.text(cx, cy + 74, 'Audio: none yet', Theme.style(18, Theme.textDim)).setOrigin(0.5));
        overlay.add(new Button(this, cx - 120, cy + 120, 240, 56, 'BACK', () => this.closeOverlay(), 22));
    }
}
