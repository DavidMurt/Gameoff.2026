import { Movement } from "./Movement";
import { BatchDef, BadgeDef, Log, ProximitySpan, Room, RoomsData } from "./Types";
import badgesJson from "./badges.json";
import batchesJson from "./batches.json";
import logsJson from "./logs.json";
import roomsJson from "./rooms.json";

// PLACEHOLDER CONTENT - not the final story.
// Sample rooms, characters, logs and proximity data for testing the GUI and the game flow.
// Everything here is edited with the log editor (open the dev server with ?editor) and saved to the JSON files.
// Shift starts at 23:00, so minute 300 = 04:00 (hour 6).

export class SampleData {

    static readonly shiftStartHour = 23;
    static readonly shiftLength = 9 * 60;

    static readonly badges: BadgeDef[] = badgesJson as BadgeDef[];

    // Each batch's hours as clock times, edited in the log editor (batches.json).
    static readonly batches: BatchDef[] = batchesJson as BatchDef[];

    // A clock time "HH:MM" as minutes from the start of the shift.
    static toShiftMinutes(clock: string): number {
        const [h, m] = clock.split(':').map((n) => parseInt(n, 10));
        return ((h * 60 + m) - SampleData.shiftStartHour * 60 + 24 * 60) % (24 * 60);
    }

    // A batch's hours in shift minutes.
    static batchRange(def: BatchDef): { start: number; end: number } {
        const start = SampleData.toShiftMinutes(def.start);
        const end = SampleData.toShiftMinutes(def.end);
        return { start, end: end <= start ? end + 24 * 60 : end };
    }

    // Room IDs deliberately say nothing about the room. The note is the truth (writers only, never shown).
    static readonly rooms: Room[] = (roomsJson as RoomsData).rooms;

    static readonly corridors: [string, string][] = (roomsJson as RoomsData).corridors;

    // Logs are edited with the log editor (open the dev server with ?editor) and saved to logs.json.
    static readonly logs: Log[] = logsJson as Log[];

    // Where each badge was, according to the proximity sensors: every character's visible stays.
    static readonly proximity: ProximitySpan[] = Movement.proximity(SampleData.badges, SampleData.shiftLength, SampleData.toShiftMinutes);
}
