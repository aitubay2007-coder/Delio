import { SignupScreen } from "@/components/auth/auth-screens"
import { ru } from "@/i18n/ru"

export const metadata = { title: ru.auth.signupTitle }

export default function Page() {
  return <SignupScreen />
}
