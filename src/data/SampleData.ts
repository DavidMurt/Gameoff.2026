import { BatchDef, Log, LogEntry, ProximitySpan, Room } from "./Types";

// PLACEHOLDER CONTENT - not the final story.
// Sample rooms, badges, logs and proximity data for testing the GUI and the game flow.
// Shift starts at 23:00, so minute 300 = 04:00 (hour 6).

type Line = [number, string | null, string];

function entries(lines: Line[]): LogEntry[] {
    return lines.map(([offset, badgeId, text]) => badgeId ? { offset, badgeId, text } : { offset, text });
}

// Badge IDs (placeholder) - names are only here as a note for writers, never shown to the player.
const RAYMOND = '4553';
const DANNY = '2210';
const MARGARET = '7781';
const PRIYA = '3302';
const OWEN = '5120';
const LILY = '6604';
const LUIS = '8817';
const BEV = '1946';
const MARCUS = '9135';
const VOSS = '2468';
const GUS = '3790';
const JAMAL = '5281';

export class SampleData {

    static readonly shiftStartHour = 23;

    static readonly batches: BatchDef[] = [
        { batch: 1, firstHour: 6, lastHour: 6 },
        { batch: 2, firstHour: 5, lastHour: 7 }
    ];

    // Room IDs deliberately say nothing about the room. The comment is the truth.
    static readonly rooms: Room[] = [
        { id: '2817', col: 0, row: 0, audio: 'online', proximity: 'online' },    // Entrance
        { id: '1102', col: 1, row: 0, audio: 'none', proximity: 'online' },      // Hallway A
        { id: '5530', col: 2, row: 0, audio: 'online', proximity: 'online' },    // Security office
        { id: '9023', col: 3, row: 0, audio: 'online', proximity: 'online' },    // Kitchen
        { id: '1385', col: 0, row: 1, audio: 'online', proximity: 'none' },      // Offices
        { id: '1103', col: 1, row: 1, audio: 'none', proximity: 'online' },      // Hallway B
        { id: '8654', col: 2, row: 1, audio: 'online', proximity: 'online' },    // Conference room
        { id: '6690', col: 3, row: 1, audio: 'none', proximity: 'none' },        // Utility closet
        { id: '7208', col: 0, row: 2, audio: 'online', proximity: 'none' },      // Server room
        { id: '1104', col: 1, row: 2, audio: 'none', proximity: 'online' },      // Hallway C
        { id: '6142', col: 2, row: 2, audio: 'online', proximity: 'online' },    // Lab
        { id: '3906', col: 3, row: 2, audio: 'online', proximity: 'online' },    // Observation post
        { id: '3371', col: 0, row: 3, audio: 'online', proximity: 'online' },    // Facilities room
        { id: '4419', col: 1, row: 3, audio: 'none', proximity: 'broken' },      // Loading dock
        { id: '5108', col: 2, row: 3, audio: 'online', proximity: 'corrupted' }, // Lab 2
        { id: '4471', col: 3, row: 3, audio: 'online', proximity: 'online' }     // Vault
    ];

    static readonly corridors: [string, string][] = [
        ['2817', '1102'], ['1102', '5530'], ['5530', '9023'], ['1102', '1103'],
        ['1385', '1103'], ['1103', '8654'], ['8654', '6690'], ['1103', '1104'],
        ['7208', '1104'], ['1104', '6142'], ['6142', '3906'], ['3906', '4471'],
        ['1104', '4419'], ['3371', '4419'], ['4419', '5108']
    ];

