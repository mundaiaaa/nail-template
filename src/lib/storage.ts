import "server-only";
import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");

const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

const FONT_EXTENSIONS: Record<string, string> = {
  "font/ttf": "ttf",
  "font/otf": "otf",
  "font/woff": "woff",
  "font/woff2": "woff2",
  "application/font-sfnt": "ttf",
  "application/x-font-ttf": "ttf",
  "application/vnd.ms-fontobject": "eot",
  "application/octet-stream": "ttf",
};

export type UploadCategory = "logo" | "sticker" | "background" | "font";

function extensionFor(category: UploadCategory, file: File): string {
  if (category === "font") {
    const byMime = FONT_EXTENSIONS[file.type];
    if (byMime) return byMime;
    const byName = file.name.split(".").pop()?.toLowerCase();
    if (byName && ["ttf", "otf", "woff", "woff2"].includes(byName)) return byName;
    throw new Error("不支援的字型檔案格式，請上傳 .ttf、.otf、.woff 或 .woff2 檔案");
  }
  const byMime = IMAGE_EXTENSIONS[file.type];
  if (byMime) return byMime;
  throw new Error("不支援的圖片格式，請上傳 PNG、JPG、WEBP、GIF 或 SVG 檔案");
}

// Saves an uploaded file under public/uploads/{shopId}/{category}/{uuid}.{ext}
// and returns a storage "key" (its path relative to /uploads, also usable
// directly as a public URL since Next.js serves /public at the site root).
export async function saveUploadedFile(
  shopId: string,
  category: UploadCategory,
  file: File
): Promise<string> {
  const ext = extensionFor(category, file);
  const dir = path.join(UPLOAD_ROOT, shopId, category);
  await mkdir(dir, { recursive: true });

  const filename = `${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);

  return `/uploads/${shopId}/${category}/${filename}`;
}

export async function deleteUploadedFile(key: string): Promise<void> {
  if (!key.startsWith("/uploads/")) return;
  const filePath = path.join(process.cwd(), "public", key);
  await unlink(filePath).catch(() => {});
}
