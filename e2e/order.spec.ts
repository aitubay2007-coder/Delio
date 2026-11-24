import { expect, test } from "@playwright/test"

test("landing explains the product and links to the example store", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByRole("heading", { level: 1 })).toContainText("WhatsApp")
  await page.getByRole("link", { name: "Открыть пример магазина" }).click()
  await expect(page).toHaveURL(/\/s\/primer/)
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Цветочная лавка")
})

test("shopper builds a cart and gets a WhatsApp order link", async ({ page }) => {
  await page.goto("/s/primer")
  await page.getByRole("button", { name: "В корзину" }).first().click()
  await page.getByRole("button", { name: "Корзина" }).click()
  await expect(page.getByRole("heading", { name: "Корзина" })).toBeVisible()
  await page.getByRole("button", { name: "Оформить" }).click()

  await page.getByLabel("Имя", { exact: true }).fill("Алия")
  await page.getByLabel("Телефон", { exact: true }).fill("+77010000001")
  await page.getByRole("button", { name: "Дальше" }).click()
  await page.getByLabel("Адрес", { exact: true }).fill("ул. Абая 10")
  await page.getByRole("button", { name: "Дальше" }).click()
  await page.getByRole("button", { name: /Сегодня/ }).click()
  await page.getByRole("button", { name: "14:00" }).click()
  await page.getByRole("button", { name: "Сообщение для WhatsApp" }).click()

  const message = page.locator("pre")
  await expect(message).toContainText("Пионовый сад")
  await expect(message).toContainText("ул. Абая 10")
  await expect(message).toContainText("Итого")

  const popup = page.waitForRequest((request) => request.url().startsWith("https://wa.me/"))
  await page.getByRole("button", { name: "Отправить в WhatsApp" }).click()
  const request = await popup
  const url = decodeURIComponent(request.url())
  expect(url).toContain("https://wa.me/77000000000")
  expect(url).toContain("Пионовый сад")
  expect(url).toContain("Алия")
  expect(url).toContain("ул. Абая 10")
  expect(url).toContain("Итого")
})
