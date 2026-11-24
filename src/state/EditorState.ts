import { DataChecker } from "../data/DataChecker";
import { LineWrap } from "../data/LineWrap";
import { Movement } from "../data/Movement";
import { SampleData } from "../data/SampleData";
import { BadgeDef, BatchDef, Log, Move, Room, SensorState, Stay } from "../data/Types";
import { Clock } from "./Clock";

export type EditorTab = 'logs' | 'rooms' | 'characters';

interface Snapshot {
    data: string;
    selectedIds: (string | null)[];
    selectedRoom: string | null;
    selectedBadge: string | null;
}

// The log editor's working copy of the story data (dev only): logs, batch hours, rooms and corridors, and characters
// with their moves. Saves to logs.json, batches.json, rooms.json and badges.json in src/data through the Vite dev server.
// Panels listen to its events and redraw:
//   "dataChanged" (source: 'entries0' / 'entries1' when that editor's entries table made the change),
//   "selectionChanged", "dirtyChanged", "tabChanged", "message" (text: why an action was refused)
// Two logs can be open at once: slot 0 (editor 1) is the one that gets edited; slot 1 (editor 2) is a read-only
// reference. Log actions apply to slot 0.
// The Rooms and Characters tabs each have one selected room / character (and move).
export class EditorState extends Phaser.Events.EventEmitter {
    static readonly saveUrl = '/__editor/save';
    static readonly undoDepth = 50;
    static readonly sensorStates: SensorState[] = ['none', 'online', 'corrupted', 'broken'];
    static readonly tabs: EditorTab[] = ['logs', 'rooms', 'characters'];

    static readonly slots = 2;

    logs: Log[];
    batches: BatchDef[];
    rooms: Room[];
    corridors: [string, string][];
    badges: BadgeDef[];
    tab: EditorTab = 'logs';
    selectedIds: (string | null)[] = [null, null];
    selectedRoom: string | null = null;
    selectedBadge: string | null = null;
    selectedMove: number | null = null;
    batchFilter: number | null = null;
    dirty = false;
    undoStack: Snapshot[] = [];

    constructor() {
        super();
        this.logs = JSON.parse(JSON.stringify(SampleData.logs));
        this.batches = JSON.parse(JSON.stringify(SampleData.batches));
        this.rooms = JSON.parse(JSON.stringify(SampleData.rooms));
        this.corridors = JSON.parse(JSON.stringify(SampleData.corridors));
        this.badges = JSON.parse(JSON.stringify(SampleData.badges));
        this.badges.forEach((b) => b.moves = b.moves ?? []);
        const params = new URLSearchParams(location.search);
        this.tab = EditorState.tabs.find((t) => t === params.get('tab')) ?? 'logs';
        const wanted = [params.get('log'), params.get('log2')];
        this.selectedIds = wanted.map((id, i) => this.logs.some((l) => l.id === id) ? id : (this.logs[i]?.id ?? null));
        const room = params.get('room');
        this.selectedRoom = this.rooms.some((r) => r.id === room) ? room : (this.rooms[0]?.id ?? null);
        const badge = params.get('char');
        this.selectedBadge = this.badges.some((b) => b.id === badge) ? badge : (this.badges[0]?.id ?? null);
        window.addEventListener('beforeunload', (event) => {
            if (this.dirty) {
                event.preventDefault();
            }
        });
    }

    // ---------- Lookups ----------

    room(id: string): Room | undefined {
        return this.rooms.find((r) => r.id === id);
    }

    // Rooms that can record a log, in map order.
    audioRooms(): Room[] {
        return this.rooms.filter((r) => r.audio !== 'none');
    }

    roomLabel(id: string): string {
        if (id === '') {
            return '(outside)';
        }
        const room = this.room(id);
        return room?.note ? id + ' ' + room.note : id;
    }

    badge(id: string | null): BadgeDef | undefined {
        return this.badges.find((b) => b.id === id);
    }

    // The writer name used in entry scripts; the ID when the name has spaces (or there is none).
    badgeName(id: string): string {
        const note = this.badge(id)?.note;
        return note && !/\s/.test(note) ? note : id;
    }

    badgeId(name: string): string | undefined {
        const lower = name.toLowerCase();
        return this.badges.find((b) => b.id === name || b.note.toLowerCase() === lower)?.id;
    }

    // A move's clock time in shift minutes.
    minutes(clock: string): number {
        return SampleData.toShiftMinutes(clock);
    }

