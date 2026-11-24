import { LineWrap, WrappedLine } from "../data/LineWrap";
import { Log } from "../data/Types";
import { Clock } from "../state/Clock";
import { GameState } from "../state/GameState";
import { Button } from "./Button";
import { Dropdown } from "./Dropdown";
import { Glass } from "./Glass";
import { Theme } from "./Theme";

// One on-screen minute: its time label, a log tag and a fixed number of transcript lines.
interface MinuteSlot {
    time: Phaser.GameObjects.Text;
    tag: Phaser.GameObjects.Text;
    lines: Phaser.GameObjects.Text[];
}

// A log shown in the viewer, in the viewer's own minutes (shift minutes, or offsets for an unplaced log).
interface LogSpan {
    log: Log;
    start: number;
    end: number;
}

// Viewer 1 / viewer 2: shows the transcript of one room (or one unplaced log), bound to system time.
// The body is a fixed time grid: every minute is exactly LineWrap.linesPerMinute lines tall,
// whether or not anything was said, so both viewers always line up minute for minute.
export class ViewerPanel extends Phaser.GameObjects.Container {
    static readonly bodyTop = 156;
    static readonly textX = 78;
    static readonly lineH = 22;
    static readonly minutePad = 6;

    gs: GameState;
    index: number;
    w: number;
    h: number;
    dropdown: Dropdown;
    lockRoom: Button;
    lockTime: Button;
    selectedText: Phaser.GameObjects.Text;
    statusText: Phaser.GameObjects.Text;
    grid: Phaser.GameObjects.Graphics;
    message: Phaser.GameObjects.Text;
    slots: MinuteSlot[] = [];
    // What the body shows, rebuilt when the viewer, logs or names change.
    minuteLines = new Map<number, WrappedLine[]>();
    spans: LogSpan[] = [];
    firstMinute = 0;
    lastMinute = -1;
    showsUnplaced = false;

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

    get minuteH(): number {
        return LineWrap.linesPerMinute * ViewerPanel.lineH + ViewerPanel.minutePad;
    }

