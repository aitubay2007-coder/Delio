export function mediaUrl(path: string | null | undefined): string | null {
  if (!path) return null
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
