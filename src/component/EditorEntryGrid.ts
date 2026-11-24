import { LineWrap } from "../data/LineWrap";
import { SampleData } from "../data/SampleData";
import { Log, LogEntry } from "../data/Types";
import { Clock } from "../state/Clock";
import { EditorState } from "../state/EditorState";
import { Theme } from "./Theme";

interface EntryRow {
    time: HTMLInputElement;
    offset: HTMLInputElement;
    who: HTMLSelectElement;
    text: HTMLInputElement;
}

// Log editor: a log's entries as an HTML table, one row per entry, in one editor slot.
// Columns: clock TIME and +MIN offset (editing either updates the other), SPEAKER (a character, or the effects
// Sound = golden text with no speaker, Blank line = an empty viewer line), and TEXT.
// Enter in a text box adds a row below. Rows are re-sorted by time when focus leaves the table, so typing never
// moves the row you're on. Changes go through EditorState.edit() with source 'entries' + slot, so this table
// doesn't rebuild itself (and lose focus) for its own edits.
// readOnly: the same columns as plain text (editor 2, the reference log), with long text wrapped.
// The rows scroll inside the table's fixed height.
export class EditorEntryGrid extends Phaser.GameObjects.DOMElement {
    static readonly soundValue = 'sound';
    static readonly blankValue = 'blank';
    static readonly inputCss = 'box-sizing:border-box;height:28px;padding:2px 6px;background:#1a1a1a;color:#e8e8e8;'
        + 'border:2px solid #555555;outline:none;font-family:Consolas,"Courier New",monospace;font-size:15px;';
    static readonly buttonCss = 'box-sizing:border-box;height:28px;width:26px;padding:0;background:#14305a;color:#dff6ff;'
        + 'border:1px solid #2f6684;cursor:pointer;font-family:Consolas,monospace;font-size:15px;';

    editor: EditorState;
    slot: number;
    list: HTMLDivElement;
    rows: EntryRow[] = [];
    shownLogId: string | null = null;
    building = false;
    readOnly: boolean;

    constructor(scene: Phaser.Scene, x: number, y: number, w: number, h: number, editor: EditorState, slot: number,
        readOnly = false) {
        super(scene, x, y, document.createElement('div'));
        this.editor = editor;
        this.slot = slot;
        this.readOnly = readOnly;
        this.create(w, h);
    }

    get source(): string {
        return 'entries' + this.slot;
    }

    get log(): Log | undefined {
        return this.editor.selected(this.slot);
    }

    create(w: number, h: number) {
        const root = this.node as HTMLDivElement;
        // Phaser sets display:block on its DOM element every frame, so the layout uses fixed heights, not flexbox.
        // position:absolute is Phaser's own setting, restored here because cssText replaces it; without it, each
        // table would sit below the one before it.
        const headH = 22;
        root.dataset.entryGrid = String(this.slot);
        root.style.cssText = 'position:absolute;box-sizing:border-box;width:' + w + 'px;height:' + h + 'px;overflow:hidden;'
            + 'background:#101010;border:2px solid #555555;font-family:Consolas,"Courier New",monospace;';
        const head = document.createElement('div');
        head.style.cssText = 'box-sizing:border-box;height:' + headH + 'px;display:flex;gap:4px;padding:3px 4px;color:' + Theme.textDim
            + ';font-size:13px;border-bottom:1px solid #333;';
        [['TIME', 62], ['+MIN', 46], ['SPEAKER', 132], ['TEXT', 0]].forEach(([text, width]) => {
            const span = document.createElement('span');
            span.textContent = text as string;
            span.style.cssText = width ? 'width:' + width + 'px;flex:none;' : 'flex:1;';
            head.appendChild(span);
        });
        this.list = document.createElement('div');
        // The rows scroll inside the space under the header, rather than spilling out below the table.
        this.list.style.cssText = 'box-sizing:border-box;height:' + (h - 4 - headH) + 'px;overflow-y:auto;padding:2px 4px;';
        root.append(head, this.list);

        // Re-sort by time once focus leaves the table.
        root.addEventListener('focusout', (event) => {
            if (!this.building && !root.contains(event.relatedTarget as Node | null)) {
                this.sortIfNeeded();
            }
        });

        this.editor.on("selectionChanged", () => {
            if ((this.log?.id ?? null) !== this.shownLogId) {
                this.build();
            }
        });
        this.editor.on("dataChanged", (source: string) => {
            if (source !== this.source) {
                this.build();
            }
        });
        this.setOrigin(0);
        this.scene.add.existing(this);
        this.build();
    }

    // Applies a change to this slot's log without rebuilding the table, then re-marks problem cells.
    change(fn: (log: Log) => void, undo = true) {
        this.editor.edit(fn, undo, this.source, this.slot);
        this.mark();
    }

