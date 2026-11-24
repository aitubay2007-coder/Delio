import { defaultHours } from "@/lib/catalog"
import type { Product, ShopOrder, StoreBundle, StoreCover } from "@/lib/types"

const STORE_ID = "11111111-1111-4111-8111-111111111111"

const categories = [
  { id: "22222222-2222-4222-8222-222222222221", store_id: STORE_ID, name: "Сезонные", sort_order: 0 },
  { id: "22222222-2222-4222-8222-222222222222", store_id: STORE_ID, name: "Монобукеты", sort_order: 1 },
  { id: "22222222-2222-4222-8222-222222222223", store_id: STORE_ID, name: "Композиции", sort_order: 2 },
  { id: "22222222-2222-4222-8222-222222222224", store_id: STORE_ID, name: "Открытки", sort_order: 3 },
]

function photo(id: string, productId: string, path: string, sort = 0) {
  return { id, store_id: STORE_ID, product_id: productId, storage_path: path, sort_order: sort }
}

function product(
  id: string,
  categoryId: string,
  name: string,
  description: string,
  price: number,
  sort: number,
  photos: Product["photos"],
): Product {
  return {
    id,
    store_id: STORE_ID,
    category_id: categoryId,
    name,
    description,
    price,
    available: true,
    sort_order: sort,
    photos,
  }
}

export function fixtureBundle(): StoreBundle {
  const covers: StoreCover[] = [
    {
      id: "55555555-5555-4555-8555-555555555551",
      store_id: STORE_ID,
      storage_path: "/demo/cover.jpg",
      sort_order: 0,
    },
  ]
  return {
    source: "fixture",
    covers,
    categories,
    store: {
      id: STORE_ID,
      owner_id: null,
      name: "Цветочная лавка",
      slug: "primer",
      niche: "flowers",
      whatsapp_e164: "+77000000000",
      logo_path: "/demo/logo.jpg",
      address: "Алматы, пример адреса",
      working_hours: {
        ...defaultHours(),
        days: {
          ...defaultHours().days,
          sat: { closed: false, open: "11:00", close: "19:00" },
          sun: { closed: true, open: "11:00", close: "19:00" },
        },
      },
      delivery_enabled: true,
      pickup_enabled: true,
      delivery_zones: [
        { id: "center", name: "В пределах города", price: 2000 },
        { id: "outside", name: "За городом", price: 4000 },
      ],
      min_order: 0,
      template: "boutique",
      accent_color: "#9A4D55",
      order_form: {
        fields: [
          { id: "card_text", key: "card_text", label: "Текст открытки", type: "textarea", required: false },
          { id: "recipient_name", key: "recipient_name", label: "Имя получателя", type: "text", required: false },
          { id: "recipient_phone", key: "recipient_phone", label: "Телефон получателя", type: "phone", required: false },
          {
            id: "surprise",
            key: "surprise",
            label: "Сюрприз: не говорить, кто отправитель",
            type: "checkbox",
            required: false,
          },
        ],
      },
      trial_ends_at: "2099-01-01T00:00:00.000Z",
      subscription_status: "active",
      whop_customer_id: null,
      whop_membership_id: null,
      is_demo: true,
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    },
    products: [
      product(
        "33333333-3333-4333-8333-333333333331",
        categories[0].id,
        "Пионовый сад",
        "Сезонные пионы на длинном стебле. Бумага крафт, лента по желанию.",
        28000,
        0,
        [
          photo("44444444-4444-4444-8444-444444444441", "33333333-3333-4333-8333-333333333331", "/demo/peony.jpg"),
          photo("44444444-4444-4444-8444-444444444442", "33333333-3333-4333-8333-333333333331", "/demo/peony-alt.jpg", 1),
        ],
      ),
      product(
        "33333333-3333-4333-8333-333333333332",
        categories[0].id,
        "Ранункулюсы",
        "Ранункулюсы абрикоса и сливок, собранные неплотно.",
        19000,
        1,
        [photo("44444444-4444-4444-8444-444444444443", "33333333-3333-4333-8333-333333333332", "/demo/ranunculus.jpg")],
      ),
      product(
        "33333333-3333-4333-8333-333333333333",
        categories[1].id,
        "Красные розы",
        "Пятнадцать роз на длинном стебле, без лишней зелени.",
        22000,
        2,
        [photo("44444444-4444-4444-8444-444444444444", "33333333-3333-4333-8333-333333333333", "/demo/roses.jpg")],
      ),
      product(
        "33333333-3333-4333-8333-333333333334",
        categories[2].id,
        "Сухоцветы",
        "Сухоцветы овсяного и песочного тона. Стоят месяцами.",
        14000,
        3,
        [photo("44444444-4444-4444-8444-444444444445", "33333333-3333-4333-8333-333333333334", "/demo/dried.jpg")],
      ),
      product(
        "33333333-3333-4333-8333-333333333335",
        categories[2].id,
        "Коробка с цветами",
        "Низкая композиция в круглой коробке. Крышка в комплекте.",
        32000,
        4,
        [photo("44444444-4444-4444-8444-444444444446", "33333333-3333-4333-8333-333333333335", "/demo/box.jpg")],
      ),
      product(
        "33333333-3333-4333-8333-333333333336",
        categories[3].id,
        "Открытка",
        "Плотная хлопковая открытка. Фразу напишете в форме заказа.",
        1500,
        5,
        [photo("44444444-4444-4444-8444-444444444447", "33333333-3333-4333-8333-333333333336", "/demo/card.jpg")],
      ),
    ],
  }
}

