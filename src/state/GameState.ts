import { SampleData } from "../data/SampleData";
import { BatchState, Log, LogState, Room, ViewerTarget } from "../data/Types";

interface SaveData {
    version: number;
    systemTime: number;
    currentBatch: number;
    finished: boolean;
    logStates: LogState[];
    batchStates: BatchState[];
    badgeNames: Record<string, string>;
    badgeRoles: Record<string, string>;
    roomNotes: Record<string, string>;
    viewers: ViewerTarget[];
    leftPanel: 'map' | 'rooms';
    activeRoom?: string | null;
    activeLog?: string | null;
}

export interface SubmitResult {
    accepted: boolean;
    hash: string;
    incomplete: number;
}

// The whole investigation: system time, log placements, locks, batches and player notes.
// Panels listen to its events and redraw:
//   "timeChanged", "logsChanged", "viewerChanged", "namesChanged", "batchChanged", "panelChanged", "activeChanged",
//   "gameComplete"
export class GameState extends Phaser.Events.EventEmitter {
    static readonly saveKey = 'nightshift-save';
    static readonly checkDelay = 1500;

    systemTime = 0;
    currentBatch = 1;
    finished = false;
    logStates = new Map<string, LogState>();
    batchStates: BatchState[] = [];
    badgeNames: Record<string, string> = {};
    badgeRoles: Record<string, string> = {};
    roomNotes: Record<string, string> = {};
    viewers: ViewerTarget[] = [null, null];
    leftPanel: 'map' | 'rooms' = 'map';
    checking = new Set<string>();
    // The last room the player selected, and the log the arrow keys move: the log clicked on a timeline,
    // or, once system time moves, the log in the active room at system time.
    activeRoom: string | null = null;
    activeLog: string | null = null;

    static newGame(): GameState {
        const state = new GameState();
        state.releaseBatch(1);
        state.systemTime = state.range().start;
        state.viewers = [{ kind: 'log', id: SampleData.logs[0].id }, null];
        state.save();
        return state;
    }

    static hasSave(): boolean {
        return localStorage.getItem(GameState.saveKey) !== null;
    }

    static clearSave() {
        localStorage.removeItem(GameState.saveKey);
    }

    static load(): GameState | null {
        const raw = localStorage.getItem(GameState.saveKey);
        if (!raw) {
            return null;
        }
        try {
            const data = JSON.parse(raw) as SaveData;
            const state = new GameState();
            state.systemTime = data.systemTime;
            state.currentBatch = data.currentBatch;
            state.finished = data.finished;
            data.logStates.forEach((ls) => state.logStates.set(ls.logId, ls));
            state.batchStates = data.batchStates;
            state.badgeNames = data.badgeNames;
            state.badgeRoles = data.badgeRoles;
            state.roomNotes = data.roomNotes;
            state.viewers = data.viewers;
            state.leftPanel = data.leftPanel;
            state.activeRoom = data.activeRoom ?? null;
            state.activeLog = data.activeLog ?? null;
            // A check that was running when the game was saved is run again.
            state.logStates.forEach((ls) => {
                if (ls.roomLocked && ls.timeLocked && !ls.verified && !ls.complete) {
                    state.check(ls.logId);
                }
            });
            return state;
        } catch (e) {
            console.warn('Could not load save', e);
            return null;
        }
    }

    save() {
        const data: SaveData = {
            version: 1,
            systemTime: this.systemTime,
            currentBatch: this.currentBatch,
            finished: this.finished,
            logStates: [...this.logStates.values()],
            batchStates: this.batchStates,
            badgeNames: this.badgeNames,
            badgeRoles: this.badgeRoles,
            roomNotes: this.roomNotes,
            viewers: this.viewers,
            leftPanel: this.leftPanel,
            activeRoom: this.activeRoom,
            activeLog: this.activeLog
        };
        localStorage.setItem(GameState.saveKey, JSON.stringify(data));
    }

    // ---------- Story data lookups ----------

    log(id: string): Log {
        return SampleData.logs.find((l) => l.id === id)!;
    }

    room(id: string): Room {
        return SampleData.rooms.find((r) => r.id === id)!;
    }

    audioRooms(): Room[] {
        return SampleData.rooms.filter((r) => r.audio !== 'none');
    }

    releasedLogs(): Log[] {
        return SampleData.logs.filter((l) => l.batch <= this.currentBatch);
    }

    // The part of the shift that is unlocked, in minutes.
    range(): { start: number; end: number } {
        const def = SampleData.batches.find((b) => b.batch === this.currentBatch)!;
        return { start: (def.firstHour - 1) * 60, end: def.lastHour * 60 };
    }

    // ---------- System time ----------

    setSystemTime(minutes: number) {
        const r = this.range();
        const t = Phaser.Math.Clamp(Math.round(minutes), r.start, r.end - 1);
        if (t !== this.systemTime) {
            this.systemTime = t;
            this.emit("timeChanged", t);
            if (this.activeRoom) {
                this.setActiveLog(this.logAt(this.activeRoom, t)?.id ?? null);
            }
        }
    }

    // ---------- Active room and log ----------