    // Where a character is over the shift (including invisible stretches).
    stays(def: BadgeDef): Stay[] {
        return Movement.stays(def, SampleData.shiftLength, SampleData.toShiftMinutes);
    }

    connected(a: string, b: string): boolean {
        return this.corridors.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
    }

    roomUses(id: string): { logs: number; moves: number } {
        return {
            logs: this.logs.filter((l) => l.room === id).length,
            moves: this.badges.reduce((n, b) => n + (b.moves ?? []).filter((m) => m.room === id).length, 0)
        };
    }

    badgeUses(id: string): number {
        return this.logs.reduce((n, l) => n + l.entries.filter((e) => e.badgeId === id).length, 0);
    }

    // A batch's hours in shift minutes, from the working copy.
    batchRange(batch: number): { start: number; end: number } | null {
        const def = this.batches.find((b) => b.batch === batch);
        return def ? SampleData.batchRange(def) : null;
    }

    // Every batch number: the defined ones plus any a log uses.
    batchNumbers(): number[] {
        return [...new Set([...this.batches.map((b) => b.batch), ...this.logs.map((l) => l.batch)])].sort((a, b) => a - b);
    }

    // The log being edited (editor 1).
    get selectedId(): string | null {
        return this.selectedIds[0];
    }

    set selectedId(id: string | null) {
        this.selectedIds[0] = id;
    }

    selected(slot = 0): Log | undefined {
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
        const room = this.room(log.room);
        if (!room) {
            p.push('Unknown room ' + log.room);
        } else if (room.audio === 'none') {
            p.push('Room ' + this.roomLabel(log.room) + ' has no audio sensor');
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
        const range = this.batchRange(log.batch);
        if (!range) {
            p.push('Batch ' + log.batch + ' has no hours set (batches.json)');
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
            if (e.badgeId && !this.badge(e.badgeId)) {
                p.push('Entry ' + (i + 1) + ' has unknown badge ' + e.badgeId);
            }
            if (!e.blank && e.text.trim() === '') {
                p.push('Entry ' + (i + 1) + ' at ' + Clock.offset(e.offset) + ' has no text');
            }
        });
        LineWrap.overfullMinutes(log.entries).forEach((m) => {
            p.push('Minute ' + Clock.offset(m.offset) + ' needs ' + m.lines + ' lines (max ' + LineWrap.linesPerMinute + ')');
        });
        if (log.entries.length === 0) {
            p.push('No entries');
        }
        return p;
    }

    roomProblems(room: Room): string[] {
        const p: string[] = [];
        if (room.id.trim() === '') {
            p.push('ID is empty');
        } else if (this.rooms.filter((r) => r.id === room.id).length > 1) {
            p.push('Another room has ID ' + room.id);
        }
        const sharing = this.rooms.filter((r) => r !== room && r.col === room.col && r.row === room.row);
        if (sharing.length > 0) {
            p.push('Same map square as ' + sharing.map((r) => this.roomLabel(r.id)).join(', '));
        }
        if (this.rooms.length > 1 && !this.corridors.some((c) => c.includes(room.id))) {
            p.push('No corridors: nobody can walk in or out');
        }
        return p;
    }

    badgeProblems(def: BadgeDef): string[] {
        const p: string[] = [];
        if (def.id.trim() === '') {
            p.push('ID is empty');
        } else if (this.badges.filter((b) => b.id === def.id).length > 1) {
            p.push('Another character has ID ' + def.id);
        }
        if (def.note.trim() === '') {
            p.push('Name is empty');
        }
        const moves = def.moves ?? [];
        moves.forEach((m, i) => {
            if (m.room !== '' && !this.room(m.room)) {
                p.push(m.at + ': unknown room ' + m.room);
            }
            if (i === 0) {
                return;
            }
            const prev = moves[i - 1];
            if (this.minutes(m.at) <= this.minutes(prev.at)) {
                p.push(m.at + ': not after the move before it');
            }
            if (prev.room !== '' && m.room !== '' && prev.room !== m.room && !this.connected(prev.room, m.room)) {
                p.push(m.at + ': no corridor from ' + this.roomLabel(prev.room) + ' to ' + this.roomLabel(m.room));
            }
        });
        return p;
    }

    problemCount(): number {
        return this.logs.filter((l) => this.problems(l).length > 0).length;
    }

    roomProblemCount(): number {
        return this.rooms.filter((r) => this.roomProblems(r).length > 0).length;
    }

    badgeProblemCount(): number {
        return this.badges.filter((b) => this.badgeProblems(b).length > 0).length;
    }

