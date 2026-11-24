import { DataChecker } from "../data/DataChecker";
import { SampleData } from "../data/SampleData";
import { Log, LogEntry, Room } from "../data/Types";
import { Clock } from "./Clock";

interface Snapshot {
    logs: string;
    selectedIds: (string | null)[];
}

// The log editor's working copy of the story logs (dev only). Saves to src/data/logs.json through
// the Vite dev server. Panels listen to its events and redraw:
//   "logsChanged" (source: 'script0' / 'script1' when that editor's entries textarea made the change),
//   "selectionChanged", "dirtyChanged"
// Two logs can be open at once, one per editor slot (0 and 1). Most actions apply to the active slot.
export class EditorState extends Phaser.Events.EventEmitter {
    static readonly saveUrl = '/__editor/save';
    static readonly undoDepth = 50;

    static readonly slots = 2;

    logs: Log[];
    selectedIds: (string | null)[] = [null, null];
    active = 0;
    batchFilter: number | null = null;
    dirty = false;
    undoStack: Snapshot[] = [];

    constructor() {
        super();
        this.logs = JSON.parse(JSON.stringify(SampleData.logs));
        const params = new URLSearchParams(location.search);
        const wanted = [params.get('log'), params.get('log2')];
        this.selectedIds = wanted.map((id, i) => this.logs.some((l) => l.id === id) ? id : (this.logs[i]?.id ?? null));
        window.addEventListener('beforeunload', (event) => {
            if (this.dirty) {
                event.preventDefault();
            }
        });
    }

    // ---------- Lookups ----------

    static audioRooms(): Room[] {
        return SampleData.rooms.filter((r) => r.audio !== 'none');
    }

    static roomLabel(id: string): string {
        const room = SampleData.rooms.find((r) => r.id === id);
        return room?.note ? id + ' ' + room.note : id;
    }

    static badgeName(id: string): string {
        const note = SampleData.badges.find((b) => b.id === id)?.note;
        return note && !/\s/.test(note) ? note : id;
    }

    static badgeId(name: string): string | undefined {
        const lower = name.toLowerCase();
        return SampleData.badges.find((b) => b.id === name || b.note.toLowerCase() === lower)?.id;
    }

    // The unlocked part of the shift for a batch, in minutes (same as GameState.range()).
    static batchRange(batch: number): { start: number; end: number } | null {
        const def = SampleData.batches.find((b) => b.batch === batch);
        return def ? { start: (def.firstHour - 1) * 60, end: def.lastHour * 60 } : null;
    }

    // The log open in the active slot.
    get selectedId(): string | null {
        return this.selectedIds[this.active];
    }

    set selectedId(id: string | null) {
        this.selectedIds[this.active] = id;
    }

    selected(slot = this.active): Log | undefined {
        return this.logs.find((l) => l.id === this.selectedIds[slot]);
    }

    visibleLogs(): Log[] {
        return this.logs.filter((l) => this.batchFilter === null || l.batch === this.batchFilter);
    }

    // ---------- Validation ----------

    overlapsWith(log: Log): Log[] {
        return DataChecker.overlaps(this.logs)
            .filter((o) => o.first === log || o.second === log)
            .map((o) => o.first === log ? o.second : o.first);
    }

    problems(log: Log): string[] {
        const p: string[] = [];
        const end = log.timestamp + log.duration;
        const room = SampleData.rooms.find((r) => r.id === log.room);
        if (!room) {
            p.push('Unknown room ' + log.room);
        } else if (room.audio === 'none') {
            p.push('Room ' + EditorState.roomLabel(log.room) + ' has no audio sensor');
        }
        if (log.timestamp % 15 !== 0) {
            p.push('Start time is not on a 15 minute mark');
        }
        if (log.duration <= 0 || log.duration % 15 !== 0) {
            p.push('Duration must be a positive multiple of 15');
        }
        if (log.timestamp < 0 || end > SampleData.shiftLength) {
            p.push('Runs outside the shift');
        }
        const range = EditorState.batchRange(log.batch);
        if (!range) {
            p.push('Batch ' + log.batch + ' is not defined in SampleData.batches');
        } else if (log.timestamp < range.start || end > range.end) {
            p.push('Outside batch ' + log.batch + ' hours (' + Clock.format(range.start) + '-' + Clock.format(range.end) + ')');
        }
        if (log.id.trim() === '') {
            p.push('ID is empty');
        } else if (this.logs.filter((l) => l.id === log.id).length > 1) {
            p.push('Another log has ID #' + log.id);
        }
        this.overlapsWith(log).forEach((o) => {
            p.push('Overlaps log #' + o.id + ' (' + Clock.format(o.timestamp) + '-' + Clock.format(o.timestamp + o.duration) + ')');
        });
        log.entries.forEach((e, i) => {
            if (e.offset >= log.duration) {
                p.push('Entry ' + (i + 1) + ' at ' + Clock.offset(e.offset) + ' is past the end of the log');
            }
            if (i > 0 && e.offset < log.entries[i - 1].offset) {
                p.push('Entry ' + (i + 1) + ' is out of order');
            }
            if (e.badgeId && !SampleData.badges.some((b) => b.id === e.badgeId)) {
                p.push('Entry ' + (i + 1) + ' has unknown badge ' + e.badgeId);
            }
        });
        if (log.entries.length === 0) {
            p.push('No entries');
        }
        return p;
    }

