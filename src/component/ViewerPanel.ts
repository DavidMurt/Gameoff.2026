import { Log } from "../data/Types";
import { Clock } from "../state/Clock";
import { GameState } from "../state/GameState";
import { Button } from "./Button";
import { Dropdown } from "./Dropdown";
import { Theme } from "./Theme";

interface Row {
    minute: number;
    y: number;
    h: number;
    entry: boolean;
    objects: Phaser.GameObjects.Text[];
}

// Viewer 1 / viewer 2: shows the transcript of one room (or one unplaced log), bound to system time.
export class ViewerPanel extends Phaser.GameObjects.Container {
    static readonly bodyTop = 156;
    static readonly textX = 78;

    gs: GameState;
    index: number;
    w: number;
    h: number;
    dropdown: Dropdown;
    lockRoom: Button;
    lockTime: Button;
    selectedText: Phaser.GameObjects.Text;
    statusText: Phaser.GameObjects.Text;
    highlight: Phaser.GameObjects.Graphics;
    message: Phaser.GameObjects.Text;
    nowText: Phaser.GameObjects.Text;
    rows: Row[] = [];
    topAligned = false;

    constructor(scene: Phaser.Scene, x: number, y: number, w: number, h: number, state: GameState, index: number) {
        super(scene, x, y);
        this.gs = state;
        this.index = index;
        this.w = w;
        this.h = h;
        this.create();
    }

    get bodyBottom(): number {
        return this.h - 36;
    }

    create() {
        const frame = this.scene.add.graphics();
        frame.fillStyle(Theme.panel, 1);
        frame.fillRect(0, 0, this.w, this.h);
        frame.lineStyle(3, Theme.border, 1);
        frame.strokeRect(0, 0, this.w, this.h);
        frame.fillStyle(Theme.viewerColors[this.index], 1);
        frame.fillRect(0, 0, this.w, 8);
        frame.lineStyle(2, Theme.border, 1);
        frame.lineBetween(0, ViewerPanel.bodyTop - 6, this.w, ViewerPanel.bodyTop - 6);
        const title = this.scene.add.text(16, 20, 'VIEWER ' + (this.index + 1), Theme.style(26));

        this.dropdown = new Dropdown(this.scene, 14, 62, 196, 46,
            () => this.gs.audioRooms().map((r) => ({ value: r.id, label: this.gs.roomLabel(r.id) })),
            (value) => this.gs.setViewer(this.index, { kind: 'room', id: value }));
        this.lockRoom = new Button(this.scene, 218, 62, 88, 46, 'LOCK\nROOM', () => this.toggleLock('room'), 14);
        this.lockTime = new Button(this.scene, 312, 62, 88, 46, 'LOCK\nTIME', () => this.toggleLock('time'), 14);
        this.selectedText = this.scene.add.text(16, 120, '', Theme.style(16));
        this.statusText = this.scene.add.text(0, 120, '', Theme.style(16));
        this.highlight = this.scene.add.graphics();
        this.message = this.scene.add.text(this.w / 2, ViewerPanel.bodyTop + 200, '', Theme.style(18, Theme.textDim))
            .setOrigin(0.5).setAlign('center');
        const hint = this.scene.add.text(16, this.h - 28, 'current system time is always centred',
            Theme.style(13, Theme.textDim));
        this.add([frame, title, this.highlight, this.message, this.selectedText, this.statusText, hint,
            this.lockRoom, this.lockTime, this.dropdown]);
        this.scene.add.existing(this);

        const rebuild = () => this.rebuild();
        this.gs.on("viewerChanged", rebuild);
        this.gs.on("logsChanged", rebuild);
        this.gs.on("namesChanged", rebuild);
        this.gs.on("batchChanged", rebuild);
        this.gs.on("timeChanged", () => {
            this.layout();
            this.updateHeader();
        });
        this.rebuild();
    }

    toggleLock(lock: 'room' | 'time') {
        const log = this.gs.selectedLog(this.index);
        if (!log) {
            return;
        }
        const ls = this.gs.logState(log.id);
        this.gs.setLock(log.id, lock, lock === 'room' ? !ls.roomLocked : !ls.timeLocked);
    }

    updateHeader() {
        const v = this.gs.viewers[this.index];
        if (!v) {
            this.dropdown.setText('Select a room');
        } else if (v.kind === 'room') {
            this.dropdown.setText(this.gs.roomLabel(v.id).slice(0, 17));
        } else {
            this.dropdown.setText('Log ' + v.id + ' (unplaced)');
        }

        const log = this.gs.selectedLog(this.index);
        if (!log) {
            this.selectedText.setText('SELECTED: none at ' + Clock.format(this.gs.systemTime));
            this.statusText.setText('');
            this.lockRoom.setEnabled(false).setToggled(false);
            this.lockTime.setEnabled(false).setToggled(false);
            return;
        }
        const ls = this.gs.logState(log.id);
        const status = this.gs.statusText(log.id);
        this.selectedText.setText('SELECTED: LOG #' + log.id + ' · ');
        this.statusText.setX(this.selectedText.x + this.selectedText.width).setText(status)
            .setColor(Theme.statusColor(status));
        const canLock = ls.room !== undefined && !ls.complete && !this.gs.checking.has(log.id);
        this.lockRoom.setEnabled(canLock).setToggled(ls.roomLocked);
        this.lockTime.setEnabled(canLock).setToggled(ls.timeLocked);
        this.lockRoom.setText(ls.roomLocked ? 'ROOM\nLOCKED ✓' : 'LOCK\nROOM');
        this.lockTime.setText(ls.timeLocked ? 'TIME\nLOCKED ✓' : 'LOCK\nTIME');
    }

