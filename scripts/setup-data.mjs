// The story data files (logs, batches, badges, rooms) hold spoilers, so they're not in git.
// After a fresh clone, this copies the spoiler-free *.example.json placeholders into place so the game builds.
// It never overwrites a real data file. Runs automatically after `yarn install`.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const dataDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src/data');
for (const name of ['logs', 'batches', 'badges', 'rooms']) {
    const file = path.join(dataDir, name + '.json');
    if (!fs.existsSync(file)) {
        fs.copyFileSync(path.join(dataDir, name + '.example.json'), file);
        console.log('Created src/data/' + name + '.json from the placeholder ' + name + '.example.json');
    }
}
