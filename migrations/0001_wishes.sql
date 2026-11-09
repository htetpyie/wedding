CREATE TABLE IF NOT EXISTS wishes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL CHECK(length(name) BETWEEN 1 AND 80),
  message TEXT NOT NULL CHECK(length(message) BETWEEN 3 AND 1000),
  approved INTEGER NOT NULL DEFAULT 0 CHECK(approved IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS wishes_approved_created ON wishes(approved, created_at DESC);
