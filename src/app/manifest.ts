import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Витрина",
    short_name: "Витрина",
    description: "Красивая витрина для небольшого бизнеса. Заказы уходят в WhatsApp.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f3efe8",
    theme_color: "#f3efe8",
    lang: "ru",
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  }
}
