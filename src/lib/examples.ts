import type { NicheId } from "@/lib/types"

export type ExampleProduct = { name: string; price: number; tone: string; image: string }

export const EXAMPLE_SHOPS: Record<NicheId, { fallbackName: string; products: ExampleProduct[] }> = {
  flowers: {
    fallbackName: "Цветочная лавка",
    products: [
      { name: "Пионовый сад", price: 28000, tone: "#E7CFC9", image: "/demo/peony.jpg" },
      { name: "Ранункулюсы", price: 19000, tone: "#F3D7B5", image: "/demo/ranunculus.jpg" },
      { name: "Красные розы", price: 22000, tone: "#6E2E36", image: "/demo/roses.jpg" },
    ],
  },
  bakery: {
    fallbackName: "Пекарня на углу",
    products: [
      { name: "Фисташковый рулет", price: 8900, tone: "#E4D3A4", image: "/demo/niche-bakery.jpg" },
      { name: "Торт «Медовик»", price: 14500, tone: "#C9894A", image: "/demo/niche-bakery.jpg" },
      { name: "Карточка с именем", price: 500, tone: "#F6EFE4", image: "/demo/card.jpg" },
    ],
  },
  gifts: {
    fallbackName: "Мастерская подарков",
    products: [
      { name: "Набор свечей", price: 12000, tone: "#E8D9C4", image: "/demo/niche-gifts.jpg" },
      { name: "Керамическая чаша", price: 16000, tone: "#C9B7A2", image: "/demo/niche-gifts.jpg" },
      { name: "Открытка", price: 1500, tone: "#F7F1E8", image: "/demo/card.jpg" },
    ],
  },
  clothing: {
    fallbackName: "Ателье",
    products: [
      { name: "Льняная рубашка", price: 32000, tone: "#E6E0D6", image: "/demo/niche-clothing.jpg" },
      { name: "Шерстяной шарф", price: 18000, tone: "#8C6A52", image: "/demo/niche-clothing.jpg" },
      { name: "Хлопковая футболка", price: 14000, tone: "#F4F1EA", image: "/demo/niche-clothing.jpg" },
    ],
  },
  cosmetics: {
    fallbackName: "Лаборатория ухода",
    products: [
      { name: "Масло для лица", price: 9800, tone: "#E7D2B8", image: "/demo/niche-cosmetics.jpg" },
      { name: "Крем для рук", price: 6400, tone: "#F0E6DA", image: "/demo/niche-cosmetics.jpg" },
      { name: "Набор пробников", price: 7500, tone: "#D9CBBA", image: "/demo/niche-cosmetics.jpg" },
    ],
  },
  coffee_food: {
    fallbackName: "Кофейня",
    products: [
      { name: "Фильтр-кофе", price: 1600, tone: "#D8B48A", image: "/demo/niche-coffee.jpg" },
      { name: "Круассан", price: 1400, tone: "#E6C48A", image: "/demo/niche-coffee.jpg" },
      { name: "Обед на двоих", price: 8900, tone: "#C46A45", image: "/demo/niche-coffee.jpg" },
    ],
  },
  services: {
    fallbackName: "Студия",
    products: [
      { name: "Стрижка", price: 12000, tone: "#D9D3CC", image: "/demo/niche-services.jpg" },
      { name: "Укладка", price: 8000, tone: "#C9B8A6", image: "/demo/niche-services.jpg" },
      { name: "Окрашивание", price: 28000, tone: "#8E6B63", image: "/demo/niche-services.jpg" },
    ],
  },
}