export function previewOrders(): ShopOrder[] {
  return [
    {
      id: "66666666-6666-4666-8666-666666666661",
      store_id: STORE_ID,
      order_number: "A7K2QM",
      status: "new",
      customer_name: "Алия",
      customer_phone: "+77010000001",
      fulfillment: "delivery",
      address: "Пример, ул. Абая 10",
      delivery_zone_id: "center",
      delivery_zone_name: "В пределах города",
      delivery_price: 2000,
      scheduled_date: "2026-11-25",
      scheduled_time: "14:00",
      comment: "Позвонить за 10 минут",
      extra_fields: { card_text: "С днём рождения", recipient_name: "Айгерим" },
      items: [
        { product_id: "33333333-3333-4333-8333-333333333331", name: "Пионовый сад", qty: 1, price: 28000 },
      ],
      subtotal: 28000,
      total: 30000,
      created_at: "2026-11-24T08:00:00.000Z",
    },
    {
      id: "66666666-6666-4666-8666-666666666662",
      store_id: STORE_ID,
      order_number: "B3N8LD",
      status: "confirmed",
      customer_name: "Данияр",
      customer_phone: "+77010000002",
      fulfillment: "pickup",
      address: "",
      delivery_zone_id: null,
      delivery_zone_name: null,
      delivery_price: 0,
      scheduled_date: "2026-11-23",
      scheduled_time: "18:00",
      comment: "",
      extra_fields: {},
      items: [
        { product_id: "33333333-3333-4333-8333-333333333333", name: "Красные розы", qty: 1, price: 22000 },
      ],
      subtotal: 22000,
      total: 22000,
      created_at: "2026-11-23T10:00:00.000Z",
    },
  ]
}

export function previewEvents() {
  const store = STORE_ID
  const rows = []
  const kinds = ["store_view", "product_view", "add_to_cart", "whatsapp_click"] as const
  for (let day = 0; day < 7; day += 1) {
    const date = `2026-11-${String(18 + day).padStart(2, "0")}`
    for (const kind of kinds) {
      const count = kind === "store_view" ? 4 : kind === "whatsapp_click" ? 1 : 2
      for (let n = 0; n < count; n += 1) {
        rows.push({
          id: `${kind}-${day}-${n}`,
          store_id: store,
          event_type: kind,
          product_id: kind === "store_view" ? null : "33333333-3333-4333-8333-333333333331",
          amount: kind === "whatsapp_click" ? 28000 : null,
          source: n % 2 === 0 ? "прямой" : "instagram",
          created_at: `${date}T09:00:00.000Z`,
        })
      }
    }
  }
  return rows
}
