import { BadgeDef, ProximitySpan, Stay } from "./Types";

// Turns each character's moves (badges.json) into stays: one per stretch of time spent in a room.
// Takes the shift length and clock parser as arguments so SampleData can call it while it initialises.
export class Movement {

    // Every stay of one character, in time order. Time out of the building ('' room) is left out.
    static stays(def: BadgeDef, shiftLength: number, toMinutes: (clock: string) => number): Stay[] {
        const moves = def.moves ?? [];
        const stays: Stay[] = [];
        moves.forEach((move, i) => {
            const from = toMinutes(move.at);
            const to = i + 1 < moves.length ? toMinutes(moves[i + 1].at) : shiftLength;
            if (move.room !== '' && to > from) {
                stays.push({ badgeId: def.id, room: move.room, from, to, invisible: move.invisible ?? !!def.invisible, move: i });
            }
        });
        return stays;
    }

    // What the proximity sensors see: every visible stay of every character.
    static proximity(defs: BadgeDef[], shiftLength: number, toMinutes: (clock: string) => number): ProximitySpan[] {
        return defs.flatMap((def) => Movement.stays(def, shiftLength, toMinutes))
            .filter((s) => !s.invisible)
            .map((s) => ({ badgeId: s.badgeId, room: s.room, from: s.from, to: s.to }));
    }
}
