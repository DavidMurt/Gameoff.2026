import { SampleData } from "../data/SampleData";

// Converts shift minutes (0 = start of the shift) to clock times.
export class Clock {

    static format(minutes: number): string {
        const total = (SampleData.shiftStartHour * 60 + minutes) % (24 * 60);
        const h = Math.floor(total / 60);
        const m = total % 60;
        return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
    }

    static hourLabel(minutes: number): string {
        const h = Math.floor(((SampleData.shiftStartHour * 60 + minutes) % (24 * 60)) / 60);
        const suffix = h < 12 ? 'AM' : 'PM';
        const h12 = h % 12 === 0 ? 12 : h % 12;
        return h12 + suffix;
    }

    static offset(minutes: number): string {
        return '+' + String(minutes).padStart(2, '0');
    }
}