    problemCount(): number {
        return this.logs.filter((l) => this.problems(l).length > 0).length;
    }

    // ---------- Selection ----------

    // Opens a log in a slot (the active one by default) and makes that slot active.
    select(id: string | null, slot = this.active) {
        if (id !== this.selectedIds[slot] || slot !== this.active) {
            this.selectedIds[slot] = id;
            this.active = slot;
            this.emit("selectionChanged");
        }
    }

    setActive(slot: number) {
        if (slot !== this.active) {
            this.active = slot;
            this.emit("selectionChanged");
        }
    }

    setBatchFilter(batch: number | null) {
        this.batchFilter = batch;
        this.emit("logsChanged");
    }

    // ---------- Editing ----------

    // Saves an undo point. Called once before each user action (or at the start of a drag or typing).
    checkpoint() {
        this.undoStack.push({ logs: JSON.stringify(this.logs), selectedIds: [...this.selectedIds] });
        if (this.undoStack.length > EditorState.undoDepth) {
            this.undoStack.shift();
        }
    }

    undo() {
        const snap = this.undoStack.pop();
        if (!snap) {
            return;
        }
        this.logs = JSON.parse(snap.logs);
        this.selectedIds = snap.selectedIds;
        this.changed();
        this.emit("selectionChanged");
    }

    // Applies a change to the selected log. Pass undo = false when a checkpoint was already made.
    edit(fn: (log: Log) => void, undo = true, source = '', slot = this.active) {
        const log = this.selected(slot);
        if (!log) {
            return;
        }
        if (undo) {
            this.checkpoint();
        }
        fn(log);
        this.changed(source);
    }

    setId(id: string) {
        const clean = id.trim();
        if (clean === '' || clean === this.selectedId) {
            return;
        }
        const old = this.selectedId;
        this.edit((log) => {
            log.id = clean;
            this.selectedIds = this.selectedIds.map((id) => id === old ? clean : id);
        });
        this.emit("selectionChanged");
    }

    setBatch(batch: number) {
        const max = Math.max(...SampleData.batches.map((b) => b.batch));
        this.edit((log) => log.batch = Phaser.Math.Clamp(batch, 1, max));
    }

    setRoom(room: string) {
        this.edit((log) => log.room = room);
    }

    setTime(time: number) {
        const t = Phaser.Math.Clamp(time, 0, SampleData.shiftLength - 15);
        this.edit((log) => log.timestamp = t);
    }

    setDuration(duration: number) {
        this.edit((log) => log.duration = Phaser.Math.Clamp(duration, 15, SampleData.shiftLength));
    }

    setNote(note: string) {
        this.edit((log) => {
            if (note.trim()) {
                log.note = note.trim();
            } else {
                delete log.note;
            }
        });
    }

    setEntries(entries: LogEntry[], slot: number) {
        this.edit((log) => log.entries = entries, false, 'script' + slot, slot);
    }

    moveRoomBy(step: number) {
        const log = this.selected();
        if (!log) {
            return;
        }
        const rooms = EditorState.audioRooms();
        const i = rooms.findIndex((r) => r.id === log.room);
        this.setRoom(rooms[Phaser.Math.Clamp(i + step, 0, rooms.length - 1)].id);
    }

