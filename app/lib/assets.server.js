import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { imagePaths } from "../configs/asset-paths.js";
import { soundRecipes } from "./sound-recipes.server.js";
import { soundFiles } from "../configs/sound-assets.js";

export async function assetResponse(request, kind, id) {
  let body;
  let type;
  if (kind === "sounds" && !id) {
    body = JSON.stringify(soundRecipes);
    type = "application/json";
  } else if (
    (kind === "images" && Object.hasOwn(imagePaths, id)) ||
    (kind === "audio" && Object.hasOwn(soundFiles, id))
  ) {
    const root = import.meta.env?.DEV ? "public" : "build/client";
    try {
      const path =
        kind === "images" ? imagePaths[id] : `/sounds/${soundFiles[id]}`;
      body = await readFile(resolve(root, `.${path}`));
    } catch {
      return new Response("Asset unavailable", { status: 404 });
    }
    type =
      kind === "images"
        ? "image/png"
        : soundFiles[id].endsWith(".mp3")
          ? "audio/mpeg"
          : "audio/wav";
  } else {
    return new Response("Asset not found", { status: 404 });
  }
  const etag = `"${createHash("sha256").update(body).digest("hex")}"`;
  const headers = {
    "Content-Type": type,
    "Cache-Control": "public, max-age=0, must-revalidate",
    "X-Content-Type-Options": "nosniff",
    ETag: etag,
  };
  if (request.headers.get("If-None-Match") === etag)
    return new Response(null, { status: 304, headers });
  return new Response(request.method === "HEAD" ? null : body, { headers });
}
