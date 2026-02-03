# Databases vs Text Files & SQLite in Node.js

## Advantages of a database over plain text files

- **Query power**: Filter, join, aggregate, and search efficiently without writing custom parsing logic.
- **Data integrity**: Types, constraints, keys, and relationships help prevent inconsistent or invalid data.
- **Concurrency + transactions**: Safer simultaneous reads/writes with atomic commits and rollback.
- **Performance at scale**: Indexes and optimized storage outperform linear file scans as data grows.
- **Security and access control**: Often finer-grained permission models than raw files.
- **Backup/recovery tooling**: Standardized approaches for snapshotting, restoring, and migrating.

A simple rule of thumb: text files suit **small, simple, mostly single-user** storage; databases suit
**structured, evolving, multi-user, query-heavy** data.

## SQLite vs a “full-blown” client/server database (e.g., PostgreSQL, MySQL)

### Advantages of SQLite

- **Serverless & zero-configuration**: No separate DB server process to install or administer.
- **Single-file database**: Easy to copy, ship, back up, and embed with an application.
- **Excellent for local/embedded use**: Great for apps that need reliable structured storage on one machine.
- **Low operational overhead**: Simplifies hosting and deployment for small to medium projects.

### Disadvantages of SQLite

- **Write concurrency limits**: Writes are effectively serialized due to database-level locking.
- **Less suitable for high-traffic multi-writer web back ends**.
- **Fewer enterprise-scale features**: Depending on needs, may lack advanced replication/monitoring ecosystems
  common in client/server databases.

Mental model: **SQLite competes with “opening a file,”** whereas Postgres/MySQL are shared, networked platforms.

## Node.js native SQLite (`node:sqlite`) vs typical third-party SQLite drivers

(Here “standard SQLite in Node” refers to popular third-party bindings such as `sqlite3` or `better-sqlite3`
that link to the SQLite C library.)

### Advantages of Node’s built-in `node:sqlite`

- **Fewer dependencies**: No separate package providing native bindings required.
- **Less platform/build friction**: Reduces compilation issues across OSes and Node versions.
- **Smaller supply-chain surface area**: One less critical external dependency.
- **Maintained alongside Node**: Updates to the bundled SQLite library ship with Node releases.

### Disadvantages of Node’s built-in `node:sqlite`

- **Newer/less battle-tested** than long-standing community drivers.
- **API may evolve**: Potential for breaking or behavioral changes as the module matures.
- **Feature/API differences**: Might not match the ergonomics or ecosystem integrations you already use.

### Advantages of third-party SQLite packages

- **Mature ecosystem**: Lots of tutorials, integrations, and existing production usage.
- **Choice of tradeoffs**: Different libraries offer different performance and API styles.

### Disadvantages of third-party SQLite packages

- **Native module pain**: Installation and rebuild issues can occur, especially in CI or on less common platforms.

## Quick “when to use what”

- **Text files**: Logs, tiny configs, simple single-writer data.
- **SQLite**: Prototypes, small-to-medium apps, classroom projects, desktop tools,
  edge/IoT, local caches.
- **PostgreSQL/MySQL**: High write concurrency, multi-instance web apps, centralized enterprise data.