    build() {
        this.building = true;
        const log = this.log;
        // Keep the scroll position when the same log is redrawn.
        const scroll = (log?.id ?? null) === this.shownLogId ? this.list.scrollTop : 0;
        this.shownLogId = log?.id ?? null;
        this.list.replaceChildren();
        this.rows = [];
        if (log && this.readOnly) {
            log.entries.forEach((e) => this.makeReadRow(log, e));
        } else if (log) {
            log.entries.forEach((_e, i) => this.rows.push(this.makeRow(log, i)));
            const add = document.createElement('button');
            add.textContent = '+ ADD LINE';
            add.style.cssText = EditorEntryGrid.buttonCss + 'width:auto;padding:0 10px;margin-top:4px;';
            add.addEventListener('click', () => this.insert(log.entries.length - 1));
            this.list.appendChild(add);
            this.mark();
        }
        this.list.scrollTop = scroll;
        this.building = false;
    }

    // A read-only row: the same columns as plain text, with the text wrapped.
    makeReadRow(log: Log, e: LogEntry) {
        const el = document.createElement('div');
        el.style.cssText = 'display:flex;gap:4px;padding:3px 0;border-bottom:1px solid #222;font-size:15px;color:#e8e8e8;';
        const cell = (text: string, css: string) => {
            const span = document.createElement('span');
            span.textContent = text;
            span.style.cssText = css;
            el.appendChild(span);
        };
        const past = e.offset >= log.duration;
        cell(Clock.format(log.timestamp + e.offset), 'width:62px;flex:none;text-align:center;' + (past ? 'color:' + Theme.textRed + ';' : ''));
        cell(String(e.offset), 'width:46px;flex:none;text-align:center;color:' + Theme.textDim + ';');
        const who = e.blank ? '· Blank line' : (e.badgeId ? (this.editor.badge(e.badgeId)?.note ?? 'unknown') + ' ' + e.badgeId : '♪ Sound');
        cell(who, 'width:132px;flex:none;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;'
            + (e.badgeId ? '' : 'color:' + (e.blank ? Theme.textDim : Theme.textSound) + ';'));
        cell(e.blank ? '' : e.text, 'flex:1;min-width:0;overflow-wrap:anywhere;' + (e.badgeId ? '' : 'color:' + Theme.textSound + ';'));
        this.list.appendChild(el);
    }

