import { SampleData } from "../data/SampleData";
import { Room } from "../data/Types";
import { Clock } from "../state/Clock";
import { GameState } from "../state/GameState";
import { Button } from "./Button";
import { Theme } from "./Theme";

interface RoomView {
    room: Room;
    title: Phaser.GameObjects.Text;
    body: Phaser.GameObjects.Text;
}

// The facility map. The map itself lives far off-screen in world space and is shown through its own camera,
// so it can be panned (drag) and zoomed (+/-) inside the panel.
export class MapPanel extends Phaser.GameObjects.Container {
    static readonly worldX = 10000;
    static readonly worldY = 10000;
    static readonly cellW = 250;
    static readonly cellH = 150;
    static readonly strideX = 330;
    static readonly strideY = 230;

    gs: GameState;
    w: number;
    h: number;
    frame: Phaser.GameObjects.Graphics;
    subtitle: Phaser.GameObjects.Text;
    cam: Phaser.Cameras.Scene2D.Camera;
    mapGraphics: Phaser.GameObjects.Graphics;
    mapObjects: Phaser.GameObjects.GameObject[] = [];
    roomViews: RoomView[] = [];
    panning = false;
    panStart = { x: 0, y: 0, scrollX: 0, scrollY: 0 };

    constructor(scene: Phaser.Scene, x: number, y: number, w: number, h: number, state: GameState,
        onSwap: () => void) {
        super(scene, x, y);
        this.gs = state;
        this.w = w;
        this.h = h;
        this.create(onSwap);
    }