    // Selecting a room makes it active; its active log is whatever it holds at system time.
    setActiveRoom(roomId: string) {
        if (roomId === this.activeRoom) {
            return;
        }
        this.activeRoom = roomId;
        this.activeLog = this.logAt(roomId, this.systemTime)?.id ?? null;
        this.changed("activeChanged");
    }

    // A log clicked on a timeline becomes active, and so does its room if it is placed.
    selectLog(logId: string) {
        const room = this.logState(logId).room;
        if (room !== undefined) {
            this.activeRoom = room;
        }
        this.activeLog = null;
        this.setActiveLog(logId);
    }

    setActiveLog(logId: string | null) {
        if (logId !== this.activeLog) {
            this.activeLog = logId;
            this.changed("activeChanged");
        }
    }

    // Moves the active log up (-1) or down (+1) its room by one 15 minute step. If system time is inside the
    // log it moves with it, so the log stays active and the viewers keep showing the same line.
    nudgeActiveLog(direction: number): boolean {
        const logId = this.activeLog;
        if (!logId) {
            return false;
        }
        const ls = this.logState(logId);
        if (ls.room === undefined) {
            return false;
        }
        const step = direction * 15;
        const inside = this.systemTime >= ls.time! && this.systemTime < ls.time! + this.log(logId).duration;
        if (!this.moveLog(logId, ls.room, ls.time! + step)) {
            return false;
        }
        if (inside) {
            this.setSystemTime(this.systemTime + step);
        }
        return true;
    }

    // ---------- Log placement ----------

    logState(id: string): LogState {
        return this.logStates.get(id)!;
    }

    unplacedLogs(): Log[] {
        return this.releasedLogs().filter((l) => this.logState(l.id).room === undefined);
    }

    placedLogsInRoom(roomId: string): Log[] {
        return this.releasedLogs()
            .filter((l) => this.logState(l.id).room === roomId)
            .sort((a, b) => this.logState(a.id).time! - this.logState(b.id).time!);
    }

    logAt(roomId: string, minute: number): Log | undefined {
        return this.placedLogsInRoom(roomId).find((l) => {
            const t = this.logState(l.id).time!;
            return minute >= t && minute < t + l.duration;
        });
    }

    canPlace(logId: string, roomId: string, time: number): boolean {
        const log = this.log(logId);
        const r = this.range();
        if (this.room(roomId).audio === 'none' || time % 15 !== 0) {
            return false;
        }
        if (time < r.start || time + log.duration > r.end) {
            return false;
        }
        return !this.placedLogsInRoom(roomId).some((other) => {
            if (other.id === logId) {
                return false;
            }
            const t = this.logState(other.id).time!;
            return time < t + other.duration && t < time + log.duration;
        });
    }

    moveLog(logId: string, roomId: string, time: number): boolean {
        const ls = this.logState(logId);
        if (ls.complete || this.checking.has(logId) || !this.canPlace(logId, roomId, time)) {
            return false;
        }
        if ((ls.roomLocked && ls.room !== roomId) || (ls.timeLocked && ls.time !== time)) {
            return false;
        }
        ls.room = roomId;
        ls.time = time;
        ls.verified = false;
        // A viewer showing this log as an unplaced log now follows it into its room.
        this.viewers = this.viewers.map((v) => v && v.kind === 'log' && v.id === logId ? { kind: 'room', id: roomId } : v);
        this.changed("logsChanged");
        this.emit("viewerChanged");
        return true;
    }

    unplace(logId: string): boolean {
        const ls = this.logState(logId);
        if (ls.complete || ls.roomLocked || ls.timeLocked) {
            return false;
        }
        ls.room = undefined;
        ls.time = undefined;
        ls.verified = false;
        this.changed("logsChanged");
        return true;
    }

    setLock(logId: string, lock: 'room' | 'time', on: boolean) {
        const ls = this.logState(logId);
        if (ls.complete || ls.room === undefined || this.checking.has(logId)) {
            return;
        }
        if (lock === 'room') {
            ls.roomLocked = on;
        } else {
            ls.timeLocked = on;
        }
        ls.verified = false;
        this.changed("logsChanged");
        if (ls.roomLocked && ls.timeLocked) {
            this.check(logId);
        }
    }

    // Both locks set: the system "verifies" the log for a moment, then marks it complete or not.
    check(logId: string) {
        this.checking.add(logId);
        this.emit("logsChanged");
        window.setTimeout(() => {
            const ls = this.logState(logId);
            const log = this.log(logId);
            this.checking.delete(logId);
            ls.verified = true;
            ls.complete = ls.room === log.room && ls.time === log.timestamp;
            this.changed("logsChanged");
        }, GameState.checkDelay);
    }

    statusText(logId: string): string {
        const ls = this.logState(logId);
        if (ls.complete) {
            return 'CORRECT';
        }
        if (this.checking.has(logId)) {
            return 'VERIFYING...';
        }
        if (ls.room === undefined) {
            return 'UNPLACED';
        }
        if (ls.verified) {
            return 'INCORRECT';
        }
        if (ls.roomLocked) {
            return 'ROOM LOCKED';
        }
        if (ls.timeLocked) {
            return 'TIME LOCKED';
        }
        return 'UNLOCKED';
    }

