import { GuestLanguageProvider } from "@/lib/i18n/GuestLanguageContext";

/**
 * 비로그인 화면들의 껍데기.
 *
 * (app) 그룹의 AppStateProvider를 쓸 수 없다 — 그 안에는 로그인해야만
 * 존재하는 프로필·금융여권이 들어 있기 때문이다. 여기서는 언어 하나만
 * 들고 있으면 되고, useTranslation이 그 언어를 알아서 집는다.
 */
export default function GuestLayout({ children }: { children: React.ReactNode }) {
  return <GuestLanguageProvider>{children}</GuestLanguageProvider>;
}
