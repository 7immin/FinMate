import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchAppState } from "@/lib/server/state";
import { GuestLanguageProvider } from "@/lib/i18n/GuestLanguageContext";
import { GuestHome } from "@/components/guest/GuestHome";

/**
 * 앱의 문.
 *
 * 로그인한 사람은 지금까지처럼 온보딩 여부에 따라 갈린다. 로그인하지
 * 않은 사람은 로그인 화면으로 튕기지 않고 비로그인 홈을 본다 —
 * 질문 하나는 가입 없이 던질 수 있어야 이 앱이 무엇을 해 주는지
 * 알고 나서 가입할지 정할 수 있다.
 */
export default async function RootPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <GuestLanguageProvider>
        <GuestHome />
      </GuestLanguageProvider>
    );
  }

  const { onboarded } = await fetchAppState();
  redirect(onboarded ? "/home" : "/onboarding");
}