    // ---------- Selection ----------

    // Opens a log in editor 1 (slot 0, to edit) or editor 2 (slot 1, read-only).
    select(id: string | null, slot = 0) {
        if (id !== this.selectedIds[slot]) {
            this.selectedIds[slot] = id;
            this.emit("selectionChanged");
        }
    }

    selectRoom(id: string | null) {
        if (id !== this.selectedRoom) {
            this.selectedRoom = id;
            this.emit("selectionChanged");
        }
    }

    selectBadge(id: string | null, move: number | null = null) {
        if (id !== this.selectedBadge || move !== this.selectedMove) {
            this.selectedBadge = id;
            this.selectedMove = move;
            this.emit("selectionChanged");
        }
    }

    setTab(tab: EditorTab) {
        if (tab !== this.tab) {
            this.tab = tab;
            this.emit("tabChanged");
        }
    }

    setBatchFilter(batch: number | null) {
        this.batchFilter = batch;
        this.emit("dataChanged");
    }

    // ---------- Editing ----------

    // Saves an undo point. Called once before each user action (or at the start of a drag or typing).
    checkpoint() {
        this.undoStack.push({
            data: JSON.stringify({ logs: this.logs, batches: this.batches, rooms: this.rooms, corridors: this.corridors, badges: this.badges }),
            selectedIds: [...this.selectedIds],
            selectedRoom: this.selectedRoom,
            selectedBadge: this.selectedBadge
        });
        if (this.undoStack.length > EditorState.undoDepth) {
            this.undoStack.shift();
        }
    }

    undo() {
        const snap = this.undoStack.pop();
        if (!snap) {
            return;
        }
        const data = JSON.parse(snap.data);
        this.logs = data.logs;
        this.batches = data.batches;
        this.rooms = data.rooms;
        this.corridors = data.corridors;
        this.badges = data.badges;
        this.selectedIds = snap.selectedIds;
        this.selectedRoom = snap.selectedRoom;
        this.selectedBadge = snap.selectedBadge;
        this.selectedMove = null;
        this.changed();
        this.emit("selectionChanged");
    }

