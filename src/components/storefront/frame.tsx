import Image from "next/image"
import { mediaUrl } from "@/lib/media"

export function Frame({
  path,
  alt,
  className,
  priority = false,
  fit = "cover",
}: {
  path?: string | null
  alt: string
  className?: string
  priority?: boolean
  fit?: "cover" | "contain"
}) {
  const src = mediaUrl(path)
  const fitClass = fit === "contain" ? "object-contain" : "object-cover"
  if (!src) return <div className={className} style={{ background: "var(--sf-soft)" }} />
  if (src.startsWith("data:") || src.startsWith("blob:")) {
    return (
      <img
        src={src}
        alt={alt}
        className={`${className ?? ""} ${fitClass} ${fit === "contain" ? "bg-[var(--sf-soft)]" : ""}`}
      />
    )
  }
  return (
    <div className={`relative overflow-hidden ${fit === "contain" ? "bg-[var(--sf-soft)]" : ""} ${className ?? ""}`}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(max-width: 359px) 100vw, 50vw"
        className={fitClass}
      />
    </div>
  )
}