    create() {
        const frame = this.scene.add.graphics();
        Glass.panel(frame, 0, 0, this.w, this.h);
        frame.fillStyle(Theme.viewerColors[this.index], 1);
        frame.fillRect(0, 0, this.w - 24, 5);
        frame.lineStyle(1, Theme.border, 0.45);
        frame.lineBetween(0, ViewerPanel.bodyTop - 6, this.w, ViewerPanel.bodyTop - 6);
        const title = Theme.glowText(this.scene.add.text(16, 20, 'VIEWER ' + (this.index + 1), Theme.titleStyle(22)));

        this.dropdown = new Dropdown(this.scene, 14, 62, 196, 46,
            () => this.gs.audioRooms().map((r) => ({ value: r.id, label: this.gs.roomLabel(r.id) })),
            (value) => this.gs.setViewer(this.index, { kind: 'room', id: value }));
        this.lockRoom = new Button(this.scene, 218, 62, 88, 46, 'LOCK\nROOM', () => this.toggleLock('room'), 14);
        this.lockTime = new Button(this.scene, 312, 62, 88, 46, 'LOCK\nTIME', () => this.toggleLock('time'), 14);
        this.selectedText = this.scene.add.text(16, 120, '', Theme.style(16));
        this.statusText = this.scene.add.text(0, 120, '', Theme.style(16));
        this.grid = this.scene.add.graphics();
        this.message = this.scene.add.text(this.w / 2, ViewerPanel.bodyTop + 200, '', Theme.style(18, Theme.textDim))
            .setOrigin(0.5).setAlign('center');
        const hint = this.scene.add.text(16, this.h - 28, 'current system time is always centred',
            Theme.style(13, Theme.textDim));
        this.add([frame, title, this.grid, this.message, this.selectedText, this.statusText, hint,
            this.lockRoom, this.lockTime, this.dropdown]);
        this.createSlots();
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

    // Enough minute slots to cover the body plus a partial minute at each edge. They are reused as time moves.
    createSlots() {
        const count = Math.ceil((this.bodyBottom - ViewerPanel.bodyTop) / this.minuteH) + 2;
        for (let i = 0; i < count; i++) {
            const time = this.scene.add.text(16, 0, '', Theme.style(16, Theme.textDim));
            const tag = this.scene.add.text(16, 0, '', Theme.style(12, Theme.textDim));
            const lines: Phaser.GameObjects.Text[] = [];
            for (let l = 0; l < LineWrap.linesPerMinute; l++) {
                lines.push(this.scene.add.text(ViewerPanel.textX, 0, '', Theme.style(16)));
            }
            this.add([time, tag, ...lines]);
            this.slots.push({ time, tag, lines });
        }
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
        this.minuteLines.clear();
        this.spans = [];
        this.firstMinute = 0;
        this.lastMinute = -1;
        this.showsUnplaced = false;
        this.message.setText('');
        this.updateHeader();

        const v = this.gs.viewers[this.index];
        if (!v) {
            this.message.setText('Click a room on the map\n(left: viewer 1, right: viewer 2)\nor pick one above.');
        } else if (v.kind === 'log') {
            // An unplaced log is shown in its own offsets, starting at the top of the unlocked range,
            // so the mouse wheel scrolls through it like a room.
            const log = this.gs.log(v.id);
            this.showsUnplaced = true;
            this.lastMinute = log.duration - 1;
            this.addLog(log, 0);
        } else {
            const room = this.gs.room(v.id);
            if (room.audio === 'none') {
                this.message.setText('NO AUDIO SENSOR\nin room ' + room.id);
            } else if (room.audio === 'broken') {
                this.message.setText('NO SIGNAL');
            } else {
                const r = this.gs.range();
                this.firstMinute = r.start;
                this.lastMinute = r.end - 1;
                this.gs.placedLogsInRoom(room.id).forEach((log) => this.addLog(log, this.gs.logState(log.id).time!));
            }
        }
        this.layout();
    }

    addLog(log: Log, start: number) {
        this.spans.push({ log, start, end: start + log.duration });
        const byMinute = new Map<number, typeof log.entries>();
        log.entries.forEach((e) => byMinute.set(start + e.offset, [...(byMinute.get(start + e.offset) ?? []), e]));
        byMinute.forEach((entries, minute) => {
            // More lines than a minute holds is an authoring error (the log editor flags it); the extra lines are cut.
            const lines = LineWrap.minuteLines(entries, (id) => this.gs.badgeNames[id] ?? '');
            this.minuteLines.set(minute, lines.slice(0, LineWrap.linesPerMinute));
        });
    }

    // The minute shown in the middle of the body.
    currentMinute(): number {
        if (this.showsUnplaced) {
            return Phaser.Math.Clamp(this.gs.systemTime - this.gs.range().start, 0, this.lastMinute);
        }
        return this.gs.systemTime;
    }

    spanAt(minute: number): LogSpan | undefined {
        return this.spans.find((s) => minute >= s.start && minute < s.end);
    }

    // Place the minute grid so the current minute sits in the middle of the body.
    layout() {
        const top = ViewerPanel.bodyTop;
        const bottom = this.bodyBottom;
        const mh = this.minuteH;
        const current = this.currentMinute();
        const currentY = (top + bottom) / 2 - mh / 2;
        const firstShown = current - Math.ceil((currentY - top) / mh);
        const g = this.grid;
        g.clear();

        this.slots.forEach((slot, i) => {
            const minute = firstShown + i;
            const y = currentY + (minute - current) * mh;
            const inRange = minute >= this.firstMinute && minute <= this.lastMinute;
            const span = inRange ? this.spanAt(minute) : undefined;
            const lines = (inRange && this.minuteLines.get(minute)) || [];
            const inBody = (ly: number, lh: number) => ly >= top && ly + lh <= bottom;

            slot.time.setText(inRange ? (this.showsUnplaced ? Clock.offset(minute) : Clock.format(minute)) : '')
                .setColor(span ? Theme.text : Theme.textDim).setAlpha(span ? 1 : 0.5)
                .setY(y + 2).setVisible(inBody(y + 2, ViewerPanel.lineH));
            const tagText = span && minute === span.start ? 'LOG ' + span.log.id : '';
            const status = span ? this.gs.statusText(span.log.id) : '';
            slot.tag.setText(tagText).setColor(Theme.statusColor(status))
                .setY(y + ViewerPanel.lineH + 4).setVisible(inBody(y + ViewerPanel.lineH + 4, 16));
            slot.lines.forEach((text, l) => {
                const line = lines[l];
                const ly = y + 2 + l * ViewerPanel.lineH;
                text.setText(line ? line.text : '').setColor(line && line.sound ? Theme.textSound : Theme.text)
                    .setY(ly).setVisible(!!line && inBody(ly, ViewerPanel.lineH));
            });

            if (!inRange || y + mh < top || y > bottom) {
                return;
            }
            const y1 = Math.max(y, top);
            const y2 = Math.min(y + mh, bottom);
            if (minute === current) {
                g.fillStyle(Theme.highlight, 0.55);
                g.fillRect(4, y1, this.w - 8, y2 - y1);
            }
            if (span) {
                // A bar in the gutter shows which minutes belong to a log, coloured by its status.
                g.fillStyle(this.statusColorNumber(status), 0.8);
                g.fillRect(6, y1, 4, y2 - y1);
                if (minute === span.start && y >= top) {
                    g.lineStyle(1, this.statusColorNumber(status), 0.6);
                    g.lineBetween(6, y, this.w - 8, y);
                }
            }
            if (y + mh <= bottom) {
                g.lineStyle(1, Theme.grid, 0.35);
                g.lineBetween(ViewerPanel.textX, y + mh, this.w - 8, y + mh);
            }
        });
    }

    statusColorNumber(status: string): number {
        switch (status) {
            case 'CORRECT': return Theme.complete;
            case 'INCORRECT': return Theme.incorrect;
            case 'VERIFYING...': return Theme.checking;
            default: return Theme.block;
        }
    }
}
