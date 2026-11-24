import { UpdatePasswordScreen } from "@/components/auth/auth-screens"
import { ru } from "@/i18n/ru"

export const metadata = { title: ru.auth.resetTitle, robots: { index: false, follow: false } }

export default function Page() {
  return <UpdatePasswordScreen />
}
