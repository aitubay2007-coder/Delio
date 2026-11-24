import Image from "next/image"
import { mediaUrl } from "@/lib/media"

export function Frame({
  path,
  alt,
  className,
  priority = false,
}: {
  path?: string | null
  alt: string
  className?: string
  priority?: boolean
}) {
  const src = mediaUrl(path)
  if (!src) return <div className={className} style={{ background: "var(--sf-soft)" }} />
  if (src.startsWith("data:") || src.startsWith("blob:")) {
    return <img src={src} alt={alt} className={`${className ?? ""} object-cover`} />
  }
  return (
    <div className={`relative overflow-hidden ${className ?? ""}`}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(max-width: 768px) 100vw, 640px"
        className="object-cover"
      />
    </div>
  )
}
