import { Button } from "../component/Button";
import { Theme } from "../component/Theme";
import { Clock } from "../state/Clock";
import { GameState } from "../state/GameState";

// Shown when every batch is complete: the reconstructed night, in time order.
export class EndScene extends Phaser.Scene {

    constructor() {
        super("EndScene");
    }

    create() {
        const state = this.registry.get('state') as GameState;
        const cx = this.cameras.main.width / 2;
        this.add.text(cx, 90, 'INVESTIGATION COMPLETE', Theme.style(56)).setOrigin(0.5);
        this.add.text(cx, 150, 'Every log has been placed. The night, as reconstructed:', Theme.style(22, Theme.textDim)).setOrigin(0.5);

        const logs = state.releasedLogs().slice().sort((a, b) =>
            state.logState(a.id).time! - state.logState(b.id).time! || a.id.localeCompare(b.id));
        logs.forEach((log, i) => {
            const ls = state.logState(log.id);
            const speakers = [...new Set(log.entries.filter((e) => e.badgeId).map((e) => state.badgeLabel(e.badgeId!)))];
            const line = Clock.format(ls.time!) + '-' + Clock.format(ls.time! + log.duration) + '   ' +
                ('Room ' + state.roomLabel(ls.room!)).padEnd(30) + '  Log ' + log.id + '   ' + speakers.join(', ');
            this.add.text(160, 230 + i * 44, line, Theme.style(20));
        });

        this.add.text(cx, 860, 'Final hash ' + state.lastAcceptedHash(), Theme.style(20, Theme.textGreen)).setOrigin(0.5);
        this.add.text(cx, 900, '(Placeholder ending. More of the night is still to be written.)', Theme.style(18, Theme.textDim)).setOrigin(0.5);
        new Button(this, cx - 340, 950, 320, 60, 'REVIEW THE LOGS', () => this.scene.start("GameScene"), 22);
        new Button(this, cx + 20, 950, 320, 60, 'MAIN MENU', () => this.scene.start("MenuScene"), 22);
    }
}
