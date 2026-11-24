import { BatchDef, BadgeDef, Log, ProximitySpan, Room } from "./Types";
import badgesJson from "./badges.json";
import logsJson from "./logs.json";

// PLACEHOLDER CONTENT - not the final story.
// Sample rooms, badges, logs and proximity data for testing the GUI and the game flow.
// Shift starts at 23:00, so minute 300 = 04:00 (hour 6).

// Badge IDs (placeholder) - the notes in badges.json are only for writers, never shown to the player.
const badge = (note: string): string => (badgesJson as BadgeDef[]).find((b) => b.note === note)!.id;
const RAYMOND = badge('Raymond');
const DANNY = badge('Danny');
const MARGARET = badge('Margaret');
const PRIYA = badge('Priya');
const OWEN = badge('Owen');
const LILY = badge('Lily');
const LUIS = badge('Luis');
const BEV = badge('Bev');
const MARCUS = badge('Marcus');
const VOSS = badge('Voss');
const GUS = badge('Gus');
const JAMAL = badge('Jamal');

export class SampleData {

    static readonly shiftStartHour = 23;
    static readonly shiftLength = 9 * 60;

    static readonly badges: BadgeDef[] = badgesJson as BadgeDef[];

    static readonly batches: BatchDef[] = [
        { batch: 1, firstHour: 6, lastHour: 6 },
        { batch: 2, firstHour: 5, lastHour: 7 }
    ];

    // Room IDs deliberately say nothing about the room. The note is the truth (writers only, never shown).
    static readonly rooms: Room[] = [
        { id: '2817', col: 0, row: 0, audio: 'online', proximity: 'online', note: 'Entrance' },
        { id: '1102', col: 1, row: 0, audio: 'none', proximity: 'online', note: 'Hallway A' },
        { id: '5530', col: 2, row: 0, audio: 'online', proximity: 'online', note: 'Security office' },
        { id: '9023', col: 3, row: 0, audio: 'online', proximity: 'online', note: 'Kitchen' },
        { id: '1385', col: 0, row: 1, audio: 'online', proximity: 'none', note: 'Offices' },
        { id: '1103', col: 1, row: 1, audio: 'none', proximity: 'online', note: 'Hallway B' },
        { id: '8654', col: 2, row: 1, audio: 'online', proximity: 'online', note: 'Conference room' },
        { id: '6690', col: 3, row: 1, audio: 'none', proximity: 'none', note: 'Utility closet' },
        { id: '7208', col: 0, row: 2, audio: 'online', proximity: 'none', note: 'Server room' },
        { id: '1104', col: 1, row: 2, audio: 'none', proximity: 'online', note: 'Hallway C' },
        { id: '6142', col: 2, row: 2, audio: 'online', proximity: 'online', note: 'Lab' },
        { id: '3906', col: 3, row: 2, audio: 'online', proximity: 'online', note: 'Observation post' },
        { id: '3371', col: 0, row: 3, audio: 'online', proximity: 'online', note: 'Facilities room' },
        { id: '4419', col: 1, row: 3, audio: 'none', proximity: 'broken', note: 'Loading dock' },
        { id: '5108', col: 2, row: 3, audio: 'online', proximity: 'corrupted', note: 'Lab 2' },
        { id: '4471', col: 3, row: 3, audio: 'online', proximity: 'online', note: 'Vault' }
    ];

    static readonly corridors: [string, string][] = [
        ['2817', '1102'], ['1102', '5530'], ['5530', '9023'], ['1102', '1103'],
        ['1385', '1103'], ['1103', '8654'], ['8654', '6690'], ['1103', '1104'],
        ['7208', '1104'], ['1104', '6142'], ['6142', '3906'], ['3906', '4471'],
        ['1104', '4419'], ['3371', '4419'], ['4419', '5108']
    ];

    // Logs are edited with the log editor (open the dev server with ?editor) and saved to logs.json.
    static readonly logs: Log[] = logsJson as Log[];

    // Where each badge was, according to the proximity sensors (hours 5-7).
    static readonly proximity: ProximitySpan[] = SampleData.spans({
        [RAYMOND]: [['1102', 240, 250], ['5530', 250, 420]],
        [DANNY]: [['5530', 240, 255], ['1102', 255, 265], ['8654', 265, 280], ['1103', 280, 290], ['9023', 290, 300],
            ['1102', 300, 310], ['2817', 310, 325], ['1102', 325, 329], ['5530', 329, 360], ['1103', 360, 380], ['8654', 380, 420]],
        [MARCUS]: [['1104', 240, 250], ['7208', 250, 420]],
        [BEV]: [['8654', 240, 280], ['1103', 280, 290], ['1102', 290, 300], ['9023', 300, 348], ['1102', 348, 350],
            ['5530', 350, 360], ['1102', 360, 370], ['1385', 370, 420]],
        [LUIS]: [['1103', 240, 300], ['9023', 300, 350], ['1102', 350, 365], ['2817', 365, 420]],
        [VOSS]: [['1385', 240, 330], ['1103', 330, 340], ['8654', 340, 420]],
        [GUS]: [['3371', 240, 420]],
        [JAMAL]: [['4419', 240, 300], ['3371', 300, 420]],
        [OWEN]: [['6142', 240, 420]],
        [LILY]: [['6142', 240, 420]],
        [PRIYA]: [['9023', 240, 260], ['1102', 260, 270], ['1103', 270, 280], ['1104', 280, 290], ['6142', 290, 300], ['3906', 300, 420]],
        [MARGARET]: [['3906', 240, 420]]
    });

    static spans(tracks: Record<string, [string, number, number][]>): ProximitySpan[] {
        const result: ProximitySpan[] = [];
        for (const badgeId of Object.keys(tracks)) {
            for (const [room, from, to] of tracks[badgeId]) {
                result.push({ badgeId, room, from, to });
            }
        }
        return result;
    }
}