    // Applies a change to the selected log. Pass undo = false when a checkpoint was already made.
    edit(fn: (log: Log) => void, undo = true, source = '', slot = 0) {
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

    // Any other change: an undo point, the change, then a redraw.
    change(fn: () => void) {
        this.checkpoint();
        fn();
        this.changed();
    }

    refuse(message: string) {
        this.emit("message", message);
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
        const max = Math.max(...this.batches.map((b) => b.batch));
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

    // Moves a batch's start or end by whole hours, keeping at least an hour between them and within the shift.
    setBatchTime(batch: number, which: 'start' | 'end', hours: number) {
        const def = this.batches.find((b) => b.batch === batch);
        if (!def) {
            return;
        }
        const r = SampleData.batchRange(def);
        const start = which === 'start' ? Phaser.Math.Clamp(r.start + hours * 60, 0, r.end - 60) : r.start;
        const end = which === 'end' ? Phaser.Math.Clamp(r.end + hours * 60, r.start + 60, SampleData.shiftLength) : r.end;
        if (start === r.start && end === r.end) {
            return;
        }
        this.change(() => {
            def.start = Clock.format(start);
            def.end = Clock.format(end);
        });
    }

    moveRoomBy(step: number) {
        const log = this.selected();
        if (!log) {
            return;
        }
        const rooms = this.audioRooms();
        const i = rooms.findIndex((r) => r.id === log.room);
        this.setRoom(rooms[Phaser.Math.Clamp(i + step, 0, rooms.length - 1)].id);
    }

    newLog(room?: string, time?: number) {
        const current = this.selected();
        const batch = this.batchFilter ?? current?.batch ?? 1;
        const roomId = room ?? current?.room ?? this.audioRooms()[0].id;
        const range = this.batchRange(batch) ?? { start: 0, end: SampleData.shiftLength };
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

    // A random 4 digit ID that no room or character has yet.
    freeId(): string {
        const taken = new Set([...this.rooms.map((r) => r.id), ...this.badges.map((b) => b.id)]);
        let id: string;
        do {
            id = String(Phaser.Math.Between(1000, 9999));
        } while (taken.has(id));
        return id;
    }

    // ---------- Rooms ----------

    get currentRoom(): Room | undefined {
        return this.selectedRoom === null ? undefined : this.room(this.selectedRoom);
    }

    // A new room on the given map square, or the first free one.
    newRoom(col?: number, row?: number) {
        let cell = col !== undefined && row !== undefined ? { col, row } : null;
        for (let r = 0; !cell; r++) {
            for (let c = 0; c < 8 && !cell; c++) {
                if (!this.rooms.some((room) => room.col === c && room.row === r)) {
                    cell = { col: c, row: r };
                }
            }
        }
        const id = this.freeId();
        this.change(() => this.rooms.push({ id, col: cell!.col, row: cell!.row, audio: 'online', proximity: 'online', note: 'New room' }));
        this.selectRoom(id);
    }

    removeRoom() {
        const room = this.currentRoom;
        if (!room) {
            return;
        }
        const uses = this.roomUses(room.id);
        if (uses.logs + uses.moves > 0) {
            this.refuse('Room ' + room.id + ' is still used by ' + uses.logs + ' logs and ' + uses.moves + ' moves');
            return;
        }
        const i = this.rooms.indexOf(room);
        this.change(() => {
            this.rooms.splice(i, 1);
            this.corridors = this.corridors.filter((c) => !c.includes(room.id));
        });
        this.selectRoom(this.rooms[Math.min(i, this.rooms.length - 1)]?.id ?? null);
    }

    // Renames a room everywhere it is used: logs, moves and corridors.
    setRoomId(id: string) {
        const room = this.currentRoom;
        const clean = id.trim();
        if (!room || clean === '' || clean === room.id) {
            return;
        }
        if (this.room(clean)) {
            this.refuse('There is already a room ' + clean);
            return;
        }
        const old = room.id;
        this.change(() => {
            room.id = clean;
            this.logs.forEach((l) => l.room === old && (l.room = clean));
            this.badges.forEach((b) => (b.moves ?? []).forEach((m) => m.room === old && (m.room = clean)));
            this.corridors = this.corridors.map((c) => c.map((r) => r === old ? clean : r) as [string, string]);
        });
        this.selectedRoom = clean;
        this.emit("selectionChanged");
    }

    setRoomNote(note: string) {
        const room = this.currentRoom;
        if (room) {
            this.change(() => {
                if (note.trim()) {
                    room.note = note.trim();
                } else {
                    delete room.note;
                }
            });
        }
    }

    // Moves the selected room to a map square, swapping with any room already there.
    setRoomCell(col: number, row: number, undo = true) {
        const room = this.currentRoom;
        col = Math.max(0, col);
        row = Math.max(0, row);
        if (!room || (room.col === col && room.row === row)) {
            return;
        }
        if (undo) {
            this.checkpoint();
        }
        const other = this.rooms.find((r) => r !== room && r.col === col && r.row === row);
        if (other) {
            other.col = room.col;
            other.row = room.row;
        }
        room.col = col;
        room.row = row;
        this.changed();
    }

    cycleSensor(kind: 'audio' | 'proximity') {
        const room = this.currentRoom;
        if (room) {
            const states = EditorState.sensorStates;
            this.change(() => room[kind] = states[(states.indexOf(room[kind]) + 1) % states.length]);
        }
    }

    toggleCorridor(a: string, b: string) {
        if (a === b) {
            return;
        }
        this.change(() => {
            if (this.connected(a, b)) {
                this.corridors = this.corridors.filter(([x, y]) => !((x === a && y === b) || (x === b && y === a)));
            } else {
                this.corridors.push([a, b]);
            }
        });
    }

    // ---------- Characters ----------

    get currentBadge(): BadgeDef | undefined {
        return this.badge(this.selectedBadge);
    }

    newBadge() {
        const id = this.freeId();
        this.change(() => this.badges.push({ id, note: 'New', invisible: false, moves: [] }));
        this.selectBadge(id);
    }

    removeBadge() {
        const def = this.currentBadge;
        if (!def) {
            return;
        }
        const uses = this.badgeUses(def.id);
        if (uses > 0) {
            this.refuse(def.note + ' (' + def.id + ') still speaks in ' + uses + ' log entries');
            return;
        }
        const i = this.badges.indexOf(def);
        this.change(() => this.badges.splice(i, 1));
        this.selectBadge(this.badges[Math.min(i, this.badges.length - 1)]?.id ?? null);
    }

    // Changes a character's ID everywhere it is used (log entries).
    setBadgeId(id: string) {
        const def = this.currentBadge;
        const clean = id.trim();
        if (!def || clean === '' || clean === def.id) {
            return;
        }
        if (this.badge(clean)) {
            this.refuse('There is already a character ' + clean);
            return;
        }
        const old = def.id;
        this.change(() => {
            def.id = clean;
            this.logs.forEach((l) => l.entries.forEach((e) => e.badgeId === old && (e.badgeId = clean)));
        });
        this.selectedBadge = clean;
        this.emit("selectionChanged");
    }

    setBadgeNote(note: string) {
        const def = this.currentBadge;
        if (def && note.trim()) {
            this.change(() => def.note = note.trim());
        }
    }

    setBadgeInvisible(invisible: boolean) {
        const def = this.currentBadge;
        if (def) {
            this.change(() => def.invisible = invisible);
        }
    }

    // Adds a move to the selected character at a shift minute (default: 15 minutes after their last move)
    // into a room (default: wherever they are at that time). Selects the new move.
    addMove(minute?: number, room?: string) {
        const def = this.currentBadge;
        if (!def) {
            return;
        }
        const moves = def.moves!;
        const last = moves.length ? this.minutes(moves[moves.length - 1].at) : -15;
        const t = Phaser.Math.Clamp(Math.round(minute ?? last + 15), 0, SampleData.shiftLength - 1);
        const existing = moves.findIndex((m) => this.minutes(m.at) === t);
        if (existing >= 0) {
            this.selectBadge(def.id, existing);
            return;
        }
        const here = this.stays(def).find((s) => t >= s.from && t < s.to)?.room;
        const move: Move = { at: Clock.format(t), room: room ?? here ?? this.rooms[0]?.id ?? '' };
        let i = moves.findIndex((m) => this.minutes(m.at) > t);
        i = i < 0 ? moves.length : i;
        this.change(() => moves.splice(i, 0, move));
        this.selectBadge(def.id, i);
    }

    // Moves a move in time, keeping it between its neighbours.
    setMoveTime(index: number, minute: number, undo = true) {
        const moves = this.currentBadge?.moves;
        if (!moves || !moves[index]) {
            return;
        }
        const min = index > 0 ? this.minutes(moves[index - 1].at) + 1 : 0;
        const max = index + 1 < moves.length ? this.minutes(moves[index + 1].at) - 1 : SampleData.shiftLength - 1;
        const at = Clock.format(Phaser.Math.Clamp(Math.round(minute), min, max));
        if (at === moves[index].at) {
            return;
        }
        if (undo) {
            this.checkpoint();
        }
        moves[index].at = at;
        this.changed();
    }

    setMoveRoom(index: number, room: string) {
        const move = this.currentBadge?.moves?.[index];
        if (move && move.room !== room) {
            this.change(() => move.room = room);
        }
    }

    // Flips whether this stretch is seen by the proximity sensors. Matching the character's default clears the override.
    toggleMoveInvisible(index: number) {
        const def = this.currentBadge;
        const move = def?.moves?.[index];
        if (!def || !move) {
            return;
        }
        const invisible = !(move.invisible ?? !!def.invisible);
        this.change(() => {
            if (invisible === !!def.invisible) {
                delete move.invisible;
            } else {
                move.invisible = invisible;
            }
        });
    }

    removeMove(index: number) {
        const def = this.currentBadge;
        if (!def?.moves?.[index]) {
            return;
        }
        this.change(() => def.moves!.splice(index, 1));
        this.selectBadge(def.id, null);
    }

    changed(source = '') {
        if (!this.dirty) {
            this.dirty = true;
            this.emit("dirtyChanged");
        }
        this.emit("dataChanged", source);
    }

    // ---------- Saving ----------

    // Writes logs.json, batches.json, rooms.json and badges.json. Vite reloads the page afterwards; the URL keeps
    // the open logs, room and character. Returns an error message, or null on success.
    async save(): Promise<string | null> {
        const url = new URL(location.href);
        ['log', 'log2'].forEach((key, i) => {
            const id = this.selectedIds[i];
            if (id) {
                url.searchParams.set(key, id);
            }
        });
        url.searchParams.set('tab', this.tab);
        if (this.selectedRoom) {
            url.searchParams.set('room', this.selectedRoom);
        }
        if (this.selectedBadge) {
            url.searchParams.set('char', this.selectedBadge);
        }
        history.replaceState(null, '', url);
        // Cleared before the request so the reload that follows the write doesn't trigger the unsaved warning.
        this.dirty = false;
        this.emit("dirtyChanged");
        try {
            const res = await fetch(EditorState.saveUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    logs: this.logs,
                    batches: this.batches,
                    rooms: { rooms: this.rooms, corridors: this.corridors },
                    badges: this.badges
                })
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
}
