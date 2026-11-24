import { BatchBar } from "../component/BatchBar";
import { MapPanel } from "../component/MapPanel";
import { RoomTimelinePanel } from "../component/RoomTimelinePanel";
import { TabsPanel } from "../component/TabsPanel";
import { TimelinePanel } from "../component/TimelinePanel";
import { ViewerPanel } from "../component/ViewerPanel";
import { Wallpaper } from "../component/Wallpaper";
import { GameState } from "../state/GameState";
import { Settings } from "../state/Settings";

// The investigation screen: map / all-rooms panel, two viewers and the timeline, all bound to system time.
export class GameScene extends Phaser.Scene {
    // How far a browser wheel event moves for one notch, per WheelEvent.deltaMode (pixels, lines, pages).
    static readonly notchSize = [100, 3, 1];

    gs: GameState;
    // Wheel movement not yet applied, in notches. Applied once per frame in update(), so a burst of wheel
    // events moves time once and the panels redraw once, instead of queueing redraws that keep going after
    // the wheel has stopped.
    wheelNotches = 0;
    lastWheel = 0;

    constructor() {
        super("GameScene");
    }

    create() {
        this.gs = this.registry.get('state') as GameState;
        this.input.mouse?.disableContextMenu();
        new Wallpaper(this);

        const margin = 16;
        const height = this.cameras.main.height - margin * 2;
        const leftW = 874;
        const viewerW = 412;
        const gap = 10;
        const viewer1X = margin + leftW + gap + 6;
        const viewer2X = viewer1X + viewerW + gap;
        const timelineX = viewer2X + viewerW + gap;
        const timelineW = this.cameras.main.width - margin - timelineX;
        const barH = 56;
        const leftTop = margin + barH + 8;
        const mapH = 536;

        const swap = () => this.gs.setLeftPanel(this.gs.leftPanel === 'map' ? 'rooms' : 'map');
        new BatchBar(this, margin, margin, leftW, barH, this.gs, () => this.toMenu());
        new MapPanel(this, margin, leftTop, leftW, mapH, this.gs, swap);
        new TabsPanel(this, margin, leftTop + mapH + 12, leftW, this.cameras.main.height - margin - (leftTop + mapH + 12), this.gs);
        new RoomTimelinePanel(this, margin, leftTop, leftW, this.cameras.main.height - margin - leftTop, this.gs, swap);
        new ViewerPanel(this, viewer1X, margin, viewerW, height, this.gs, 0);
        new ViewerPanel(this, viewer2X, margin, viewerW, height, this.gs, 1);
        new TimelinePanel(this, timelineX, margin, timelineW, height, this.gs);

        // The mouse wheel always moves system time, wherever the pointer is.
        this.wheelNotches = 0;
        this.input.on("wheel", (pointer: Phaser.Input.Pointer, _over: Phaser.GameObjects.GameObject[], _dx: number, dy: number) => {
            const mode = (pointer.event as WheelEvent).deltaMode ?? 0;
            this.wheelNotches += dy / (GameScene.notchSize[mode] ?? 100);
            this.lastWheel = this.time.now;
        });

        this.gs.on("gameComplete", () => {
            this.time.delayedCall(1200, () => this.scene.start("EndScene"));
        });

        this.events.once("shutdown", () => {
            this.gs.save();
            this.gs.removeAllListeners();
        });
    }

    update(time: number) {
        const steps = Math.trunc(this.wheelNotches);
        if (steps !== 0) {
            this.wheelNotches -= steps;
            this.gs.setSystemTime(this.gs.systemTime + steps * Settings.wheelMinutes);
        } else if (time - this.lastWheel > 250) {
            // Drop part-notches left over from a trackpad gesture once the wheel has gone quiet.
            this.wheelNotches = 0;
        }
    }

    toMenu() {
        this.scene.start("MenuScene");
    }
}
