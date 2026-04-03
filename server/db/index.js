/**
 * sql.js 連線與遷移（無原生編譯，適用 Windows／CI）
 */
const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');
const { createSqlJsCompat } = require('./sqljs-compat.js');

function listMigrationFiles(migrationsDir) {
  if (!fs.existsSync(migrationsDir)) return [];
  return fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();
}

async function openDatabase(rootDir) {
  const SQL = await initSqlJs();
  const dataDir = path.join(rootDir, 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  const dbPath = process.env.SQLITE_PATH || path.join(dataDir, 'app.db');
  let db;
  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  function persist() {
    const data = db.export();
    fs.writeFileSync(dbPath, Buffer.from(data));
  }

  db.run('PRAGMA foreign_keys = ON;');
  return { db, persist, dbPath };
}

function ensureMigrationsTable(db, persist) {
  db.run(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at TEXT NOT NULL
    );
  `);
  persist();
}

function runMigrations(db, persist, migrationsDir) {
  ensureMigrationsTable(db, persist);
  const applied = new Set();
  const listStmt = db.prepare('SELECT name FROM schema_migrations');
  while (listStmt.step()) {
    applied.add(listStmt.getAsObject().name);
  }
  listStmt.free();

  const files = listMigrationFiles(migrationsDir);
  for (const file of files) {
    if (applied.has(file)) continue;
    const full = path.join(migrationsDir, file);
    const sql = fs.readFileSync(full, 'utf8');
    db.exec(sql);
    const ins = db.prepare('INSERT INTO schema_migrations (name, applied_at) VALUES (?, ?)');
    ins.bind([file, new Date().toISOString()]);
    ins.step();
    ins.free();
    persist();
  }
}

async function createDb(rootDir) {
  const { db, persist } = await openDatabase(rootDir);
  const migrationsDir = path.join(__dirname, '..', 'migrations');
  runMigrations(db, persist, migrationsDir);
  return createSqlJsCompat(db, persist);
}

module.exports = { createDb, openDatabase, runMigrations };
