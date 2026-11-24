// Player preferences, kept in localStorage separately from the saved investigation.
export class Settings {
    static readonly key = 'nightshift-settings';
    static readonly wheelStepOptions = [1, 2, 5, 10, 15];

    // Minutes of system time per mouse wheel notch.
    static wheelMinutes = 1;

    static load() {
        try {
            const data = JSON.parse(localStorage.getItem(Settings.key) ?? '{}') as { wheelMinutes?: number };
            if (data.wheelMinutes && Settings.wheelStepOptions.includes(data.wheelMinutes)) {
                Settings.wheelMinutes = data.wheelMinutes;
            }
        } catch (e) {
            console.warn('Could not load settings', e);
        }
    }

    static save() {
        localStorage.setItem(Settings.key, JSON.stringify({ wheelMinutes: Settings.wheelMinutes }));
    }

    // Moves to the next wheel step option, wrapping round, and saves.
    static cycleWheelMinutes(): number {
        const options = Settings.wheelStepOptions;
        Settings.wheelMinutes = options[(options.indexOf(Settings.wheelMinutes) + 1) % options.length];
        Settings.save();
        return Settings.wheelMinutes;
    }

    static wheelLabel(): string {
        return 'WHEEL STEP: ' + Settings.wheelMinutes + ' MIN';
    }
}
