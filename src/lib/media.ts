const DEMO_PHOTO: Record<string, string> = {
  "/demo/peony.svg": "/demo/peony.jpg",
  "/demo/peony-alt.svg": "/demo/peony-alt.jpg",
  "/demo/ranunculus.svg": "/demo/ranunculus.jpg",
  "/demo/roses.svg": "/demo/roses.jpg",
  "/demo/dried.svg": "/demo/dried.jpg",
  "/demo/box.svg": "/demo/box.jpg",
  "/demo/card.svg": "/demo/card.jpg",
  "/demo/cover.svg": "/demo/cover.jpg",
  "/demo/logo.svg": "/demo/logo.jpg",
}

function preferPhoto(path: string) {
  return DEMO_PHOTO[path] ?? path
}

export function mediaUrl(path: string | null | undefined): string | null {
  if (!path) return null
  path = preferPhoto(path)
  if (
    path.startsWith("/") ||
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:") ||
    path.startsWith("blob:")
  ) {
    return path
  }
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!base) return null
  const encoded = path.split("/").map(encodeURIComponent).join("/")
  return `${base.replace(/\/$/, "")}/storage/v1/object/public/store-media/${encoded}`
}

export function fileExtension(file: File): "jpg" | "png" | "webp" | null {
  if (file.type === "image/jpeg") return "jpg"
  if (file.type === "image/png") return "png"
  if (file.type === "image/webp") return "webp"
  return null
}
