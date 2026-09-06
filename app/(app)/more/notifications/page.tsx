"use client";

import { TopBar } from "@/components/layout/TopBar";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Switch } from "@/components/ui/Switch";
import { useAppState } from "@/lib/state/AppStateContext";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { NotificationSettings } from "@/lib/types";

const ROWS: { key: keyof NotificationSettings; i18nKey: string }[] = [
  { key: "paymentDue", i18nKey: "paymentDue" },
  { key: "passportLevel", i18nKey: "passportLevel" },
  { key: "marketing", i18nKey: "marketing" },
];

export default function NotificationSettingsPage() {
  const { state, setNotificationSettings } = useAppState();
  const { t } = useTranslation();
  const settings = state.profile.notificationSettings;

  function toggle(key: keyof NotificationSettings, value: boolean) {
    setNotificationSettings({ ...settings, [key]: value });
  }

  return (
    <AppShell className="flex flex-col">
      <TopBar title={t("more.notifications.title")} />
      <div className="space-y-6 px-5 pb-10 pt-2">
        <p className="text-sm text-foreground-muted">{t("more.notifications.description")}</p>

        <Card className="divide-y divide-border">
          {ROWS.map(({ key, i18nKey }) => (
            <div key={key} className="flex items-center gap-3 py-4 first:pt-0 last:pb-0">
              <div className="flex-1">
                <p className="text-[15px] font-medium text-foreground">
                  {t(`more.notifications.${i18nKey}.label`)}
                </p>
                <p className="mt-0.5 text-[13px] text-foreground-muted">
                  {t(`more.notifications.${i18nKey}.description`)}
                </p>
              </div>
              <Switch checked={settings[key]} onChange={(value) => toggle(key, value)} />
            </div>
          ))}
        </Card>
      </div>
    </AppShell>
  );
}
