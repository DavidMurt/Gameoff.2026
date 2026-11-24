import { SampleData } from "../data/SampleData";
import { SensorState } from "../data/Types";
import { GameState } from "../state/GameState";
import { Button } from "./Button";
import { TextField } from "./TextField";
import { Theme } from "./Theme";

type Tab = 'users' | 'rooms' | 'symbols';

// Users (badge log), Rooms (room registry) and Symbols (reserved) tabs under the map.
export class TabsPanel extends Phaser.GameObjects.Container {
    static readonly rowH = 34;
    static readonly listTop = 104;

    gs: GameState;
    w: number;
    h: number;
    tab: Tab = 'users';
    page = 0;
    tabButtons: Record<Tab, Button>;
    content: Phaser.GameObjects.GameObject[] = [];
    prevButton: Button;
    nextButton: Button;
    pageText: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, x: number, y: number, w: number, h: number, state: GameState) {
        super(scene, x, y);
        this.gs = state;
        this.w = w;
        this.h = h;
        this.create();
    }

    get rowsPerPage(): number {
        return Math.floor((this.h - TabsPanel.listTop - 56) / TabsPanel.rowH);
    }

    create() {
        const frame = this.scene.add.graphics();
        frame.fillStyle(Theme.panel, 1);
        frame.fillRect(0, 0, this.w, this.h);
        frame.lineStyle(3, Theme.border, 1);
        frame.strokeRect(0, 0, this.w, this.h);
        frame.lineBetween(0, 54, this.w, 54);
        this.tabButtons = {
            users: new Button(this.scene, 0, 0, 170, 54, 'Users', () => this.setTab('users'), 22),
            rooms: new Button(this.scene, 170, 0, 170, 54, 'Rooms', () => this.setTab('rooms'), 22),
            symbols: new Button(this.scene, 340, 0, 170, 54, 'Symbols', () => this.setTab('symbols'), 22)
        };
        this.prevButton = new Button(this.scene, this.w - 150, this.h - 48, 40, 36, '◀', () => this.setPage(this.page - 1));
        this.nextButton = new Button(this.scene, this.w - 56, this.h - 48, 40, 36, '▶', () => this.setPage(this.page + 1));
        this.pageText = this.scene.add.text(this.w - 83, this.h - 30, '', Theme.style(15, Theme.textDim)).setOrigin(0.5);
        this.add([frame, this.tabButtons.users, this.tabButtons.rooms, this.tabButtons.symbols,
            this.prevButton, this.nextButton, this.pageText]);
        this.scene.add.existing(this);

        this.gs.on("batchChanged", () => this.rebuild());
        this.gs.on("panelChanged", () => this.setVisible(this.gs.leftPanel === 'map'));
        this.setVisible(this.gs.leftPanel === 'map');
        this.rebuild();
    }

    setTab(tab: Tab) {
        this.tab = tab;
        this.page = 0;
        this.rebuild();
    }

    setPage(page: number) {
        this.page = page;
        this.rebuild();
    }

    addContent<T extends Phaser.GameObjects.GameObject>(obj: T): T {
        this.add(obj);
        this.content.push(obj);
        return obj;
    }

    text(x: number, y: number, text: string, color: string = Theme.text): Phaser.GameObjects.Text {
        return this.addContent(this.scene.add.text(x, y, text, Theme.style(17, color)));
    }

    rebuild() {
        this.content.forEach((o) => o.destroy());
        this.content = [];
        (Object.keys(this.tabButtons) as Tab[]).forEach((t) => this.tabButtons[t].setToggled(t === this.tab));

        let total = 0;
        if (this.tab === 'users') {
            total = this.buildUsers();
        } else if (this.tab === 'rooms') {
            total = this.buildRooms();
        } else {
            this.text(20, 80, 'Reserved.', Theme.textDim);
        }
        const pages = Math.max(1, Math.ceil(total / this.rowsPerPage));
        this.page = Phaser.Math.Clamp(this.page, 0, pages - 1);
        const paged = pages > 1;
        this.prevButton.setVisible(paged).setEnabled(this.page > 0);
        this.nextButton.setVisible(paged).setEnabled(this.page < pages - 1);
        this.pageText.setVisible(paged).setText((this.page + 1) + '/' + pages);
    }

    pageSlice<T>(items: T[]): T[] {
        const start = this.page * this.rowsPerPage;
        return items.slice(start, start + this.rowsPerPage);
    }

    buildUsers(): number {
        const ids = this.gs.knownBadgeIds();
        this.text(20, 70, 'BADGE ID', Theme.textDim);
        this.text(200, 70, 'NAME', Theme.textDim);
        this.text(500, 70, 'ROLE', Theme.textDim);
        this.pageSlice(ids).forEach((id, i) => {
            const y = TabsPanel.listTop + i * TabsPanel.rowH;
            this.text(20, y + 6, '#' + id);
            this.addContent(new TextField(this.scene, 200, y, 270, 30, this.gs.badgeNames[id] ?? '',
                (value) => this.gs.setBadgeName(id, value), 20));
            this.addContent(new TextField(this.scene, 500, y, 340, 30, this.gs.badgeRoles[id] ?? '',
                (value) => this.gs.setBadgeRole(id, value), 26));
        });
        return ids.length;
    }

    buildRooms(): number {
        const rooms = SampleData.rooms;
        this.text(20, 70, 'ROOM', Theme.textDim);
        this.text(120, 70, 'DESCRIPTION', Theme.textDim);
        this.text(560, 70, 'AUDIO', Theme.textDim);
        this.text(710, 70, 'PROXIMITY', Theme.textDim);
        this.pageSlice(rooms).forEach((room, i) => {
            const y = TabsPanel.listTop + i * TabsPanel.rowH;
            this.text(20, y + 6, room.id);
            this.addContent(new TextField(this.scene, 120, y, 410, 30, this.gs.roomNotes[room.id] ?? '',
                (value) => this.gs.setRoomNote(room.id, value), 30));
            this.text(560, y + 6, room.audio, this.sensorColor(room.audio));
            this.text(710, y + 6, room.proximity, this.sensorColor(room.proximity));
        });
        return rooms.length;
    }

    sensorColor(s: SensorState): string {
        switch (s) {
            case 'online': return Theme.textGreen;
            case 'corrupted': return Theme.textAmber;
            case 'broken': return Theme.textRed;
            default: return Theme.textDim;
        }
    }
}
