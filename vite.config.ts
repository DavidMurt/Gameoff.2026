import { defineConfig, Plugin } from 'vite';
import fs from 'fs';
import path from 'path';

// Dev-only: lets the log editor (?editor) save src/data/logs.json and batches.json. Not part of the production build.
function logEditorSave(): Plugin {
  const file = path.resolve(__dirname, 'src/data/logs.json');
  const batchesFile = path.resolve(__dirname, 'src/data/batches.json');
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
            fs.writeFileSync(file, formatLogs(data.logs));
            if (data.batches) {
              fs.writeFileSync(batchesFile, formatBatches(data.batches));
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

// One batch per line.
function formatBatches(batches: Record<string, unknown>[]): string {
  const lines = batches.map((b) => '    { ' + Object.keys(b).map((k) => JSON.stringify(k) + ': ' + JSON.stringify(b[k])).join(', ') + ' }');
  return '[\r\n' + lines.join(',\r\n') + '\r\n]\r\n';
}

// One field per line, one entry per line, so diffs of logs.json stay readable.
function formatLogs(logs: Record<string, unknown>[]): string {
  const blocks = logs.map((log) => {
    const lines = Object.keys(log)
      .filter((k) => k !== 'entries')
      .map((k) => '        ' + JSON.stringify(k) + ': ' + JSON.stringify(log[k]));
    const entries = (log.entries as Record<string, unknown>[] ?? []).map((e) => '            { ' + Object.keys(e)
      .map((k) => JSON.stringify(k) + ': ' + JSON.stringify(e[k])).join(', ') + ' }');
    lines.push('        "entries": [' + (entries.length ? '\r\n' + entries.join(',\r\n') + '\r\n        ]' : ']'));
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