    rebuild() {
        this.rows.forEach((row) => row.objects.forEach((o) => o.destroy()));
        this.rows = [];
        this.message.setText('');
        this.updateHeader();

        const v = this.gs.viewers[this.index];
        if (!v) {
            this.message.setText('Click a room on the map\n(left: viewer 1, right: viewer 2)\nor pick one above.');
            this.layout();
            return;
        }
        if (v.kind === 'log') {
            this.topAligned = true;
            const log = this.gs.log(v.id);
            this.addHeader(log, 'LOG ' + log.id + ' · ' + log.duration + ' MIN · UNPLACED', -1);
            log.entries.forEach((e) => this.addEntry(e.offset, Clock.offset(e.offset), e.badgeId, e.text));
            this.layout();
            return;
        }

        this.topAligned = false;
        const room = this.gs.room(v.id);
        if (room.audio === 'none') {
            this.message.setText('NO AUDIO SENSOR\nin room ' + room.id);
        } else if (room.audio === 'broken') {
            this.message.setText('NO SIGNAL');
        } else {
            const logs = this.gs.placedLogsInRoom(room.id);
            if (logs.length === 0) {
                this.message.setText('No logs placed\nin room ' + room.id);
            }
            logs.forEach((log) => {
                const t = this.gs.logState(log.id).time!;
                this.addHeader(log, 'LOG ' + log.id + ' · ' + Clock.format(t) + '-' + Clock.format(t + log.duration) +
                    ' · ' + this.gs.statusText(log.id), t - 0.5);
                log.entries.forEach((e) => this.addEntry(t + e.offset, Clock.format(t + e.offset), e.badgeId, e.text));
            });
        }
        this.layout();
    }

    addHeader(log: Log, text: string, minute: number) {
        const status = this.gs.statusText(log.id);
        const color = status === 'CORRECT' || status === 'INCORRECT' ? Theme.statusColor(status) : Theme.textDim;
        const t = this.scene.add.text(16, 0, '── ' + text + ' ──', Theme.style(14, color));
        this.add(t);
        this.pushRow(minute, t.height + 10, false, [t]);
    }

    addEntry(minute: number, timeText: string, badgeId: string | undefined, text: string) {
        const time = this.scene.add.text(16, 0, timeText, Theme.style(17, Theme.textDim));
        const content = badgeId ? '<' + this.gs.badgeLabel(badgeId) + '> ' + text : text;
        const body = this.scene.add.text(ViewerPanel.textX, 0, content,
            Theme.style(17, badgeId ? Theme.text : Theme.textSound));
        body.setWordWrapWidth(this.w - ViewerPanel.textX - 14);
        this.add([time, body]);
        this.pushRow(minute, body.height + 8, true, [time, body]);
    }

    pushRow(minute: number, h: number, entry: boolean, objects: Phaser.GameObjects.Text[]) {
        const last = this.rows[this.rows.length - 1];
        const y = last ? last.y + last.h : 0;
        const gap = !entry && last ? 14 : 0;
        this.rows.push({ minute, y: y + gap, h, entry, objects });
    }

    // Place the rows so the current minute sits in the middle of the body.
    layout() {
        const top = ViewerPanel.bodyTop;
        const bottom = this.bodyBottom;
        const mid = (top + bottom) / 2;
        const t = this.gs.systemTime;
        this.highlight.clear();
        if (this.rows.length === 0) {
            return;
        }
        let shift: number;
        let showNowLine = false;
        if (this.topAligned) {
            shift = top + 10;
        } else {
            const current = this.rows.filter((r) => r.entry && r.minute === t);
            const next = this.rows.find((r) => r.entry && r.minute > t);
            if (current.length > 0) {
                const first = current[0];
                const last = current[current.length - 1];
                shift = mid - (first.y + last.y + last.h) / 2;
                this.highlight.fillStyle(Theme.highlight, 1);
                this.highlight.fillRect(4, first.y + shift - 4, this.w - 8, last.y + last.h - first.y);
            } else if (next) {
                // Keep the log's header line below the "now" marker too.
                const before = this.rows[this.rows.indexOf(next) - 1];
                const startY = before && !before.entry ? before.y : next.y;
                shift = mid + 14 - startY;
                showNowLine = true;
            } else {
                const last = this.rows[this.rows.length - 1];
                shift = mid - 14 - (last.y + last.h);
                showNowLine = true;
            }
        }
        if (showNowLine) {
            this.highlight.lineStyle(2, Theme.systemTime, 0.8);
            this.highlight.lineBetween(70, mid, this.w - 8, mid);
            this.highlight.fillStyle(Theme.systemTime, 1);
            this.highlight.fillTriangle(6, mid - 7, 6, mid + 7, 16, mid);
        }
        this.rows.forEach((row) => {
            const y = row.y + shift;
            const visible = y >= top && y + row.h <= bottom + 8;
            row.objects.forEach((o) => o.setY(y).setVisible(visible));
        });
        if (showNowLine) {
            // Keep the "now" marker readable: the time is shown on the left of the line.
            this.highlight.fillStyle(Theme.panel, 1);
            this.highlight.fillRect(18, mid - 10, 50, 20);
        }
        this.nowLabel(showNowLine, mid);
    }

    nowLabel(show: boolean, y: number) {
        if (!this.nowText) {
            this.nowText = this.scene.add.text(20, 0, '', Theme.style(15, Theme.textAmber)).setOrigin(0, 0.5);
            this.add(this.nowText);
        }
        this.nowText.setVisible(show).setY(y).setText(Clock.format(this.gs.systemTime));
    }
}
