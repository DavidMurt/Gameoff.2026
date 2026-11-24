import { defineConfig, Plugin } from 'vite';
import fs from 'fs';
import path from 'path';

// Dev-only: lets the log editor (?editor) save src/data/logs.json, batches.json, rooms.json and badges.json.
// Not part of the production build.
function logEditorSave(): Plugin {
  const file = path.resolve(__dirname, 'src/data/logs.json');
  const batchesFile = path.resolve(__dirname, 'src/data/batches.json');
  const roomsFile = path.resolve(__dirname, 'src/data/rooms.json');
  const badgesFile = path.resolve(__dirname, 'src/data/badges.json');
  return {
    name: 'log-editor-save',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__editor/save', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end();
          return;
        }
        let body = '';
        req.on('data', (chunk) => body += chunk);
        req.on('end', () => {
          try {
            const data = JSON.parse(body);
            if (!Array.isArray(data.logs)) {
              throw new Error('logs must be an array');
            }
            if (data.batches !== undefined && !Array.isArray(data.batches)) {
              throw new Error('batches must be an array');
            }
            if (data.rooms !== undefined && (!Array.isArray(data.rooms.rooms) || !Array.isArray(data.rooms.corridors))) {
              throw new Error('rooms must have rooms and corridors arrays');
            }
            if (data.badges !== undefined && !Array.isArray(data.badges)) {
              throw new Error('badges must be an array');
            }
            fs.writeFileSync(file, formatBlocks(data.logs, 'entries'));
            if (data.batches) {
              fs.writeFileSync(batchesFile, formatBatches(data.batches));
            }
            if (data.rooms) {
              fs.writeFileSync(roomsFile, formatRooms(data.rooms));
            }
            if (data.badges) {
              fs.writeFileSync(badgesFile, formatBlocks(data.badges, 'moves'));
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: true }));
          } catch (e) {
            res.statusCode = 400;
            res.end(JSON.stringify({ ok: false, error: String(e) }));
          }
        });
      });
    },
  };
}

// An object on one line: { "a": 1, "b": "x" }
function oneLine(o: Record<string, unknown>): string {
  return '{ ' + Object.keys(o).map((k) => JSON.stringify(k) + ': ' + JSON.stringify(o[k])).join(', ') + ' }';
}

// One batch per line.
function formatBatches(batches: Record<string, unknown>[]): string {
  return '[\r\n' + batches.map((b) => '    ' + oneLine(b)).join(',\r\n') + '\r\n]\r\n';
}

// One room and one corridor per line.
function formatRooms(data: { rooms: Record<string, unknown>[]; corridors: string[][] }): string {
  const rooms = data.rooms.map((r) => '        ' + oneLine(r));
  const corridors = data.corridors.map((c) => '        [' + c.map((id) => JSON.stringify(id)).join(', ') + ']');
  return '{\r\n    "rooms": [\r\n' + rooms.join(',\r\n') + '\r\n    ],\r\n'
    + '    "corridors": [\r\n' + corridors.join(',\r\n') + '\r\n    ]\r\n}\r\n';
}

// One field per line, and one list item per line (a log's entries, a character's moves), so diffs stay readable.
function formatBlocks(items: Record<string, unknown>[], listKey: string): string {
  const blocks = items.map((item) => {
    const lines = Object.keys(item)
      .filter((k) => k !== listKey)
      .map((k) => '        ' + JSON.stringify(k) + ': ' + JSON.stringify(item[k]));
    const list = (item[listKey] as Record<string, unknown>[] ?? []).map((e) => '            ' + oneLine(e));
    lines.push('        ' + JSON.stringify(listKey) + ': [' + (list.length ? '\r\n' + list.join(',\r\n') + '\r\n        ]' : ']'));
    return '    {\r\n' + lines.join(',\r\n') + '\r\n    }';
  });
  return '[\r\n' + blocks.join(',\r\n') + '\r\n]\r\n';
}

export default defineConfig({
  plugins: [logEditorSave()],
  server: {
    port: 5500,
    open: true, // Automatically open browser
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@': '/src', // Shortcut for imports from src
    },
  },
});
