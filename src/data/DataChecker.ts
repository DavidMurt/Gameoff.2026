import { Log } from "./Types";

export interface LogOverlap {
    room: string;
    first: Log;
    second: Log;
}

// Sanity checks for the story data. Run in development to catch authoring mistakes.
export class DataChecker {

    // Every pair of logs whose correct placements overlap in time in the same room.
    static overlaps(logs: Log[]): LogOverlap[] {
        const byRoom = new Map<string, Log[]>();
        logs.forEach((log) => {
            const list = byRoom.get(log.room) ?? [];
            list.push(log);
            byRoom.set(log.room, list);
        });

        const found: LogOverlap[] = [];
        byRoom.forEach((list, room) => {
            const sorted = [...list].sort((a, b) => a.timestamp - b.timestamp);
            for (let i = 0; i < sorted.length; i++) {
                const first = sorted[i];
                const end = first.timestamp + first.duration;
                // Sorted by start, so stop at the first log that starts after this one ends.
                for (let j = i + 1; j < sorted.length && sorted[j].timestamp < end; j++) {
                    found.push({ room, first, second: sorted[j] });
                }
            }
        });
        return found;
    }

    // Logs every overlap to the console. Returns true when there are none.
    static checkOverlaps(logs: Log[]): boolean {
        const found = DataChecker.overlaps(logs);
        found.forEach((o) => {
            console.warn('Log overlap in room ' + o.room + ': log ' + o.first.id
                + ' (' + o.first.timestamp + '-' + (o.first.timestamp + o.first.duration) + ') and log ' + o.second.id
                + ' (' + o.second.timestamp + '-' + (o.second.timestamp + o.second.duration) + ')');
        });
        return found.length === 0;
    }
}