    // ---------- Batches ----------

    batchProgress(): { done: number; total: number } {
        const logs = SampleData.logs.filter((l) => l.batch === this.currentBatch);
        return { done: logs.filter((l) => this.logState(l.id).complete).length, total: logs.length };
    }

    lastAcceptedHash(): string {
        const accepted = this.batchStates.filter((b) => b.complete);
        return accepted.length > 0 ? accepted[accepted.length - 1].hash! : '0000000000000000';
    }

    submitBatch(): SubmitResult {
        const logs = SampleData.logs.filter((l) => l.batch === this.currentBatch);
        const arrangement = logs
            .map((l) => {
                const ls = this.logState(l.id);
                return l.id + '@' + (ls.room ?? '-') + ':' + (ls.time ?? '-');
            })
            .sort()
            .join('|');
        const hash = GameState.hash(this.lastAcceptedHash() + '|' + this.currentBatch + '|' + arrangement);
        const incomplete = logs.filter((l) => !this.logState(l.id).complete).length;
        const accepted = incomplete === 0;
        this.batchStates = this.batchStates.filter((b) => b.batch !== this.currentBatch);
        this.batchStates.push({ batch: this.currentBatch, complete: accepted, hash });
        if (accepted) {
            const next = this.currentBatch + 1;
            if (SampleData.batches.some((b) => b.batch === next)) {
                this.releaseBatch(next);
            } else {
                this.finished = true;
            }
        }
        this.changed("batchChanged");
        this.emit("logsChanged");
        if (this.finished) {
            this.emit("gameComplete");
        }
        return { accepted, hash, incomplete };
    }

    releaseBatch(batch: number) {
        this.currentBatch = batch;
        SampleData.logs.filter((l) => l.batch === batch).forEach((l) => {
            this.logStates.set(l.id, {
                logId: l.id, roomLocked: false, timeLocked: false, verified: false, complete: false
            });
        });
        const r = this.range();
        this.systemTime = Phaser.Math.Clamp(this.systemTime, r.start, r.end - 1);
    }

    // FNV-1a, run twice with different seeds for a 16 hex digit hash. Fictional, not secure.
    static hash(text: string): string {
        const fnv = (seed: number) => {
            let h = seed >>> 0;
            for (let i = 0; i < text.length; i++) {
                h ^= text.charCodeAt(i);
                h = Math.imul(h, 0x01000193) >>> 0;
            }
            return h.toString(16).padStart(8, '0');
        };
        return (fnv(0x811c9dc5) + fnv(0x2f2f2f2f)).toUpperCase();
    }

    // ---------- People and rooms ----------

    knownBadgeIds(): string[] {
        const ids = new Set<string>();
        this.releasedLogs().forEach((l) => l.entries.forEach((e) => e.badgeId && ids.add(e.badgeId)));
        const r = this.range();
        SampleData.proximity.forEach((s) => {
            if (s.from < r.end && s.to > r.start) {
                ids.add(s.badgeId);
            }
        });
        return [...ids].sort();
    }

    badgesIn(roomId: string, minute: number): string[] {
        return SampleData.proximity
            .filter((s) => s.room === roomId && minute >= s.from && minute < s.to)
            .map((s) => s.badgeId)
            .sort();
    }

    badgeLabel(id: string): string {
        const name = this.badgeNames[id];
        return name ? 'ID#' + id + ' - ' + name : 'ID#' + id;
    }

    roomLabel(id: string): string {
        const note = this.roomNotes[id];
        return note ? id + ' ' + note : id;
    }

    setBadgeName(id: string, name: string) {
        this.badgeNames[id] = name.trim();
        this.changed("namesChanged");
    }

    setBadgeRole(id: string, role: string) {
        this.badgeRoles[id] = role.trim();
        this.changed("namesChanged");
    }

    setRoomNote(id: string, note: string) {
        this.roomNotes[id] = note.trim();
        this.changed("namesChanged");
    }

    // ---------- Viewers and panels ----------

    setViewer(index: number, target: ViewerTarget) {
        this.viewers[index] = target;
        this.changed("viewerChanged");
        if (target && target.kind === 'room') {
            this.setActiveRoom(target.id);
        }
    }

    // The room a viewer is showing, if any (an unplaced log has no room).
    viewerRoom(index: number): string | null {
        const v = this.viewers[index];
        if (!v) {
            return null;
        }
        if (v.kind === 'room') {
            return v.id;
        }
        return this.logState(v.id).room ?? null;
    }

    // The log a viewer has selected: the log at system time in its room, or the unplaced log it shows.
    selectedLog(index: number): Log | undefined {
        const v = this.viewers[index];
        if (!v) {
            return undefined;
        }
        if (v.kind === 'log') {
            return this.log(v.id);
        }
        return this.logAt(v.id, this.systemTime);
    }

    setLeftPanel(panel: 'map' | 'rooms') {
        this.leftPanel = panel;
        this.changed("panelChanged");
    }

    // Emit and autosave.
    changed(event: string) {
        this.save();
        this.emit(event);
    }
}
