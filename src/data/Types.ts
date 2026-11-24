// Data shapes for logs, rooms and player progress (see docs/IDEAS.md).
// All times are minutes from the start of the shift (minute 0 = 23:00).

export type SensorState = 'none' | 'online' | 'corrupted' | 'broken';

export interface TextStyle {
    start: number;      // character offset in the entry text
    end: number;        // exclusive character offset
    bold?: boolean;
    italic?: boolean;
    color?: string;
}

export interface LogEntry {
    offset: number;     // minutes after the log's timestamp
    badgeId?: string;   // missing for sound events
    text: string;       // speech, or a sound such as "[LOUD CRASH]"
    formatting?: TextStyle[]; // authored emphasis (not rendered yet)
}

export interface Log {
    id: string;
    note?: string;          // writer-only note, never shown to the player
    batch: number;          // which batch it arrives in
    room: string;           // the correct room ID (hidden from the player)
    timestamp: number;      // the correct start time; always a multiple of 15 (hidden from the player)
    duration: number;       // length in minutes; always a multiple of 15
    entries: LogEntry[];
}

// What the player has done with each log, saved separately from the story data.
export interface LogState {
    logId: string;
    room?: string;          // the room column the log is in; undefined = unplaced
    time?: number;          // where the log's top edge is, in minutes; undefined = unplaced
    roomLocked: boolean;    // can only move vertically
    timeLocked: boolean;    // can only move horizontally
    verified: boolean;      // true once the current placement has been checked
    complete: boolean;      // true only when room and time are correct; permanent once true
}

export interface BatchState {
    batch: number;
    complete: boolean;      // true only when every log in the batch is complete
    hash?: string;          // generated on submission; an accepted hash unlocks the next batch
}

export interface BatchDef {
    batch: number;
    start: string;          // clock time "HH:MM" when this batch's hours start (shift starts 23:00)
    end: string;            // clock time "HH:MM" when they end; edited in the log editor, saved in batches.json
}

export interface Room {
    id: string;
    col: number;            // grid position on the facility map
    row: number;
    audio: SensorState;
    proximity: SensorState;
    note?: string;          // writer-only room name, never shown to the player
}

// A character changes room at a clock time and stays there until their next move.
export interface Move {
    at: string;             // clock time "HH:MM" (shift starts 23:00)
    room: string;           // room ID; '' = not in the building
    invisible?: boolean;    // overrides the character's default until the next move (e.g. a lost or new badge)
}

// A character (a voice and/or a badge). Edited in the log editor's Characters tab, saved in badges.json.
export interface BadgeDef {
    id: string;
    note: string;           // writer-only name, never shown to the player
    invisible?: boolean;    // default: true = never shows on the proximity map (no badge)
    moves?: Move[];         // in time order
}

// rooms.json: the facility map. Edited in the log editor's Rooms tab.
export interface RoomsData {
    rooms: Room[];
    corridors: [string, string][];
}

// One stretch of time a character spends in one room (from their moves).
export interface Stay {
    badgeId: string;
    room: string;
    from: number;           // inclusive shift minute
    to: number;             // exclusive shift minute
    invisible: boolean;
    move: number;           // index of the move that started it
}

export interface ProximitySpan {
    badgeId: string;
    room: string;
    from: number;           // inclusive minute
    to: number;             // exclusive minute
}

export type ViewerTarget = { kind: 'room'; id: string } | { kind: 'log'; id: string } | null;