    makeRow(log: Log, i: number): EntryRow {
        const entry = () => log.entries[i];
        const el = document.createElement('div');
        el.style.cssText = 'display:flex;gap:4px;margin:2px 0;align-items:center;';
        const input = (width: string) => {
            const box = document.createElement('input');
            box.type = 'text';
            box.spellcheck = false;
            box.style.cssText = EditorEntryGrid.inputCss + width;
            return box;
        };

        // Time and offset: setting either one sets the other.
        const time = input('width:62px;flex:none;text-align:center;');
        const offset = input('width:46px;flex:none;text-align:center;');
        const setOffset = (value: number) => {
            this.change((l) => l.entries[i].offset = value);
            time.value = Clock.format(log.timestamp + value);
            offset.value = String(value);
        };
        time.addEventListener('change', () => {
            const minutes = EditorEntryGrid.parseClock(time.value);
            const value = minutes === null ? -1 : minutes - log.timestamp;
            if (value < 0) {
                time.value = Clock.format(log.timestamp + entry().offset);
                return;
            }
            setOffset(value);
        });
        offset.addEventListener('change', () => {
            const value = /^\+?\d+$/.test(offset.value.trim()) ? parseInt(offset.value.trim().replace('+', ''), 10) : -1;
            if (value < 0) {
                offset.value = String(entry().offset);
                return;
            }
            setOffset(value);
        });

        // Speaker: a character, or an effect.
        const who = document.createElement('select');
        who.style.cssText = EditorEntryGrid.inputCss + 'width:132px;flex:none;padding:0 2px;';
        const group = (label: string) => {
            const g = document.createElement('optgroup');
            g.label = label;
            who.appendChild(g);
            return g;
        };
        const option = (parent: HTMLElement, value: string, label: string, color?: string) => {
            const o = document.createElement('option');
            o.value = value;
            o.textContent = label;
            if (color) {
                o.style.color = color;
            }
            parent.appendChild(o);
        };
        const characters = group('Characters');
        this.editor.badges.forEach((b) => option(characters, b.id, b.note + ' ' + b.id));
        const badgeId = entry().badgeId;
        if (badgeId && !this.editor.badge(badgeId)) {
            option(characters, badgeId, 'unknown ' + badgeId, Theme.textRed);
        }
        const effects = group('Effects');
        option(effects, EditorEntryGrid.soundValue, '♪ Sound', Theme.textSound);
        option(effects, EditorEntryGrid.blankValue, '· Blank line', Theme.textDim);
        who.value = EditorEntryGrid.speakerValue(entry());

        const text = input('flex:1;min-width:0;');
        text.value = entry().text;
        text.addEventListener('focus', () => this.editor.checkpoint());
        text.addEventListener('input', () => this.change((l) => l.entries[i].text = text.value, false));
        text.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                this.insert(i);
            }
        });
        // Switching to a blank line clears the text; switching back brings it back (while this row is on screen).
        let keptText = '';
        who.addEventListener('change', () => {
            const wasBlank = !!entry().blank;
            if (!wasBlank) {
                keptText = entry().text;
            }
            this.change((l) => {
                EditorEntryGrid.setSpeaker(l.entries[i], who.value);
                if (wasBlank && !l.entries[i].blank) {
                    l.entries[i].text = keptText;
                }
            });
            text.value = entry().text;
            EditorEntryGrid.styleText(text, entry());
        });
        EditorEntryGrid.styleText(text, entry());

        const button = (label: string, title: string, onClick: () => void) => {
            const b = document.createElement('button');
            b.textContent = label;
            b.title = title;
            b.tabIndex = -1;
            b.style.cssText = EditorEntryGrid.buttonCss;
            b.addEventListener('click', onClick);
            return b;
        };
        el.append(time, offset, who, text,
            button('+', 'Add a line below', () => this.insert(i)),
            button('×', 'Delete this line', () => this.remove(i)));
        time.value = Clock.format(log.timestamp + entry().offset);
        offset.value = String(entry().offset);
        this.list.appendChild(el);
        return { time, offset, who, text };
    }

    // Adds a line after row i (at the same time, with the same speaker) and puts the cursor in its text.
    insert(i: number) {
        const log = this.log;
        if (!log) {
            return;
        }
        const prev = log.entries[i];
        const entry: LogEntry = { offset: prev?.offset ?? 0, text: '' };
        if (prev?.badgeId) {
            entry.badgeId = prev.badgeId;
        } else if (!prev) {
            const first = this.editor.badges[0];
            if (first) {
                entry.badgeId = first.id;
            }
        }
        this.editor.edit((l) => l.entries.splice(i + 1, 0, entry), true, this.source, this.slot);
        this.build();
        this.rows[i + 1]?.text.focus();
    }

    remove(i: number) {
        this.editor.edit((l) => l.entries.splice(i, 1), true, this.source, this.slot);
        this.build();
    }

    // Puts the entries back in time order (stable, so lines in the same minute keep their order).
    sortIfNeeded() {
        const log = this.log;
        if (!log || log.entries.every((e, i) => i === 0 || e.offset >= log.entries[i - 1].offset)) {
            return;
        }
        this.editor.edit((l) => l.entries.sort((a, b) => a.offset - b.offset), false, this.source, this.slot);
        this.build();
    }

    // Red edges: past the end of the log, or a minute with more lines than fit. Amber: out of time order.
    mark() {
        const log = this.log;
        if (!log) {
            return;
        }
        const overfull = new Set(LineWrap.overfullMinutes(log.entries).map((m) => m.offset));
        this.rows.forEach((row, i) => {
            const e = log.entries[i];
            if (!e) {
                return;
            }
            const bad = e.offset >= log.duration || overfull.has(e.offset);
            const unsorted = i > 0 && e.offset < log.entries[i - 1].offset;
            const color = bad ? Theme.textRed : (unsorted ? Theme.textAmber : '#555555');
            row.time.style.borderColor = color;
            row.offset.style.borderColor = color;
            row.time.title = row.offset.title = e.offset >= log.duration ? 'Past the end of the log'
                : (overfull.has(e.offset) ? 'This minute needs more than ' + LineWrap.linesPerMinute + ' lines' : '');
            row.text.style.borderColor = !e.blank && e.text.trim() === '' ? Theme.textRed : '#555555';
        });
    }

    // "6:03", "06:03" or "0603" as shift minutes, or null.
    static parseClock(value: string): number | null {
        const m = value.trim().match(/^(\d{1,2}):?(\d{2})$/);
        if (!m || parseInt(m[1], 10) > 23 || parseInt(m[2], 10) > 59) {
            return null;
        }
        return SampleData.toShiftMinutes(m[1].padStart(2, '0') + ':' + m[2]);
    }

    static speakerValue(e: LogEntry): string {
        return e.blank ? EditorEntryGrid.blankValue : (e.badgeId ?? EditorEntryGrid.soundValue);
    }

    static setSpeaker(e: LogEntry, value: string) {
        delete e.badgeId;
        delete e.blank;
        if (value === EditorEntryGrid.blankValue) {
            e.blank = true;
            e.text = '';
        } else if (value !== EditorEntryGrid.soundValue) {
            e.badgeId = value;
        }
    }

    // Sound text is golden; a blank line has no text.
    static styleText(text: HTMLInputElement, e: LogEntry) {
        text.disabled = !!e.blank;
        text.placeholder = e.blank ? '(blank line)' : '';
        if (e.blank) {
            text.value = '';
        }
        text.style.color = e.badgeId || e.blank ? '#e8e8e8' : Theme.textSound;
        text.style.opacity = e.blank ? '0.5' : '1';
    }
}
