import { readdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const root = new URL("../build/client/", import.meta.url);
async function walk(directory, prefix = "") {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries
      .filter((e) => !e.name.startsWith(".") && e.name !== "sw.js")
      .map((e) =>
        e.isDirectory()
          ? walk(new URL(`${e.name}/`, directory), `${prefix}${e.name}/`)
          : `${prefix}${e.name}`,
      ),
  );
  return nested.flat();
}
const files = (await walk(root)).sort();
const hash = createHash("sha256");
for (const file of files) {
  hash.update(file);
  hash.update(await readFile(new URL(file, root)));
}
const version = hash.digest("hex").slice(0, 16);
const urls = [
  "/",
  "/mission",
  "/kitchen",
  "/packing",
  "/delivery",
  "/results",
  ...files.map((f) => `/${f}`),
];
await writeFile(
  new URL("sw.js", root),
  `// Generated from the complete build. Install succeeds only when all game assets are cached.
const CACHE = "mbg-offline-${version}";
const URLS = ${JSON.stringify(urls)};
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(URLS.map(url => new Request(url, { cache: "reload" })))));
});
// Leave a new worker waiting while an older game is open; never mix builds mid-run.
self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) if (name.startsWith("mbg-offline-") && name !== CACHE) await caches.delete(name);
    await self.clients.claim();
  })());
});
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const key = event.request.mode === "navigate" ? url.pathname : event.request;
    const cached = await cache.match(key);
    return cached || fetch(event.request);
  })());
});
`,
);
console.log(`Offline bundle: ${urls.length} resources, version ${version}`);
