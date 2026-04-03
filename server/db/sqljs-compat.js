/**
 * sql.js 上層：提供類 better-sqlite3 的 prepare().run/get/all 介面
 */
function createSqlJsCompat(db, persist) {
  function lastInsertRowid() {
    const s = db.prepare('SELECT last_insert_rowid() AS id');
    s.step();
    const row = s.getAsObject();
    s.free();
    return Number(row.id);
  }

  function changes() {
    const s = db.prepare('SELECT changes() AS c');
    s.step();
    const row = s.getAsObject();
    s.free();
    return Number(row.c);
  }

  return {
    pragma(cmd) {
      db.run(`PRAGMA ${cmd}`);
      persist();
    },
    prepare(sql) {
      return {
        run(...params) {
          const stmt = db.prepare(sql);
          stmt.bind(params.length ? params : []);
          stmt.step();
          stmt.free();
          persist();
          return { lastInsertRowid: lastInsertRowid(), changes: changes() };
        },
        get(...params) {
          const stmt = db.prepare(sql);
          stmt.bind(params.length ? params : []);
          if (!stmt.step()) {
            stmt.free();
            return undefined;
          }
          const row = stmt.getAsObject();
          stmt.free();
          return row;
        },
        all(...params) {
          const stmt = db.prepare(sql);
          stmt.bind(params.length ? params : []);
          const out = [];
          while (stmt.step()) {
            out.push(stmt.getAsObject());
          }
          stmt.free();
          return out;
        }
      };
    },
    exec(sql) {
      db.exec(sql);
      persist();
    },
    _raw: db
  };
}

module.exports = { createSqlJsCompat };
