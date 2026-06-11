// Stub for `server-only` in tests. The actual `server-only` package
// throws at build time when imported from a client component; in a
// pure-Node test environment there's no client bundler, so we just
// no-op the import.
export {};
