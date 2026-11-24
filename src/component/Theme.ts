// Shared colours, fonts and text styles for the emergency console GUI ("glass HUD" look).
export class Theme {
    static readonly font = 'Consolas, "Courier New", monospace';
    static readonly titleFont = 'orbitron, Consolas, monospace';

    static readonly background = 0x040814;
    static readonly backgroundCss = '#040814';
    static readonly panel = 0x0a1830;
    static readonly panelAlpha = 0.6;
    static readonly panelLight = 0x14305a;
    static readonly border = 0x6ee7ff;
    static readonly borderBright = 0xc8f8ff;
    static readonly borderDim = 0x2f6684;
    static readonly grid = 0x173550;
    static readonly gridHour = 0x2f6684;
    static readonly white = 0xffffff;

    static readonly viewerColors = [0xff4fa3, 0x6ee7ff];
    static readonly systemTime = 0xffd166;
    static readonly highlight = 0x6a5416;
    static readonly complete = 0x4dffa0;
    static readonly incorrect = 0xff5a6a;
    static readonly checking = 0xffd166;
    static readonly block = 0x8fb6cc;

    static readonly text = '#dff6ff';
    static readonly textDim = '#7fb3cc';
    static readonly textSound = '#e8c070';
    static readonly textAmber = '#ffd166';
    static readonly textGreen = '#4dffa0';
    static readonly textRed = '#ff6b7a';
    static readonly textDark = '#040814';
    static readonly glow = '#6ee7ff';

    static style(size: number, color: string = Theme.text): Phaser.Types.GameObjects.Text.TextStyle {
        return { fontFamily: Theme.font, fontSize: size + 'px', color };
    }

    // Orbitron for titles and panel headings. Body text stays monospace so columns line up.
    static titleStyle(size: number, color: string = Theme.text): Phaser.Types.GameObjects.Text.TextStyle {
        return { fontFamily: Theme.titleFont, fontSize: size + 'px', fontStyle: 'bold', color };
    }

    // A soft neon glow for titles.
    static glowText<T extends Phaser.GameObjects.Text>(text: T, color: string = Theme.glow, blur = 12): T {
        text.setShadow(0, 0, color, blur, false, true);
        // Pad the text canvas so the glow isn't clipped into a box, then shift back so the letters stay put.
        text.setPadding(blur);
        text.setPosition(text.x - blur * (1 - 2 * text.originX), text.y - blur * (1 - 2 * text.originY));
        return text;
    }

    static statusColor(status: string): string {
        switch (status) {
            case 'CORRECT': return Theme.textGreen;
            case 'INCORRECT': return Theme.textRed;
            case 'VERIFYING...': return Theme.textAmber;
            default: return Theme.textDim;
        }
    }
}
