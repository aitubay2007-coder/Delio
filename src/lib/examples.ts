import type { NicheId } from "@/lib/types"

export type ExampleProduct = { name: string; price: number; tone: string }

export const EXAMPLE_SHOPS: Record<NicheId, { fallbackName: string; products: ExampleProduct[] }> = {
  flowers: {
    fallbackName: "Цветочная лавка",
    products: [
      { name: "Пионовый сад", price: 28000, tone: "#E7CFC9" },
      { name: "Ранункулюсы", price: 19000, tone: "#F3D7B5" },
      { name: "Красные розы", price: 22000, tone: "#6E2E36" },
    ],
  },
  bakery: {
    fallbackName: "Пекарня на углу",
    products: [
      { name: "Фисташковый рулет", price: 8900, tone: "#E4D3A4" },
      { name: "Торт «Медовик»", price: 14500, tone: "#C9894A" },
      { name: "Карточка с именем", price: 500, tone: "#F6EFE4" },
    ],
  },
  gifts: {
    fallbackName: "Мастерская подарков",
    products: [
      { name: "Набор свечей", price: 12000, tone: "#E8D9C4" },
      { name: "Керамическая чаша", price: 16000, tone: "#C9B7A2" },
      { name: "Открытка", price: 1500, tone: "#F7F1E8" },
    ],
  },
  clothing: {
    fallbackName: "Ателье",
    products: [
      { name: "Льняная рубашка", price: 32000, tone: "#E6E0D6" },
      { name: "Шерстяной шарф", price: 18000, tone: "#8C6A52" },
      { name: "Хлопковая футболка", price: 14000, tone: "#F4F1EA" },
    ],
  },
  cosmetics: {
    fallbackName: "Лаборатория ухода",
    products: [
      { name: "Масло для лица", price: 9800, tone: "#E7D2B8" },
      { name: "Крем для рук", price: 6400, tone: "#F0E6DA" },
      { name: "Набор пробников", price: 7500, tone: "#D9CBBA" },
    ],
  },
  coffee_food: {
    fallbackName: "Кофейня",
    products: [
      { name: "Фильтр-кофе", price: 1600, tone: "#D8B48A" },
      { name: "Круассан", price: 1400, tone: "#E6C48A" },
      { name: "Обед на двоих", price: 8900, tone: "#C46A45" },
    ],
  },
  services: {
    fallbackName: "Студия",
    products: [
      { name: "Стрижка", price: 12000, tone: "#D9D3CC" },
      { name: "Укладка", price: 8000, tone: "#C9B8A6" },
      { name: "Окрашивание", price: 28000, tone: "#8E6B63" },
    ],
  },
}
