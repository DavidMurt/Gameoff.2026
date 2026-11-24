import { LogEntry } from "./Types";

export interface WrappedLine {
    text: string;
    sound: boolean;     // a sound event such as "[LOUD CRASH]" rather than speech
}

// How log entries are broken into viewer lines. Every minute of a transcript gets exactly
// `linesPerMinute` lines in the viewers, so two viewers always line up minute for minute.
// The viewer font is monospace, so wrapping is done by character count, and the log editor can
// check the same rule without Phaser.
export class LineWrap {
    static readonly linesPerMinute = 3;
    static readonly charsPerLine = 36;
    // Player-entered names are cut to this length in transcript labels, so a filled-in name can never
    // push a minute past its line limit. The authoring check assumes a name this long.
    static readonly nameChars = 8;

    static label(badgeId: string, name = ''): string {
        const shown = name.slice(0, LineWrap.nameChars);
        return shown ? '<ID#' + badgeId + ' - ' + shown + '>' : '<ID#' + badgeId + '>';
    }

    // Word wrap to `charsPerLine`; words longer than a line are broken.
    static wrap(text: string): string[] {
        const max = LineWrap.charsPerLine;
        const lines: string[] = [];
        let line = '';
        text.split(/\s+/).filter((w) => w.length > 0).forEach((word) => {
            while (word.length > max) {
                if (line) {
                    lines.push(line);
                    line = '';
                }
                lines.push(word.slice(0, max));
                word = word.slice(max);
            }
            if (!line) {
                line = word;
            } else if (line.length + 1 + word.length <= max) {
                line += ' ' + word;
            } else {
                lines.push(line);
                line = word;
            }
        });
        if (line) {
            lines.push(line);
        }
        return lines;
    }

    static entryLines(entry: LogEntry, name = ''): WrappedLine[] {
        const text = entry.badgeId ? LineWrap.label(entry.badgeId, name) + ' ' + entry.text : entry.text;
        return LineWrap.wrap(text).map((t) => ({ text: t, sound: !entry.badgeId }));
    }

    // All lines for one minute (entries in the order they are listed), not yet cut to the limit.
    static minuteLines(entries: LogEntry[], nameOf: (badgeId: string) => string): WrappedLine[] {
        return entries.flatMap((e) => LineWrap.entryLines(e, e.badgeId ? nameOf(e.badgeId) : ''));
    }

    // Authoring check: minutes (offsets) of a log whose entries need more lines than a minute has,
    // assuming every speaker has a name of the longest length shown.
    static overfullMinutes(entries: LogEntry[]): { offset: number; lines: number }[] {
        const longName = 'X'.repeat(LineWrap.nameChars);
        const byOffset = new Map<number, LogEntry[]>();
        entries.forEach((e) => byOffset.set(e.offset, [...(byOffset.get(e.offset) ?? []), e]));
        const result: { offset: number; lines: number }[] = [];
        byOffset.forEach((list, offset) => {
            const lines = LineWrap.minuteLines(list, () => longName).length;
            if (lines > LineWrap.linesPerMinute) {
                result.push({ offset, lines });
            }
        });
        return result.sort((a, b) => a.offset - b.offset);
    }
}