    newLog(room?: string, time?: number) {
        const current = this.selected();
        const batch = this.batchFilter ?? current?.batch ?? 1;
        const roomId = room ?? current?.room ?? EditorState.audioRooms()[0].id;
        const range = EditorState.batchRange(batch) ?? { start: 0, end: SampleData.shiftLength };
        let start = time;
        if (start === undefined) {
            // First free 15 minute slot in the batch's hours, else the start of the batch.
            start = range.start;
            for (let t = range.start; t < range.end; t += 15) {
                if (!this.logs.some((l) => l.room === roomId && t < l.timestamp + l.duration && l.timestamp < t + 15)) {
                    start = t;
                    break;
                }
            }
        }
        this.checkpoint();
        const ids = this.logs.map((l) => parseInt(l.id, 10)).filter((n) => !isNaN(n));
        const id = String(ids.length > 0 ? Math.max(...ids) + 1 : 1);
        this.logs.push({ id, batch, room: roomId, timestamp: start, duration: 15, entries: [] });
        this.selectedId = id;
        this.changed();
        this.emit("selectionChanged");
    }

    duplicate() {
        const log = this.selected();
        if (!log) {
            return;
        }
        this.newLog(log.room, log.timestamp + log.duration);
        const copy = this.selected()!;
        copy.batch = log.batch;
        copy.duration = log.duration;
        copy.entries = JSON.parse(JSON.stringify(log.entries));
        if (log.note) {
            copy.note = log.note;
        }
        this.changed();
        this.emit("selectionChanged");
    }

    remove() {
        const i = this.logs.findIndex((l) => l.id === this.selectedId);
        if (i < 0) {
            return;
        }
        this.checkpoint();
        const removed = this.selectedId;
        this.logs.splice(i, 1);
        const next = this.logs[Math.min(i, this.logs.length - 1)]?.id ?? null;
        this.selectedIds = this.selectedIds.map((id) => id === removed ? next : id);
        this.changed();
        this.emit("selectionChanged");
    }

    changed(source = '') {
        if (!this.dirty) {
            this.dirty = true;
            this.emit("dirtyChanged");
        }
        this.emit("logsChanged", source);
    }

    // ---------- Saving ----------

    // Writes logs.json. Vite reloads the page afterwards; the URL keeps the open logs.
    // Returns an error message, or null on success.
    async save(): Promise<string | null> {
        const url = new URL(location.href);
        ['log', 'log2'].forEach((key, i) => {
            const id = this.selectedIds[i];
            if (id) {
                url.searchParams.set(key, id);
            }
        });
        history.replaceState(null, '', url);
        // Cleared before the request so the reload that follows the write doesn't trigger the unsaved warning.
        this.dirty = false;
        this.emit("dirtyChanged");
        try {
            const res = await fetch(EditorState.saveUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ logs: this.logs })
            });
            const result = await res.json();
            if (!result.ok) {
                throw new Error(result.error);
            }
            return null;
        } catch (e) {
            this.dirty = true;
            this.emit("dirtyChanged");
            return String(e);
        }
    }

    // ---------- Entry script ----------
    // One entry per line: "offset badge text". The badge is a writer name or ID; "-" means a sound.

    static toScript(entries: LogEntry[]): string {
        return entries.map((e) => {
            const who = e.badgeId ? EditorState.badgeName(e.badgeId) : '-';
            return String(e.offset).padEnd(4) + ' ' + who.padEnd(10) + ' ' + e.text;
        }).join('\n');
    }

    // Lines that can't be read are reported and left out. Formatting is kept for entries whose text is unchanged.
    static parseScript(script: string, old: LogEntry[]): { entries: LogEntry[]; errors: string[] } {
        const entries: LogEntry[] = [];
        const errors: string[] = [];
        script.split(/\r?\n/).forEach((line, i) => {
            if (line.trim() === '') {
                return;
            }
            const m = line.match(/^\s*\+?(\d+)\s+(\S+)\s+(.*\S)\s*$/);
            if (!m) {
                errors.push('Line ' + (i + 1) + ': expected "offset badge text"');
                return;
            }
            let badgeId: string | undefined;
            if (m[2] !== '-') {
                badgeId = EditorState.badgeId(m[2]);
                if (!badgeId) {
                    errors.push('Line ' + (i + 1) + ': unknown badge "' + m[2] + '"');
                    return;
                }
            }
            const text = m[3];
            const entry: LogEntry = badgeId ? { offset: parseInt(m[1], 10), badgeId, text } : { offset: parseInt(m[1], 10), text };
            const formatting = old.find((e) => e.text === text && e.formatting)?.formatting;
            if (formatting) {
                entry.formatting = formatting;
            }
            entries.push(entry);
        });
        return { entries, errors };
    }
}
