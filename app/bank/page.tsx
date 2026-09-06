import { GuestLanguageProvider } from "@/lib/i18n/GuestLanguageContext";
import { BankConsole } from "@/components/bank/BankConsole";

/**
 * 은행 창구 화면.
 *
 * (app) 그룹 밖에 둔다. 이 화면을 쓰는 사람은 학생이 아니라 은행 직원이고,
 * 그 사람에게는 이 앱의 계정이 없다 — 계정을 만들라고 하면 창구에서 아무도
 * 쓰지 않는다. 학생 앱의 하단 탭도 그리지 않는다.
 */
export default function BankPage() {
  return (
    <GuestLanguageProvider>
      <BankConsole />
    </GuestLanguageProvider>
  );
}
