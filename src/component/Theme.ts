// Shared colours, fonts and text styles for the emergency console GUI.
export class Theme {
    static readonly font = 'Consolas, "Courier New", monospace';

    static readonly background = 0x2f2f2f;
    static readonly panel = 0x1a1a1a;
    static readonly panelLight = 0x262626;
    static readonly border = 0xd8d8d8;
    static readonly borderDim = 0x555555;
    static readonly grid = 0x3c3c3c;
    static readonly gridHour = 0x666666;
    static readonly white = 0xffffff;

    static readonly viewerColors = [0xd84848, 0x4a7ae8];
    static readonly systemTime = 0xf0b020;
    static readonly highlight = 0x4a3f18;
    static readonly complete = 0x48c068;
    static readonly incorrect = 0xe05050;
    static readonly checking = 0xf0b020;
    static readonly block = 0xb0b0b0;

    static readonly text = '#e8e8e8';
    static readonly textDim = '#8a8a8a';
    static readonly textSound = '#c8a860';
    static readonly textAmber = '#f0b020';
    static readonly textGreen = '#48c068';
    static readonly textRed = '#e05050';
    static readonly textDark = '#1a1a1a';

    static style(size: number, color: string = Theme.text): Phaser.Types.GameObjects.Text.TextStyle {
        return { fontFamily: Theme.font, fontSize: size + 'px', color };
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
