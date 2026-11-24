import { SampleData } from "../data/SampleData";
import { GameState } from "../state/GameState";
import { Button } from "./Button";
import { Glass } from "./Glass";
import { Theme } from "./Theme";

// Top bar: batch progress, batch submission (hash), save and menu.
export class BatchBar extends Phaser.GameObjects.Container {
    gs: GameState;
    w: number;
    h: number;
    title: Phaser.GameObjects.Text;
    message: Phaser.GameObjects.Text;
    submit: Button;

    constructor(scene: Phaser.Scene, x: number, y: number, w: number, h: number, state: GameState,
        onMenu: () => void) {
        super(scene, x, y);
        this.gs = state;
        this.w = w;
        this.h = h;
        this.create(onMenu);
    }

    create(onMenu: () => void) {
        const frame = this.scene.add.graphics();
        Glass.panel(frame, 0, 0, this.w, this.h);
        this.title = this.scene.add.text(14, 7, '', Theme.style(20));
        this.message = this.scene.add.text(14, 33, '', Theme.style(14, Theme.textDim));
        this.submit = new Button(this.scene, this.w - 378, 8, 180, this.h - 16, 'SUBMIT BATCH', () => this.onSubmit(), 17);
        const save = new Button(this.scene, this.w - 190, 8, 84, this.h - 16, 'SAVE', () => {
            this.gs.save();
            this.message.setText('Saved.').setColor(Theme.textGreen);
        }, 17);
        const menu = new Button(this.scene, this.w - 98, 8, 84, this.h - 16, 'MENU', onMenu, 17);
        this.add([frame, this.title, this.message, this.submit, save, menu]);
        this.scene.add.existing(this);

        this.gs.on("logsChanged", () => this.refresh());
        this.gs.on("batchChanged", () => this.refresh());
        this.refresh();
        const hash = this.gs.lastAcceptedHash();
        this.message.setText('BASTION Recovery Mode · last accepted hash ' + hash).setColor(Theme.textDim);
    }

    refresh() {
        const p = this.gs.batchProgress();
        const def = SampleData.batches.find((b) => b.batch === this.gs.currentBatch)!;
        const hours = def.firstHour === def.lastHour ? 'HOUR ' + def.firstHour : 'HOURS ' + def.firstHour + '-' + def.lastHour;
        const status = this.gs.finished ? 'INVESTIGATION COMPLETE' : p.done + '/' + p.total + ' COMPLETE';
        this.title.setText('BATCH ' + this.gs.currentBatch + ' of ' + SampleData.batches.length + ' · ' + hours + ' · ' + status);
        this.submit.setEnabled(!this.gs.finished);
    }

    onSubmit() {
        const result = this.gs.submitBatch();
        if (result.accepted) {
            this.message.setText('HASH ' + result.hash + ' ACCEPTED · next batch decrypted').setColor(Theme.textGreen);
        } else {
            this.message.setText('HASH ' + result.hash + ' REJECTED · ' + result.incomplete + ' log(s) incomplete')
                .setColor(Theme.textRed);
        }
    }
}
