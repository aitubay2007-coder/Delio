import { mediaUrl } from "@/lib/media"

export function Frame({
  path,
  alt,
  className,
}: {
  path?: string | null
  alt: string
  className?: string
}) {
  const src = mediaUrl(path)
  if (!src) return <div className={className} style={{ background: "var(--sf-soft)" }} />
  return <img src={src} alt={alt} className={`${className ?? ""} object-cover`} />
}