    static readonly logs: Log[] = [
        // ---------- Batch 1: hour 6 (04:00-05:00) ----------
        {
            // Security office, 04:15. Raymond's end of the radio call, then Danny comes in.
            id: '1', batch: 1, room: '5530', timestamp: 315, duration: 30,
            entries: entries([
                [0, RAYMOND, 'Webb, Okafor. Come in, over.'],
                [0, null, '[RADIO CHIRP]'],
                [1, MARCUS, 'Yeah, Ray, I\'m here. Go ahead.'],
                [2, RAYMOND, 'Status on the system. Over.'],
                [3, MARCUS, 'It\'s a mess. The box is down hard. Video\'s toast, user logs wiped. Classic.'],
                [4, RAYMOND, 'Say again? Wiped? Over.'],
                [5, MARCUS, 'Wiped. Badge-to-name tables, gone. All I\'ve got is the emergency console.'],
                [7, RAYMOND, 'Copy. I\'m in the security office. Door panels still show lockdown. Over.'],
                [8, MARCUS, 'Yeah, that\'s not me. Lockdown\'s on a separate loop.'],
                [10, RAYMOND, 'Understood. Okafor out.'],
                [10, null, '[RADIO CHIRP]'],
                [12, RAYMOND, 'Where is Kowalski.'],
                [14, null, '[DOOR BUZZER]'],
                [15, DANNY, 'Ray! Dude, it\'s like an oven out there.'],
                [16, RAYMOND, 'You\'re late. Report.'],
                [17, DANNY, 'Yeah, yeah. Checked the doors. Front entrance won\'t budge. No way anyone\'s getting out.'],
                [19, RAYMOND, 'Anyone moving around without a badge?'],
                [20, DANNY, 'Nah. Just us, the eggheads, and the cleaners. Bev\'s got coffee on.'],
                [23, RAYMOND, 'Stay by your radio.'],
                [24, DANNY, 'It\'s fine, it\'s fine. I\'m not going anywhere. Literally.'],
                [27, null, '[CHAIR CREAKS]']
            ])
        },
        {
            // Server room, 04:15. Marcus's end of the same radio call.
            id: '2', batch: 1, room: '7208', timestamp: 315, duration: 15,
            entries: entries([
                [0, null, '[SERVER FANS]'],
                [0, RAYMOND, 'Webb, Okafor. Come in, over.'],
                [1, MARCUS, 'Yeah, Ray, I\'m here. Go ahead.'],
                [2, RAYMOND, 'Status on the system. Over.'],
                [3, MARCUS, 'It\'s a mess. The box is down hard. Video\'s toast, user logs wiped. Classic.'],
                [4, RAYMOND, 'Say again? Wiped? Over.'],
                [5, MARCUS, 'Wiped. Badge-to-name tables, gone. All I\'ve got is the emergency console.'],
                [7, RAYMOND, 'Copy. I\'m in the security office. Door panels still show lockdown. Over.'],
                [8, MARCUS, 'Yeah, that\'s not me. Lockdown\'s on a separate loop.'],
                [10, RAYMOND, 'Understood. Okafor out.'],
                [11, MARCUS, '"Okafor out." Love that guy.'],
                [12, MARCUS, 'Okay, box. Talk to me. Why don\'t I remember rebooting you?'],
                [13, null, '[KEYBOARD TYPING]'],
                [14, MARCUS, 'Have you tried turning it off and on again? ...Apparently I did.']
            ])
        },
        {
            // Kitchen, 04:30. The cleaners on a coffee break.
            id: '3', batch: 1, room: '9023', timestamp: 330, duration: 15,
            entries: entries([
                [0, null, '[COFFEE MACHINE BEEPING]'],
                [0, BEV, 'There we go, love. Fresh pot. Best thing in this whole kitchen, that machine.'],
                [1, LUIS, 'Mm.'],
                [2, BEV, 'Is it me or is it boiling in here? Half past four in the morning and I\'m melting.'],
                [3, LUIS, 'Air\'s off. Since the clunk.'],
                [4, BEV, 'Don\'t tell anyone I told you, but Gus has been swearing at that air system all night.'],
                [6, LUIS, 'Not my business.'],
                [7, BEV, 'Ray was on the radio before, sounded right put out, sweetheart.'],
                [9, LUIS, 'I saw Danny. He was late.'],
                [11, BEV, 'That boy. Pour him a cup, pet, he\'ll need it.'],
                [12, null, '[CUPBOARD DOOR]'],
                [13, LUIS, 'He\'s in security.'],
                [14, BEV, 'Then I\'ll take it over to him.']
            ])
        },

        // ---------- Batch 2: hours 5-7 (03:00-06:00) ----------
        {
            // Offices, 03:15. The director on the phone.
            id: '4', batch: 2, room: '1385', timestamp: 255, duration: 15,
            entries: entries([
                [0, VOSS, 'Yes. Yes, I understand.'],
                [1, VOSS, 'Let\'s not get ahead of ourselves. The situation is contained.'],
                [3, VOSS, 'No, the item is secure. I\'ve been assured of that.'],
                [5, null, '[PHONE STATIC]'],
                [6, VOSS, 'Sorry, you\'re breaking up. The lockdown is still active, yes.'],
                [8, VOSS, 'I\'ll handle it. I\'m in my office, I can call you back on this line.'],
                [10, VOSS, 'It\'s twenty-five past three. I\'ll call again at four.'],
                [12, null, '[PHONE HANGS UP]'],
                [13, VOSS, 'That\'s above your clearance, Richard. Above everyone\'s.']
            ])
        },
        {
            // Facilities room, 05:00. The maintenance crew blow a breaker at 05:15.
            id: '5', batch: 2, room: '3371', timestamp: 360, duration: 30,
            entries: entries([
                [0, GUS, 'Right. Panel B. Come on, old girl, don\'t fight me.'],
                [1, JAMAL, '[HUMMING]'],
                [3, JAMAL, 'Boss, the lockdown loop\'s still tied into this board.'],
                [5, GUS, 'She\'s had it. Whole board\'s been cooked since that short.'],
                [8, JAMAL, 'Want me to try the breaker?'],
                [9, GUS, 'Gently. Gently.'],
                [12, JAMAL, 'On it, boss.'],
                [15, null, '[LOUD BANG]'],
                [15, GUS, 'Whoa! Kill it, kill it!'],
                [16, JAMAL, 'Sorry! Sorry. No worries, nothing\'s on fire.'],
                [18, GUS, 'Not yet it isn\'t.'],
                [21, null, '[STATIC]'],
                [22, GUS, 'Right as rain. Mostly.'],
                [25, JAMAL, 'We should tell Ray the board\'s fried.'],
                [28, GUS, 'Tell him yourself, I\'m sweating like a pig down here.']
            ])
        },
        {
            // Lab, 05:00. Owen and Lily; the bang is heard as a distant thud.
            id: '6', batch: 2, room: '6142', timestamp: 360, duration: 30,
            entries: entries([
                [0, OWEN, 'Ha! Lily, did I tell you what my youngest did?'],
                [1, LILY, 'Sorry, can I ask... is it always this hot in the labs?'],
                [2, OWEN, 'No. Not normally. The air\'s been off for hours.'],
                [4, LILY, 'Oh! Okay. Is that normal?'],
                [5, OWEN, 'Nothing about tonight is normal.'],
                [7, LILY, 'The display says twenty-eight degrees.'],
                [8, OWEN, 'Write that down, with the time. The alarm trips if it stays up there.'],
                [10, LILY, 'Okay. Writing it down.'],
                [15, null, '[DISTANT THUD]'],
                [15, LILY, 'What was that?'],
                [16, OWEN, 'Downstairs. Maintenance, probably. Gus breaks something every night.'],
                [19, LILY, 'Sorry, can I ask... are we allowed to leave?'],
                [20, OWEN, 'Not till the lockdown lifts. Sit tight.'],
                [24, OWEN, 'My kids would love this. A real lock-in.'],
                [27, LILY, 'Is that... a joke?'],
                [28, OWEN, 'Ha! Half of one.']
            ])
        },
        {
            // Observation post, 05:15. Same bang, from further away.
            id: '7', batch: 2, room: '3906', timestamp: 375, duration: 15,
            entries: entries([
                [0, null, '[DISTANT THUD]'],
                [0, PRIYA, 'Okay, okay, okay. That was the building, not the artifact.'],
                [2, MARGARET, 'Let\'s be precise about this. Readings?'],
                [3, PRIYA, 'Flat. Totally flat. That doesn\'t make sense unless...'],
                [5, MARGARET, 'Unless what?'],
                [6, PRIYA, 'Hang on. Writing down the time.'],
                [8, MARGARET, 'I\'d rather we didn\'t guess, Priya.'],
                [10, PRIYA, 'The window\'s fogging up. It\'s so hot in here.'],
                [12, MARGARET, 'Keep the observation log open. We watch it all night.']
            ])
        }
    ];

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