    create(onSwap: () => void) {
        this.frame = this.scene.add.graphics();
        this.frame.fillStyle(Theme.panel, 1);
        this.frame.fillRect(0, 0, this.w, this.h);
        this.frame.lineStyle(3, Theme.border, 1);
        this.frame.strokeRect(0, 0, this.w, this.h);
        const title = this.scene.add.text(16, 12, 'MAP', Theme.style(26));
        this.subtitle = this.scene.add.text(16, 42, '', Theme.style(15, Theme.textDim));
        const zoomIn = new Button(this.scene, this.w - 300, 12, 40, 40, '+', () => this.zoom(0.15), 24);
        const zoomOut = new Button(this.scene, this.w - 252, 12, 40, 40, '−', () => this.zoom(-0.15), 24);
        const swap = new Button(this.scene, this.w - 200, 12, 186, 40, '⇄ ALL ROOMS', onSwap, 18);
        const hint = this.scene.add.text(16, this.h - 30,
            'dot = room in viewer 1 / 2 · drag to pan · +/− to zoom · left click: viewer 1 · right click: viewer 2',
            Theme.style(14, Theme.textDim));
        this.add([this.frame, title, this.subtitle, zoomIn, zoomOut, swap, hint]);
        this.scene.add.existing(this);

        this.createMap();

        const vx = this.x + 12;
        const vy = this.y + 70;
        const vw = this.w - 24;
        const vh = this.h - 110;
        const cols = Math.max(...SampleData.rooms.map((r) => r.col)) + 1;
        const rows = Math.max(...SampleData.rooms.map((r) => r.row)) + 1;
        const mapW = (cols - 1) * MapPanel.strideX + MapPanel.cellW;
        const mapH = (rows - 1) * MapPanel.strideY + MapPanel.cellH;
        this.cam = this.scene.cameras.add(vx, vy, vw, vh);
        this.cam.setBackgroundColor(Theme.panel);
        this.cam.setBounds(MapPanel.worldX - 40, MapPanel.worldY - 40, mapW + 80, mapH + 80);
        this.cam.setScroll(MapPanel.worldX - 40, MapPanel.worldY - 40);

        this.scene.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
            if (this.panning && pointer.isDown) {
                this.cam.setScroll(
                    this.panStart.scrollX - (pointer.x - this.panStart.x) / this.cam.zoom,
                    this.panStart.scrollY - (pointer.y - this.panStart.y) / this.cam.zoom);
            }
        });
        this.scene.input.on("pointerup", () => {
            this.panning = false;
        });

        this.gs.on("timeChanged", () => this.refresh());
        this.gs.on("namesChanged", () => this.refresh());
        this.gs.on("viewerChanged", () => this.refresh());
        this.gs.on("panelChanged", () => this.updateVisible());
        this.refresh();
        this.updateVisible();
    }

    createMap() {
        const wx = MapPanel.worldX;
        const wy = MapPanel.worldY;
        const cols = Math.max(...SampleData.rooms.map((r) => r.col)) + 1;
        const rows = Math.max(...SampleData.rooms.map((r) => r.row)) + 1;

        // Background zone: dragging on empty map space pans.
        const bg = this.scene.add.zone(wx - 40, wy - 40,
            (cols - 1) * MapPanel.strideX + MapPanel.cellW + 80, (rows - 1) * MapPanel.strideY + MapPanel.cellH + 80)
            .setOrigin(0).setInteractive();
        bg.on("pointerdown", (pointer: Phaser.Input.Pointer) => this.startPan(pointer));
        this.mapObjects.push(bg);

        this.mapGraphics = this.scene.add.graphics();
        this.mapObjects.push(this.mapGraphics);

        SampleData.rooms.forEach((room) => {
            const rx = wx + room.col * MapPanel.strideX;
            const ry = wy + room.row * MapPanel.strideY;
            const title = this.scene.add.text(rx + 10, ry + 8, '', Theme.style(17));
            const body = this.scene.add.text(rx + 10, ry + 36, '', Theme.style(14, Theme.textDim));
            body.setLineSpacing(4);
            const sensors = (room.audio !== 'none' ? 'AUD ' : '') + (room.proximity !== 'none' ? 'PRX' : '');
            const tag = this.scene.add.text(rx + MapPanel.cellW - 8, ry + MapPanel.cellH - 6, sensors,
                Theme.style(12, Theme.textDim)).setOrigin(1, 1);
            const zone = this.scene.add.zone(rx, ry, MapPanel.cellW, MapPanel.cellH).setOrigin(0)
                .setInteractive({ useHandCursor: true });
            zone.on("pointerdown", (pointer: Phaser.Input.Pointer) => this.startPan(pointer));
            zone.on("pointerup", (pointer: Phaser.Input.Pointer) => {
                if (Math.hypot(pointer.x - this.panStart.x, pointer.y - this.panStart.y) < 6) {
                    this.gs.setViewer(pointer.button === 2 ? 1 : 0, { kind: 'room', id: room.id });
                }
            });
            this.roomViews.push({ room, title, body });
            this.mapObjects.push(title, body, tag, zone);
        });
    }

    startPan(pointer: Phaser.Input.Pointer) {
        this.panning = true;
        this.panStart = { x: pointer.x, y: pointer.y, scrollX: this.cam.scrollX, scrollY: this.cam.scrollY };
    }

    zoom(delta: number) {
        this.cam.setZoom(Phaser.Math.Clamp(this.cam.zoom + delta, 0.55, 1.6));
    }

    updateVisible() {
        const shown = this.gs.leftPanel === 'map';
        this.setVisible(shown);
        this.cam.setVisible(shown);
        this.cam.inputEnabled = shown;
    }

    refresh() {
        const t = this.gs.systemTime;
        this.subtitle.setText('badge IDs in each room at ' + Clock.format(t));
        const g = this.mapGraphics;
        g.clear();
        const center = (id: string) => {
            const r = this.gs.room(id);
            return {
                x: MapPanel.worldX + r.col * MapPanel.strideX + MapPanel.cellW / 2,
                y: MapPanel.worldY + r.row * MapPanel.strideY + MapPanel.cellH / 2
            };
        };
        g.lineStyle(6, Theme.borderDim, 1);
        SampleData.corridors.forEach(([a, b]) => {
            const p = center(a);
            const q = center(b);
            g.lineBetween(p.x, p.y, q.x, q.y);
        });

        this.roomViews.forEach((view) => {
            const room = view.room;
            const rx = MapPanel.worldX + room.col * MapPanel.strideX;
            const ry = MapPanel.worldY + room.row * MapPanel.strideY;
            g.fillStyle(Theme.panelLight, 1);
            g.fillRect(rx, ry, MapPanel.cellW, MapPanel.cellH);
            g.lineStyle(2, Theme.border, 1);
            g.strokeRect(rx, ry, MapPanel.cellW, MapPanel.cellH);
            [0, 1].forEach((i) => {
                if (this.gs.viewerRoom(i) === room.id) {
                    g.lineStyle(4, Theme.viewerColors[i], 1);
                    g.strokeRect(rx + 2 + i * 4, ry + 2 + i * 4, MapPanel.cellW - 4 - i * 8, MapPanel.cellH - 4 - i * 8);
                    g.fillStyle(Theme.viewerColors[i], 1);
                    g.fillCircle(rx + MapPanel.cellW - 18 - i * 22, ry + 18, 8);
                }
            });

            view.title.setText(this.gs.roomLabel(room.id));
            view.body.setText(this.bodyText(room, t));
        });
    }

    bodyText(room: Room, t: number): string {
        if (room.proximity === 'none') {
            return 'no proximity\n??';
        }
        if (room.proximity === 'broken') {
            return 'proximity offline\n??';
        }
        const ids = this.gs.badgesIn(room.id, t);
        let lines = ids.map((id) => {
            const name = this.gs.badgeNames[id];
            const shown = room.proximity === 'corrupted' ? id.slice(0, 1) + '▒▒' + id.slice(3) : id;
            return '#' + shown + (name && room.proximity !== 'corrupted' ? ' ' + name : '');
        });
        if (lines.length > 5) {
            lines = lines.slice(0, 4).concat(['+' + (ids.length - 4) + ' more']);
        }
        return lines.join('\n');
    }
}
